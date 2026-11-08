import { describe, expect, it } from 'vitest'
import { toChatMessage } from './chat-message'
import { parseIrcLine } from './irc-parser'

const msg = (tags: string, text = '!jump', nick = 'elricco') => {
  const line = parseIrcLine(
    `@${tags} :${nick}!${nick}@${nick}.tmi.twitch.tv PRIVMSG #elricco1978 :${text}`,
  )
  const message = line && toChatMessage(line)
  if (!message) throw new Error('keine Chat-Nachricht')
  return message
}

const NO_ROLES = { broadcaster: false, mod: false, vip: false, sub: false }

describe('toChatMessage', () => {
  it('liefert null für alles außer PRIVMSG', () => {
    const line = parseIrcLine('PING :tmi.twitch.tv')
    expect(line && toChatMessage(line)).toBeNull()
  })

  it('liest Login, Anzeigename, Farbe, Text und Emote-Tag', () => {
    expect(msg('color=#8A2BE2;display-name=ElRicco;emotes=25:6-10', '!jump Kappa')).toEqual({
      login: 'elricco',
      displayName: 'ElRicco',
      color: '#8a2be2',
      roles: NO_ROLES,
      text: '!jump Kappa',
      emotes: '25:6-10',
    })
  })

  it('nimmt den Login als Namen, wenn display-name fehlt', () => {
    expect(msg('color=').displayName).toBe('elricco')
  })

  it.each(['', 'red', '#fff', '#12345g', '#1234567'])('verwirft die Farbe %j', (color) => {
    expect(msg(`color=${color}`).color).toBeNull()
  })

  it.each([
    ['broadcaster/1', { broadcaster: true }],
    ['moderator/1', { mod: true }],
    ['vip/1', { vip: true }],
    ['subscriber/12', { sub: true }],
    ['founder/0', { sub: true }],
    ['moderator/1,subscriber/3000', { mod: true, sub: true }],
  ])('liest Rollen aus badges=%s', (badges, roles) => {
    expect(msg(`badges=${badges}`).roles).toEqual({ ...NO_ROLES, ...roles })
  })

  it('erkennt Mods auch am Tag mod=1', () => {
    expect(msg('badges=;mod=1').roles.mod).toBe(true)
  })

  it('entfernt das Unsichtbar-Zeichen U+E0000 und Rand-Leerzeichen', () => {
    expect(msg('color=', '!jump \u{E0000} ').text).toBe('!jump')
  })
})
