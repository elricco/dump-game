import { describe, expect, it } from 'vitest'
import type { Roles } from './chat-message'
import { isAllowed, jumpsWithGlider, parseCommand } from './commands'
import { parseConfig, type Config } from './config'

const config = (query = '') => {
  const result = parseConfig(new URLSearchParams(`channel=elricco1978&${query}`))
  if (!result.ok) throw new Error(result.error)
  return result.config
}

describe('parseCommand', () => {
  const defaults: Config = config()

  it.each([
    ['!jump', { type: 'jump', arg: null }],
    ['!bump', { type: 'bump', arg: null }],
    ['!resetgame', { type: 'reset', arg: null }],
    ['!resetscores', { type: 'resetScores', arg: null }],
    ['!JUMP', { type: 'jump', arg: null }],
    ['!jump Kappa', { type: 'jump', arg: 'Kappa' }],
    ['!bump   catJAM  noch mehr', { type: 'bump', arg: 'catJAM' }],
  ])('erkennt %j', (text, expected) => {
    expect(parseCommand(text, defaults)).toEqual(expected)
  })

  it.each(['jump', 'hallo !jump', '!jumper', '!', ''])('ignoriert %j', (text) => {
    expect(parseCommand(text, defaults)).toBeNull()
  })

  it('nutzt eigene Befehlsnamen', () => {
    const custom = config('cmd_jump=sprung&cmd_reset=neu')
    expect(parseCommand('!sprung', custom)).toEqual({ type: 'jump', arg: null })
    expect(parseCommand('!neu', custom)).toEqual({ type: 'reset', arg: null })
    expect(parseCommand('!jump', custom)).toBeNull()
  })

  it('ignoriert Modi, die nicht aktiv sind', () => {
    const jumpOnly = config('modes=jump')
    expect(parseCommand('!bump', jumpOnly)).toBeNull()
    expect(parseCommand('!resetgame', jumpOnly)).toEqual({ type: 'reset', arg: null })
  })
})

describe('isAllowed', () => {
  const viewer: Roles = { broadcaster: false, mod: false, vip: false, sub: false }

  it('erlaubt dem Broadcaster immer', () => {
    expect(isAllowed({ ...viewer, broadcaster: true }, ['mod'])).toBe(true)
  })

  it('erlaubt jedem bei all', () => {
    expect(isAllowed(viewer, ['all'])).toBe(true)
  })

  it.each([
    ['mod', { mod: true }, true],
    ['vip', { vip: true }, true],
    ['sub', { sub: true }, true],
    ['mod', { vip: true }, false],
    ['mod', {}, false],
  ] as const)('perm=%s mit Rollen %j → %s', (perm, roles, expected) => {
    expect(isAllowed({ ...viewer, ...roles }, [perm])).toBe(expected)
  })

  it('reicht eine passende Rolle aus mehreren', () => {
    expect(isAllowed({ ...viewer, sub: true }, ['mod', 'sub'])).toBe(true)
  })
})

describe('jumpsWithGlider', () => {
  const url = 'https://cdn.7tv.app/emote/x/4x.webp'

  it.each([
    ['!jump', url, '', false],
    ['!jump', null, '', true],
    ['jump', url, '', true],
    ['Kappa', url, '', true],
    [null, null, '', true],
    ['!hop', url, 'cmd_jump=hop', false],
    ['!jump', url, 'cmd_jump=hop', true],
  ] as const)('arg %j, Emote %j, %j → %s', (arg, emote, query, expected) => {
    expect(jumpsWithGlider(arg, emote, config(query))).toBe(expected)
  })
})
