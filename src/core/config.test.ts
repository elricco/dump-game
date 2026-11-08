import { describe, expect, it } from 'vitest'
import { parseConfig } from './config'

const parse = (query: string) => parseConfig(new URLSearchParams(query))

describe('parseConfig – channel', () => {
  it('meldet einen Fehler, wenn channel fehlt', () => {
    expect(parse('')).toEqual({ ok: false, error: 'channel fehlt' })
  })
})

const DEFAULTS = {
  channel: 'elricco1978',
  modes: ['jump', 'bump'],
  vol: 0.5,
  scale: 1,
  theme: 'target',
  land: null,
  death: null,
  sndJump: null,
  sndHit: null,
  sndMiss: null,
  driftMin: 1,
  driftMax: 4,
  sinkMin: 2,
  sinkMax: 4,
  straight: 0.1,
  wallslide: 0.1,
  difficulty: 100,
  move: true,
  highscore: 'off',
  perm: ['mod'],
  resetPerm: ['mod'],
  resetAfter: 30,
  cmdJump: 'jump',
  cmdBump: 'bump',
  cmdReset: 'resetgame',
  debug: false,
}

describe('parseConfig – Defaults', () => {
  it('liefert mit nur channel die vollständige Default-Config ohne Warnungen', () => {
    expect(parse('channel=elricco1978')).toEqual({ ok: true, config: DEFAULTS, warnings: [] })
  })

  it('schreibt den channel klein', () => {
    const result = parse('channel=ElRicco1978')
    expect(result.ok && result.config.channel).toBe('elricco1978')
  })

  it.each(['ab', 'a'.repeat(26), 'elric-co', 'elric co', '#elricco'])(
    'meldet einen Fehler bei ungültigem channel %j',
    (channel) => {
      expect(parse(`channel=${encodeURIComponent(channel)}`)).toEqual({
        ok: false,
        error: 'channel ungültig',
      })
    },
  )
})

const ok = (query: string) => {
  const result = parse(`channel=elricco1978&${query}`)
  if (!result.ok) throw new Error(`unerwarteter Fehler: ${result.error}`)
  return result
}

describe('parseConfig – Zahlen', () => {
  it.each([
    ['vol', 'vol', '0.8', 0.8],
    ['scale', 'scale', '1.5', 1.5],
    ['drift_min', 'driftMin', '0', 0],
    ['drift_max', 'driftMax', '20', 20],
    ['sink_min', 'sinkMin', '0.5', 0.5],
    ['sink_max', 'sinkMax', '6', 6],
    ['straight', 'straight', '1', 1],
    ['wallslide', 'wallslide', '0', 0],
    ['difficulty', 'difficulty', '95', 95],
    ['reset_after', 'resetAfter', '0', 0],
  ] as const)('übernimmt gültiges %s', (param, key, raw, expected) => {
    const result = ok(`${param}=${raw}`)
    expect(result.config[key]).toBe(expected)
    expect(result.warnings).toEqual([])
  })

  it.each([
    ['vol', 'vol', '1.1', 0.5],
    ['vol', 'vol', 'laut', 0.5],
    ['vol', 'vol', '', 0.5],
    ['scale', 'scale', '0.4', 1],
    ['scale', 'scale', '3.5', 1],
    ['drift_max', 'driftMax', '21', 4],
    ['sink_min', 'sinkMin', '0.4', 2],
    ['straight', 'straight', '-0.1', 0.1],
    ['difficulty', 'difficulty', '49', 100],
    ['reset_after', 'resetAfter', '601', 30],
    ['reset_after', 'resetAfter', 'Infinity', 30],
  ] as const)('verwirft %s=%j und nimmt den Default', (param, key, raw, fallback) => {
    const result = ok(`${param}=${encodeURIComponent(raw)}`)
    expect(result.config[key]).toBe(fallback)
    expect(result.warnings).toEqual([
      `${param}: ungültiger Wert "${raw}", Default ${fallback} verwendet`,
    ])
  })
})

describe('parseConfig – Auswahl und Schalter', () => {
  it.each([
    ['theme', 'theme', 'lava', 'lava'],
    ['highscore', 'highscore', 'week', 'week'],
    ['highscore', 'highscore', 'forever', 'forever'],
    ['move', 'move', '0', false],
    ['debug', 'debug', '1', true],
  ] as const)('übernimmt gültiges %s=%s', (param, key, raw, expected) => {
    const result = ok(`${param}=${raw}`)
    expect(result.config[key]).toBe(expected)
    expect(result.warnings).toEqual([])
  })

  it.each([
    ['theme', 'theme', 'neon', 'target'],
    ['theme', 'theme', 'LAVA', 'target'],
    ['highscore', 'highscore', 'month', 'off'],
    ['move', 'move', 'true', true],
    ['debug', 'debug', 'yes', false],
  ] as const)('verwirft %s=%j und nimmt den Default', (param, key, raw, fallback) => {
    const result = ok(`${param}=${raw}`)
    expect(result.config[key]).toBe(fallback)
    expect(result.warnings).toEqual([
      `${param}: ungültiger Wert "${raw}", Default ${String(fallback)} verwendet`,
    ])
  })
})

