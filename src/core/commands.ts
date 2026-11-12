import type { Roles } from './chat-message'
import type { Config, Role } from './config'

export interface Command {
  type: 'jump' | 'bump' | 'reset' | 'resetScores'
  /** Zweites Wort der Nachricht – Emote-Kandidat für AP 3. */
  arg: string | null
}

export function parseCommand(text: string, config: Config): Command | null {
  const [first = '', second] = text.split(/\s+/)
  if (!first.startsWith('!')) return null
  const name = first.slice(1).toLowerCase()
  const arg = second ?? null

  if (name === config.cmdJump && config.modes.includes('jump')) return { type: 'jump', arg }
  if (name === config.cmdBump && config.modes.includes('bump')) return { type: 'bump', arg }
  if (name === config.cmdReset) return { type: 'reset', arg }
  if (name === config.cmdResetScores) return { type: 'resetScores', arg }
  return null
}

/**
 * `!jump !jump`: Gibt es ein Emote, das genau wie der Jump-Befehl heißt,
 * fällt nur dieses Emote – ohne Gleiter.
 */
export function jumpsWithGlider(arg: string | null, emote: string | null, config: Config): boolean {
  return emote === null || arg !== `!${config.cmdJump}`
}

export function isAllowed(roles: Roles, perm: Role[]): boolean {
  if (roles.broadcaster || perm.includes('all')) return true
  return perm.some((role) => role !== 'all' && roles[role])
}
