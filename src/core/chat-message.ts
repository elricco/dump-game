import type { IrcLine } from './irc-parser'

export interface Roles {
  broadcaster: boolean
  mod: boolean
  vip: boolean
  sub: boolean
}

export interface ChatMessage {
  login: string
  displayName: string
  color: string | null
  roles: Roles
  text: string
  /** Roher emotes-Tag, z. B. "25:6-10" – Auflösung in AP 3. */
  emotes: string
}

const COLOR = /^#[0-9a-f]{6}$/
const INVISIBLE_SUFFIX = /\u{E0000}/gu

function readRoles(tags: Record<string, string>): Roles {
  const badges = new Set((tags.badges ?? '').split(',').map((badge) => badge.split('/')[0]))
  return {
    broadcaster: badges.has('broadcaster'),
    mod: badges.has('moderator') || tags.mod === '1',
    vip: badges.has('vip'),
    sub: badges.has('subscriber') || badges.has('founder'),
  }
}

/** Macht aus einer PRIVMSG-Zeile eine Chat-Nachricht; alles andere ergibt null. */
export function toChatMessage(line: IrcLine): ChatMessage | null {
  if (line.command !== 'PRIVMSG' || line.prefix === null) return null

  const login = (line.prefix.split('!')[0] ?? '').toLowerCase()
  const color = (line.tags.color ?? '').toLowerCase()

  return {
    login,
    displayName: line.tags['display-name'] || login,
    color: COLOR.test(color) ? color : null,
    roles: readRoles(line.tags),
    text: (line.trailing ?? '').replace(INVISIBLE_SUFFIX, '').trim(),
    emotes: line.tags.emotes ?? '',
  }
}