describe('parseConfig – Listen', () => {
  it.each([
    ['modes', 'modes', 'jump', ['jump']],
    ['modes', 'modes', 'bump,jump', ['bump', 'jump']],
    ['perm', 'perm', 'mod,vip,sub', ['mod', 'vip', 'sub']],
    ['perm', 'perm', 'all', ['all']],
    ['reset_perm', 'resetPerm', 'vip', ['vip']],
    ['perm', 'perm', 'mod,mod', ['mod']],
  ] as const)('übernimmt gültiges %s=%s', (param, key, raw, expected) => {
    const result = ok(`${param}=${raw}`)
    expect(result.config[key]).toEqual(expected)
    expect(result.warnings).toEqual([])
  })

  it.each([
    ['modes', 'modes', '', ['jump', 'bump']],
    ['modes', 'modes', 'jump,fly', ['jump', 'bump']],
    ['perm', 'perm', 'admin', ['mod']],
    ['reset_perm', 'resetPerm', 'mod,', ['mod']],
  ] as const)('verwirft %s=%j und nimmt den Default', (param, key, raw, fallback) => {
    const result = ok(`${param}=${raw}`)
    expect(result.config[key]).toEqual(fallback)
    expect(result.warnings).toEqual([
      `${param}: ungültiger Wert "${raw}", Default ${fallback.join(',')} verwendet`,
    ])
  })
})

describe('parseConfig – URLs', () => {
  const url = 'https://example.org/jumper/kommode.png'

  it.each([
    ['land', 'land'],
    ['death', 'death'],
    ['snd_jump', 'sndJump'],
    ['snd_hit', 'sndHit'],
    ['snd_miss', 'sndMiss'],
  ] as const)('übernimmt eine https-URL für %s', (param, key) => {
    const result = ok(`${param}=${encodeURIComponent(url)}`)
    expect(result.config[key]).toBe(url)
    expect(result.warnings).toEqual([])
  })

  it.each([
    'http://example.org/a.mp3',
    'javascript:alert(1)',
    'data:audio/mpeg;base64,AAAA',
    'kein-link',
    '',
  ])('verwirft %j', (raw) => {
    const result = ok(`snd_hit=${encodeURIComponent(raw)}`)
    expect(result.config.sndHit).toBeNull()
    expect(result.warnings).toEqual([`snd_hit: ungültiger Wert "${raw}", ignoriert`])
  })
})

describe('parseConfig – Befehle', () => {
  it('übernimmt eigene Befehlsnamen', () => {
    const result = ok('cmd_jump=sprung&cmd_bump=flipper&cmd_reset=neu')
    expect(result.config).toMatchObject({ cmdJump: 'sprung', cmdBump: 'flipper', cmdReset: 'neu' })
    expect(result.warnings).toEqual([])
  })

  it('schreibt Befehlsnamen klein', () => {
    expect(ok('cmd_jump=Sprung').config.cmdJump).toBe('sprung')
  })

  it.each(['!jump', 'jump now', '', 'a'.repeat(26)])('verwirft cmd_jump=%j', (raw) => {
    const result = ok(`cmd_jump=${encodeURIComponent(raw)}`)
    expect(result.config.cmdJump).toBe('jump')
    expect(result.warnings).toEqual([`cmd_jump: ungültiger Wert "${raw}", Default jump verwendet`])
  })

  it('setzt bei doppelten Namen alle drei Befehle auf die Defaults', () => {
    const result = ok('cmd_jump=go&cmd_bump=go&cmd_reset=neu')
    expect(result.config).toMatchObject({ cmdJump: 'jump', cmdBump: 'bump', cmdReset: 'resetgame' })
    expect(result.warnings).toEqual([
      'Befehlsnamen doppelt, Defaults jump/bump/resetgame verwendet',
    ])
  })
})

describe('parseConfig – übergreifende Regeln', () => {
  it('tauscht drift_min und drift_max, wenn min größer als max ist', () => {
    const result = ok('drift_min=5&drift_max=2')
    expect(result.config).toMatchObject({ driftMin: 2, driftMax: 5 })
    expect(result.warnings).toEqual(['drift_min ist größer als drift_max, Werte getauscht'])
  })

  it('tauscht sink_min und sink_max (heutige Config: miny=4, maxy=2)', () => {
    const result = ok('sink_min=4&sink_max=2')
    expect(result.config).toMatchObject({ sinkMin: 2, sinkMax: 4 })
    expect(result.warnings).toEqual(['sink_min ist größer als sink_max, Werte getauscht'])
  })

  it('akzeptiert theme=custom mit land und death', () => {
    const result = ok('theme=custom&land=https://a.example/l.png&death=https://a.example/d.png')
    expect(result.config.theme).toBe('custom')
    expect(result.warnings).toEqual([])
  })

  it.each(['theme=custom', 'theme=custom&land=https://a.example/l.png'])(
    'fällt bei %s ohne beide Bilder auf target zurück',
    (query) => {
      const result = ok(query)
      expect(result.config.theme).toBe('target')
      expect(result.warnings).toEqual([
        'theme=custom braucht land und death als https-URL, Default target verwendet',
      ])
    },
  )
})
