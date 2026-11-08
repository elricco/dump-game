export type Mode = 'jump' | 'bump'
export type Theme = 'target' | 'lava' | 'custom'
export type Highscore = 'off' | 'stream' | 'day' | 'week' | 'forever'
export type Role = 'mod' | 'vip' | 'sub' | 'all'

export interface Config {
  channel: string
  modes: Mode[]
  vol: number
  scale: number
  theme: Theme
  land: string | null
  death: string | null
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
  perm: Role[]
  resetPerm: Role[]
  resetAfter: number
  cmdJump: string
  cmdBump: string
  cmdReset: string
  debug: boolean
}

export type ParseResult =
  { ok: true; config: Config; warnings: string[] } | { ok: false; error: string }

const CHANNEL = /^[a-z0-9_]{3,25}$/
const COMMAND = /^[a-z0-9_]{1,25}$/
const ROLES: readonly Role[] = ['mod', 'vip', 'sub', 'all']

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

export function parseConfig(params: URLSearchParams): ParseResult {
  const rawChannel = params.get('channel')
  if (rawChannel === null || rawChannel === '') return { ok: false, error: 'channel fehlt' }
  const channel = rawChannel.toLowerCase()
  if (!CHANNEL.test(channel)) return { ok: false, error: 'channel ungültig' }

  const read = new Reader(params)
  const config: Config = {
    channel,
    modes: read.list<Mode>('modes', ['jump', 'bump'], ['jump', 'bump']),
    vol: read.number('vol', 0.5, 0, 1),
    scale: read.number('scale', 1, 0.5, 3),
    theme: read.choice<Theme>('theme', 'target', ['target', 'lava', 'custom']),
    land: read.httpsUrl('land'),
    death: read.httpsUrl('death'),
    sndJump: read.httpsUrl('snd_jump'),
    sndHit: read.httpsUrl('snd_hit'),
    sndMiss: read.httpsUrl('snd_miss'),
    driftMin: read.number('drift_min', 1, 0, 20),
    driftMax: read.number('drift_max', 4, 0, 20),
    sinkMin: read.number('sink_min', 2, 0.5, 20),
    sinkMax: read.number('sink_max', 4, 0.5, 20),
    straight: read.number('straight', 0.1, 0, 1),
    wallslide: read.number('wallslide', 0.1, 0, 1),
    difficulty: read.number('difficulty', 100, 50, 100),
    move: read.flag('move', true),
    highscore: read.choice<Highscore>('highscore', 'off', [
      'off',
      'stream',
      'day',
      'week',
      'forever',
    ]),
    perm: read.list<Role>('perm', ['mod'], ROLES),
    resetPerm: read.list<Role>('reset_perm', ['mod'], ROLES),
    resetAfter: read.number('reset_after', 30, 0, 600),
    cmdJump: read.command('cmd_jump', 'jump'),
    cmdBump: read.command('cmd_bump', 'bump'),
    cmdReset: read.command('cmd_reset', 'resetgame'),
    debug: read.flag('debug', false),
  }

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

  const commands = [config.cmdJump, config.cmdBump, config.cmdReset]
  if (new Set(commands).size !== commands.length) {
    Object.assign(config, { cmdJump: 'jump', cmdBump: 'bump', cmdReset: 'resetgame' })
    read.warn('Befehlsnamen doppelt, Defaults jump/bump/resetgame verwendet')
  }

  return { ok: true, config, warnings: read.warnings }
}
