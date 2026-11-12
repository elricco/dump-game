export type Mode = 'jump' | 'bump'
export type Theme = 'target' | 'lava' | 'custom'
export type Highscore = 'off' | 'stream' | 'day' | 'week' | 'forever'
export type HighscoreSize = '1' | '1.5' | '2' | '2.5' | '3'
export type Role = 'mod' | 'vip' | 'sub' | 'all'

export interface Config {
  channel: string
  modes: Mode[]
  vol: number
  scale: number
  theme: Theme
  land: string | null
  /** Anteil der Bildhöhe von oben, auf dem gelandete Figuren stehen (nur custom). */
  landSurface: number
  death: string | null
  /** Anteil der Bildhöhe von oben, bis zu dem Tote einsinken (nur custom). */
  deathSurface: number
  sndJump: string | null
  sndHit: string | null
  sndMiss: string | null
  driftMin: number
  driftMax: number
  sinkMin: number
  sinkMax: number
  straight: number
  wallslide: number
  difficulty: number
  move: boolean
  highscore: Highscore
  /** Vergrößerung der Highscore-Liste, zusätzlich zu scale. */
  highscoreSize: HighscoreSize
  perm: Role[]
  resetPerm: Role[]
  resetAfter: number
  cmdJump: string
  cmdBump: string
  cmdReset: string
  cmdResetScores: string
  debug: boolean
}

export type ParseResult =
  { ok: true; config: Config; warnings: string[] } | { ok: false; error: string }

const CHANNEL = /^[a-z0-9_]{3,25}$/
const COMMAND = /^[a-z0-9_]{1,25}$/
export const ROLES: readonly Role[] = ['mod', 'vip', 'sub', 'all']

class Reader {
  readonly warnings: string[] = []

  constructor(private readonly params: URLSearchParams) {}

  number(name: string, fallback: number, min: number, max: number): number {
    const raw = this.params.get(name)
    if (raw === null) return fallback
    const value = raw.trim() === '' ? NaN : Number(raw)
    if (Number.isFinite(value) && value >= min && value <= max) return value
    return this.reject(name, raw, fallback)
  }

  choice<T extends string>(name: string, fallback: T, allowed: readonly T[]): T {
    const raw = this.params.get(name)
    if (raw === null) return fallback
    const match = allowed.find((option) => option === raw)
    return match ?? this.reject(name, raw, fallback)
  }

  list<T extends string>(name: string, fallback: T[], allowed: readonly T[]): T[] {
    const raw = this.params.get(name)
    if (raw === null) return fallback
    const entries = raw.split(',')
    const isAllowed = (entry: string): entry is T => (allowed as readonly string[]).includes(entry)
    if (!entries.every(isAllowed)) return this.reject(name, raw, fallback)
    return [...new Set(entries)]
  }

  httpsUrl(name: string): string | null {
    const raw = this.params.get(name)
    if (raw === null) return null
    const url = URL.parse(raw)
    if (url?.protocol === 'https:') return url.href
    this.warn(`${name}: ungültiger Wert "${raw}", ignoriert`)
    return null
  }

  command(name: string, fallback: string): string {
    const raw = this.params.get(name)
    if (raw === null) return fallback
    const value = raw.toLowerCase()
    return COMMAND.test(value) ? value : this.reject(name, raw, fallback)
  }

  warn(message: string): void {
    this.warnings.push(message)
  }

  flag(name: string, fallback: boolean): boolean {
    const raw = this.params.get(name)
    if (raw === null) return fallback
    if (raw === '1') return true
    if (raw === '0') return false
    return this.reject(name, raw, fallback)
  }

  private reject<T>(name: string, raw: string, fallback: T): T {
    this.warn(`${name}: ungültiger Wert "${raw}", Default ${String(fallback)} verwendet`)
    return fallback
  }
}

/** Beschreibung eines URL-Parameters – eine Quelle für Parser, Serialisierung und Config-Seite. */
export type ParamSpec =
  | {
      kind: 'number'
      name: string
      key: keyof Config
      fallback: number
      min: number
      max: number
      step: number
    }
  | {
      kind: 'choice'
      name: string
      key: keyof Config
      fallback: string
      options: readonly string[]
    }
  | {
      kind: 'list'
      name: string
      key: keyof Config
      fallback: readonly string[]
      options: readonly string[]
    }
  | { kind: 'flag'; name: string; key: keyof Config; fallback: boolean }
  | { kind: 'url'; name: string; key: keyof Config }
  | { kind: 'command'; name: string; key: keyof Config; fallback: string }
  | { kind: 'channel'; name: 'channel'; key: 'channel' }

const num = (
  name: string,
  key: keyof Config,
  fallback: number,
  min: number,
  max: number,
  step: number,
) => ({ kind: 'number', name, key, fallback, min, max, step }) as const

export const MODES: readonly Mode[] = ['jump', 'bump']
export const THEMES: readonly Theme[] = ['target', 'lava', 'custom']
export const HIGHSCORES: readonly Highscore[] = ['off', 'stream', 'day', 'week', 'forever']
export const HIGHSCORE_SIZES: readonly HighscoreSize[] = ['1', '1.5', '2', '2.5', '3']

