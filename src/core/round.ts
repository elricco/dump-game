import type { ChatMessage } from './chat-message'
import { isAllowed, type Command } from './commands'
import type { Config, Mode } from './config'

export type RoundEvent =
  | { type: 'spawn'; mode: Mode; message: ChatMessage; arg: string | null }
  | { type: 'reset'; reason: 'command' | 'auto' }
  | { type: 'ignored'; reason: 'no-permission' | 'already-played'; login: string }

/** Rundenlogik: einmal pro Person, Reset per Befehl oder nach Ruhezeit. Zeit in ms. */
export class Round {
  private readonly played = new Set<string>()
  private lastPlayAt = 0
  bumpActive = false

  constructor(private readonly config: Config) {}

  handle(message: ChatMessage, command: Command, now: number): RoundEvent {
    const { login, roles } = message

    if (command.type === 'reset') {
      if (!isAllowed(roles, this.config.resetPerm))
        return { type: 'ignored', reason: 'no-permission', login }
      this.clear()
      return { type: 'reset', reason: 'command' }
    }

    if (!isAllowed(roles, this.config.perm))
      return { type: 'ignored', reason: 'no-permission', login }
    if (this.played.has(login)) return { type: 'ignored', reason: 'already-played', login }

    this.played.add(login)
    this.lastPlayAt = now
    if (command.type === 'bump') this.bumpActive = true
    return { type: 'spawn', mode: command.type, message, arg: command.arg }
  }

  tick(now: number): RoundEvent | null {
    const resetAfterMs = this.config.resetAfter * 1000
    if (resetAfterMs === 0 || this.played.size === 0) return null
    if (now - this.lastPlayAt < resetAfterMs) return null
    this.clear()
    return { type: 'reset', reason: 'auto' }
  }

  private clear(): void {
    this.played.clear()
    this.bumpActive = false
  }
}
