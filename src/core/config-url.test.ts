import { describe, expect, it } from 'vitest'
import { PARAMS, parseConfig, type Config } from './config'
import { paramsFromText, serializeConfig } from './config-url'

const parse = (query: string): Config => {
  const result = parseConfig(new URLSearchParams(query))
  if (!result.ok) throw new Error(result.error)
  return result.config
}

describe('PARAMS', () => {
  it('beschreibt jedes Config-Feld genau einmal', () => {
    const keys = PARAMS.map((param) => param.key).sort()
    expect(keys).toEqual(Object.keys(parse('channel=abc')).sort())
  })

  it('hat für Zahlen Bereich und Schrittweite, für Auswahlen die Optionen', () => {
    for (const param of PARAMS) {
      if (param.kind === 'number') {
        expect(param.min).toBeLessThan(param.max)
        expect(param.step).toBeGreaterThan(0)
      }
      if (param.kind === 'choice' || param.kind === 'list')
        expect(param.options.length).toBeGreaterThan(1)
    }
  })
})

describe('serializeConfig', () => {
  it('schreibt bei Standardwerten nur den Kanal', () => {
    expect(serializeConfig(parse('channel=elricco1978'))).toBe('channel=elricco1978')
  })

  it('schreibt nur Abweichungen', () => {
    expect(serializeConfig(parse('channel=elricco1978&theme=lava&vol=0.8&move=0'))).toBe(
      'channel=elricco1978&vol=0.8&theme=lava&move=0',
    )
  })

  it('ergibt nach dem Einlesen wieder dieselbe Config (alle Parameter)', () => {
    const everything = [
      'channel=elricco1978',
      'modes=bump',
      'vol=0.2',
      'scale=1.5',
      'theme=custom',
      'land=https://a.example/l.png',
      'land_surface=0.3',
      'death=https://a.example/d.png',
      'death_surface=0.6',
      'snd_jump=https://a.example/j.mp3',
      'snd_hit=https://a.example/h.mp3',
      'snd_miss=https://a.example/m.mp3',
      'drift_min=0.5',
      'drift_max=6',
      'sink_min=0.7',
      'sink_max=5',
      'straight=0.3',
      'wallslide=0.4',
      'difficulty=95',
      'move=0',
      'highscore=week',
      'perm=vip,sub',
      'reset_perm=all',
      'reset_after=0',
      'cmd_jump=sprung',
      'cmd_bump=flipper',
      'cmd_reset=neu',
      'cmd_resetscores=rekorde',
      'debug=1',
    ].join('&')
    const config = parse(everything)
    expect(parse(serializeConfig(config))).toEqual(config)
    expect(serializeConfig(config).split('&')).toHaveLength(29)
  })

  it('kodiert Sonderzeichen in URLs korrekt', () => {
    const config = parse(
      `channel=abc&snd_hit=${encodeURIComponent('https://a.example/x y.mp3?a=1&b=2')}`,
    )
    expect(parse(serializeConfig(config)).sndHit).toBe(config.sndHit)
  })
})

describe('paramsFromText', () => {
  it('liest die Parameter einer vollständigen Overlay-URL – der Host ist egal', () => {
    const params = paramsFromText(
      'https://elricco.github.io/dump-game/?channel=elricco1978&theme=lava',
    )
    expect(params.get('channel')).toBe('elricco1978')
    expect(params.get('theme')).toBe('lava')
  })

  it('akzeptiert auch nur den Query-Teil, mit oder ohne Fragezeichen', () => {
    expect(paramsFromText('?channel=abc').get('channel')).toBe('abc')
    expect(paramsFromText('channel=abc&vol=1').get('vol')).toBe('1')
  })

  it('liefert für Leeres und Unsinn leere Parameter', () => {
    expect([...paramsFromText('').keys()]).toEqual([])
    expect([...paramsFromText('   ').keys()]).toEqual([])
  })
})