/** Alle URL-Parameter in URL-Reihenfolge. */
export const PARAMS: readonly ParamSpec[] = [
  { kind: 'channel', name: 'channel', key: 'channel' },
  { kind: 'list', name: 'modes', key: 'modes', fallback: ['jump', 'bump'], options: MODES },
  num('vol', 'vol', 0.5, 0, 1, 0.05),
  num('scale', 'scale', 1, 0.5, 3, 0.1),
  { kind: 'choice', name: 'theme', key: 'theme', fallback: 'target', options: THEMES },
  { kind: 'url', name: 'land', key: 'land' },
  num('land_surface', 'landSurface', 0.4, 0, 0.9, 0.05),
  { kind: 'url', name: 'death', key: 'death' },
  num('death_surface', 'deathSurface', 0.8, 0, 1, 0.05),
  { kind: 'url', name: 'snd_jump', key: 'sndJump' },
  { kind: 'url', name: 'snd_hit', key: 'sndHit' },
  { kind: 'url', name: 'snd_miss', key: 'sndMiss' },
  num('drift_min', 'driftMin', 1.5, 0, 20, 0.5),
  num('drift_max', 'driftMax', 3.5, 0, 20, 0.5),
  num('sink_min', 'sinkMin', 1, 0.5, 20, 0.5),
  num('sink_max', 'sinkMax', 2, 0.5, 20, 0.5),
  num('straight', 'straight', 0.1, 0, 1, 0.05),
  num('wallslide', 'wallslide', 0.1, 0, 1, 0.05),
  num('difficulty', 'difficulty', 100, 50, 100, 1),
  { kind: 'flag', name: 'move', key: 'move', fallback: true },
  { kind: 'choice', name: 'highscore', key: 'highscore', fallback: 'off', options: HIGHSCORES },
  {
    kind: 'choice',
    name: 'highscore_size',
    key: 'highscoreSize',
    fallback: '1',
    options: HIGHSCORE_SIZES,
  },
  { kind: 'list', name: 'perm', key: 'perm', fallback: ['mod'], options: ROLES },
  { kind: 'list', name: 'reset_perm', key: 'resetPerm', fallback: ['mod'], options: ROLES },
  num('reset_after', 'resetAfter', 30, 0, 600, 5),
  { kind: 'command', name: 'cmd_jump', key: 'cmdJump', fallback: 'jump' },
  { kind: 'command', name: 'cmd_bump', key: 'cmdBump', fallback: 'bump' },
  { kind: 'command', name: 'cmd_reset', key: 'cmdReset', fallback: 'resetgame' },
  { kind: 'command', name: 'cmd_resetscores', key: 'cmdResetScores', fallback: 'resetscores' },
  { kind: 'flag', name: 'debug', key: 'debug', fallback: false },
]

function readParam(read: Reader, param: Exclude<ParamSpec, { kind: 'channel' }>): unknown {
  switch (param.kind) {
    case 'number':
      return read.number(param.name, param.fallback, param.min, param.max)
    case 'choice':
      return read.choice(param.name, param.fallback, param.options)
    case 'list':
      return read.list(param.name, [...param.fallback], param.options)
    case 'flag':
      return read.flag(param.name, param.fallback)
    case 'url':
      return read.httpsUrl(param.name)
    case 'command':
      return read.command(param.name, param.fallback)
  }
}

export function parseConfig(params: URLSearchParams): ParseResult {
  const rawChannel = params.get('channel')
  if (rawChannel === null || rawChannel === '') return { ok: false, error: 'channel fehlt' }
  const channel = rawChannel.toLowerCase()
  if (!CHANNEL.test(channel)) return { ok: false, error: 'channel ungültig' }

  const read = new Reader(params)
  const values: Record<string, unknown> = { channel }
  for (const param of PARAMS)
    if (param.kind !== 'channel') values[param.key] = readParam(read, param)
  // Vollständigkeit sichert der Test „PARAMS beschreibt jedes Config-Feld genau einmal".
  const config = values as unknown as Config

  if (config.driftMin > config.driftMax) {
    ;[config.driftMin, config.driftMax] = [config.driftMax, config.driftMin]
    read.warn('drift_min ist größer als drift_max, Werte getauscht')
  }
  if (config.sinkMin > config.sinkMax) {
    ;[config.sinkMin, config.sinkMax] = [config.sinkMax, config.sinkMin]
    read.warn('sink_min ist größer als sink_max, Werte getauscht')
  }
  if (config.theme === 'custom' && (config.land === null || config.death === null)) {
    config.theme = 'target'
    read.warn('theme=custom braucht land und death als https-URL, Default target verwendet')
  }

  const commands = [config.cmdJump, config.cmdBump, config.cmdReset, config.cmdResetScores]
  if (new Set(commands).size !== commands.length) {
    Object.assign(config, {
      cmdJump: 'jump',
      cmdBump: 'bump',
      cmdReset: 'resetgame',
      cmdResetScores: 'resetscores',
    })
    read.warn('Befehlsnamen doppelt, Defaults jump/bump/resetgame/resetscores verwendet')
  }

  return { ok: true, config, warnings: read.warnings }
}
