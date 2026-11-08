import { describe, expect, it } from 'vitest'
import type { ChatMessage, Roles } from './chat-message'
import type { Command } from './commands'
import { parseConfig } from './config'
import { Round } from './round'

const round = (query = '') => {
  const result = parseConfig(new URLSearchParams(`channel=elricco1978&${query}&perm=all`))
  if (!result.ok) throw new Error(result.error)
  return new Round(result.config)
}

const NO_ROLES: Roles = { broadcaster: false, mod: false, vip: false, sub: false }

const from = (login: string, roles: Partial<Roles> = {}): ChatMessage => ({
  login,
  displayName: login,
  color: null,
  roles: { ...NO_ROLES, ...roles },
  text: '',
  emotes: '',
})

const JUMP: Command = { type: 'jump', arg: null }
const BUMP: Command = { type: 'bump', arg: null }
const RESET: Command = { type: 'reset', arg: null }

describe('Round – Spielbefehle', () => {
  it('lässt eine Person spawnen', () => {
    const message = from('anna')
    expect(round().handle(message, { type: 'jump', arg: 'Kappa' }, 0)).toEqual({
      type: 'spawn',
      mode: 'jump',
      message,
      arg: 'Kappa',
    })
  })

  it('lässt jede Person nur einmal pro Runde spielen – egal welcher Modus', () => {
    const game = round()
    game.handle(from('anna'), JUMP, 0)
    expect(game.handle(from('anna'), BUMP, 1000)).toEqual({
      type: 'ignored',
      reason: 'already-played',
      login: 'anna',
    })
    expect(game.handle(from('bert'), BUMP, 1000).type).toBe('spawn')
  })

  it('lehnt Spielbefehle ohne Berechtigung ab', () => {
    const game = round('perm=mod')
    expect(game.handle(from('anna'), JUMP, 0)).toEqual({
      type: 'ignored',
      reason: 'no-permission',
      login: 'anna',
    })
    expect(game.handle(from('mia', { mod: true }), JUMP, 0).type).toBe('spawn')
  })

  it('merkt sich, ob in der Runde gebumpt wurde', () => {
    const game = round()
    game.handle(from('anna'), JUMP, 0)
    expect(game.bumpActive).toBe(false)
    game.handle(from('bert'), BUMP, 0)
    expect(game.bumpActive).toBe(true)
  })
})

describe('Round – Reset', () => {
  it('setzt per Befehl zurück, danach darf jeder wieder', () => {
    const game = round()
    game.handle(from('anna'), BUMP, 0)
    expect(game.handle(from('mia', { mod: true }), RESET, 0)).toEqual({
      type: 'reset',
      reason: 'command',
    })
    expect(game.bumpActive).toBe(false)
    expect(game.handle(from('anna'), JUMP, 0).type).toBe('spawn')
  })

  it('setzt auch eine leere Runde per Befehl zurück', () => {
    expect(round().handle(from('mia', { mod: true }), RESET, 0).type).toBe('reset')
  })

  it('lehnt den Reset ohne reset_perm ab, der Broadcaster darf immer', () => {
    const game = round('reset_perm=vip')
    expect(game.handle(from('mia', { mod: true }), RESET, 0)).toEqual({
      type: 'ignored',
      reason: 'no-permission',
      login: 'mia',
    })
    expect(game.handle(from('tim', { broadcaster: true }), RESET, 0).type).toBe('reset')
  })

  it('setzt nach reset_after Sekunden Ruhe automatisch zurück', () => {
    const game = round('reset_after=30')
    game.handle(from('anna'), JUMP, 0)
    expect(game.tick(29_999)).toBeNull()
    expect(game.tick(30_000)).toEqual({ type: 'reset', reason: 'auto' })
    expect(game.handle(from('anna'), JUMP, 30_001).type).toBe('spawn')
  })

  it('startet den Ruhe-Timer mit jedem angenommenen Spielbefehl neu', () => {
    const game = round('reset_after=30')
    game.handle(from('anna'), JUMP, 0)
    game.handle(from('bert'), JUMP, 20_000)
    expect(game.tick(30_000)).toBeNull()
    expect(game.tick(50_000)?.type).toBe('reset')
  })

  it('verlängert die Runde nicht durch abgelehnte Befehle', () => {
    const game = round('reset_after=30')
    game.handle(from('anna'), JUMP, 0)
    game.handle(from('anna'), JUMP, 20_000)
    expect(game.tick(30_000)?.type).toBe('reset')
  })

  it('setzt eine leere Runde nicht automatisch zurück', () => {
    expect(round('reset_after=30').tick(60_000)).toBeNull()
  })

  it('setzt bei reset_after=0 nie automatisch zurück', () => {
    const game = round('reset_after=0')
    game.handle(from('anna'), JUMP, 0)
    expect(game.tick(3_600_000)).toBeNull()
  })

  it('meldet den automatischen Reset nur einmal', () => {
    const game = round('reset_after=30')
    game.handle(from('anna'), JUMP, 0)
    game.tick(30_000)
    expect(game.tick(31_000)).toBeNull()
  })
})
