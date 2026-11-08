import type { Roles } from './chat-message'
import type { Config, Role } from './config'

export interface Command {
  type: 'jump' | 'bump' | 'reset'
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
  return null
}

export function isAllowed(roles: Roles, perm: Role[]): boolean {
  if (roles.broadcaster || perm.includes('all')) return true
  return perm.some((role) => role !== 'all' && roles[role])
}
