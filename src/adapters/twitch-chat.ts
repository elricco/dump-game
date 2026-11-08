import { toChatMessage, type ChatMessage } from '../core/chat-message'
import { parseIrcLine, splitIrcFrame, type IrcLine } from '../core/irc-parser'

export type ChatStatus = 'connecting' | 'connected' | 'reconnecting'

/** Der Teil von WebSocket, den wir brauchen – in Tests durch ein Fake ersetzbar. */
export interface SocketLike {
  onopen: (() => void) | null
  onmessage: ((event: { data: unknown }) => void) | null
  onclose: (() => void) | null
  send(data: string): void
  close(): void
}

export interface ChatOptions {
  channel: string
  createSocket: (url: string) => SocketLike
  schedule: (run: () => void, ms: number) => void
  random: () => number
  onMessage: (message: ChatMessage) => void
  onRoom: (roomId: string) => void
  onStatus: (status: ChatStatus) => void
}

const CHAT_URL = 'wss://irc-ws.chat.twitch.tv:443'
const MAX_WAIT_MS = 30_000

/** Liest den Twitch-Chat anonym (ohne Token) und verbindet bei Abbruch neu. */
export function connectChat(options: ChatOptions): { stop(): void } {
  const target = `#${options.channel}`
  let socket: SocketLike
  let attempt = 0
  let stopped = false
  let roomReported = false

  const connect = () => {
    roomReported = false
    options.onStatus('connecting')
    socket = options.createSocket(CHAT_URL)
    socket.onopen = () => {
      socket.send('CAP REQ :twitch.tv/tags twitch.tv/commands')
      socket.send('PASS SCHMOOPIIE')
      socket.send(`NICK justinfan${Math.floor(options.random() * 100_000)}`)
      socket.send(`JOIN ${target}`)
    }
    socket.onmessage = (event) => {
      if (typeof event.data !== 'string') return
      for (const raw of splitIrcFrame(event.data)) {
        const line = parseIrcLine(raw)
        if (line) handle(line)
      }
    }
    socket.onclose = () => reconnect()
  }

  const reconnect = () => {
    socket.onopen = socket.onmessage = socket.onclose = null
    socket.close()
    if (stopped) return
    const wait = Math.min(1000 * 2 ** attempt, MAX_WAIT_MS)
    attempt += 1
    options.onStatus('reconnecting')
    options.schedule(connect, wait)
  }

  const handle = (line: IrcLine) => {
    switch (line.command) {
      case 'PING':
        socket.send(`PONG :${line.trailing ?? ''}`)
        return
      case 'RECONNECT':
        reconnect()
        return
      case '366':
        attempt = 0
        options.onStatus('connected')
        return
      case 'ROOMSTATE': {
        const roomId = line.tags['room-id']
        if (roomId && !roomReported) {
          roomReported = true
          options.onRoom(roomId)
        }
        return
      }
      case 'PRIVMSG': {
        const message = line.params[0] === target ? toChatMessage(line) : null
        if (message) options.onMessage(message)
      }
    }
  }

  connect()

  return {
    stop() {
      stopped = true
      reconnect()
    },
  }
}

/** Echter Browser-WebSocket hinter SocketLike. */
export function browserSocket(url: string): SocketLike {
  const ws = new WebSocket(url)
  const socket: SocketLike = {
    onopen: null,
    onmessage: null,
    onclose: null,
    send: (data) => ws.send(data),
    close: () => ws.close(),
  }
  ws.onopen = () => socket.onopen?.()
  ws.onmessage = (event: MessageEvent) => socket.onmessage?.({ data: event.data })
  ws.onclose = () => socket.onclose?.()
  return socket
}
