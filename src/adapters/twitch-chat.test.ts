import { beforeEach, describe, expect, it } from 'vitest'
import type { ChatMessage } from '../core/chat-message'
import { connectChat, type ChatStatus, type SocketLike } from './twitch-chat'

class FakeSocket implements SocketLike {
  sent: string[] = []
  closed = false
  onopen: (() => void) | null = null
  onmessage: ((event: { data: unknown }) => void) | null = null
  onclose: (() => void) | null = null
  constructor(readonly url: string) {}
  send(data: string) {
    this.sent.push(data)
  }
  close() {
    this.closed = true
  }
  receive(...lines: string[]) {
    this.onmessage?.({ data: lines.map((line) => `${line}\r\n`).join('') })
  }
}

let sockets: FakeSocket[]
let timers: { ms: number; run: () => void }[]
let messages: ChatMessage[]
let rooms: string[]
let statuses: ChatStatus[]

const start = () =>
  connectChat({
    channel: 'elricco1978',
    createSocket: (url) => {
      const socket = new FakeSocket(url)
      sockets.push(socket)
      return socket
    },
    schedule: (run, ms) => timers.push({ ms, run }),
    random: () => 0.5,
    onMessage: (message) => messages.push(message),
    onRoom: (roomId) => rooms.push(roomId),
    onStatus: (status) => statuses.push(status),
  })

const current = () => {
  const socket = sockets.at(-1)
  if (!socket) throw new Error('kein Socket')
  return socket
}

const JOINED = ':justinfan.tmi.twitch.tv 366 justinfan50000 #elricco1978 :End of /NAMES list'

const dropAndWait = () => {
  current().onclose?.()
  const timer = timers.shift()
  if (!timer) throw new Error('kein Timer')
  timer.run()
  return timer.ms
}

describe('connectChat', () => {
  beforeEach(() => {
    sockets = []
    timers = []
    messages = []
    rooms = []
    statuses = []
  })

  it('meldet sich anonym an und betritt den Kanal', () => {
    start()
    current().onopen?.()
    expect(current().url).toBe('wss://irc-ws.chat.twitch.tv:443')
    expect(current().sent).toEqual([
      'CAP REQ :twitch.tv/tags twitch.tv/commands',
      'PASS SCHMOOPIIE',
      'NICK justinfan50000',
      'JOIN #elricco1978',
    ])
    expect(statuses).toEqual(['connecting'])
  })

  it('meldet connected nach dem JOIN-Ende (366)', () => {
    start()
    current().receive(JOINED)
    expect(statuses).toEqual(['connecting', 'connected'])
  })

  it('beantwortet PING mit PONG', () => {
    start()
    current().receive('PING :tmi.twitch.tv')
    expect(current().sent).toContain('PONG :tmi.twitch.tv')
  })

  it('meldet die room-id aus ROOMSTATE einmal pro Verbindung', () => {
    start()
    current().receive('@room-id=12345;emote-only=0 :tmi.twitch.tv ROOMSTATE #elricco1978')
    current().receive('@room-id=12345;slow=10 :tmi.twitch.tv ROOMSTATE #elricco1978')
    expect(rooms).toEqual(['12345'])
  })

  it('reicht Chat-Nachrichten des Kanals weiter, auch mehrere pro Frame', () => {
    start()
    current().receive(
      '@display-name=Anna :anna!anna@anna.tmi.twitch.tv PRIVMSG #elricco1978 :!jump',
      '@display-name=Bert :bert!bert@bert.tmi.twitch.tv PRIVMSG #anderer :!jump',
      '@display-name=Cem :cem!cem@cem.tmi.twitch.tv PRIVMSG #elricco1978 :!bump',
    )
    expect(messages.map((message) => message.login)).toEqual(['anna', 'cem'])
  })

  it('verbindet nach Abbruch neu, mit 1 s, 2 s, 4 s … bis 30 s', () => {
    start()
    const waits = Array.from({ length: 7 }, () => dropAndWait())
    expect(waits).toEqual([1000, 2000, 4000, 8000, 16000, 30000, 30000])
    expect(sockets).toHaveLength(8)
    expect(statuses.at(-1)).toBe('connecting')
    expect(statuses).toContain('reconnecting')
  })

  it('beginnt nach erfolgreichem JOIN wieder bei 1 s', () => {
    start()
    dropAndWait()
    dropAndWait()
    current().receive(JOINED)
    expect(dropAndWait()).toBe(1000)
  })

  it('verbindet auf Server-RECONNECT neu', () => {
    start()
    current().receive(':tmi.twitch.tv RECONNECT')
    expect(sockets[0]?.closed).toBe(true)
    expect(timers).toHaveLength(1)
  })

  it('verbindet nach stop() nicht mehr neu', () => {
    const chat = start()
    chat.stop()
    current().onclose?.()
    expect(sockets[0]?.closed).toBe(true)
    expect(timers).toHaveLength(0)
  })
})
