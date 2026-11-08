/** Der Teil von HTMLAudioElement, den wir brauchen – in Tests ersetzbar. */
export interface AudioLike {
  volume: number
  play(): Promise<void>
}

export interface SoundUrls {
  sndJump: string | null
  sndHit: string | null
  sndMiss: string | null
  vol: number
}

export interface Sounds {
  jump(): void
  hit(): void
  miss(): void
}

const SILENT: Sounds = { jump: () => {}, hit: () => {}, miss: () => {} }

/**
 * Sounds für Start, Landung und Tod: eigene URLs, sonst der eingebaute Klang
 * (`fallback`). Fehler (z. B. Autoplay-Sperre) werden still ignoriert.
 */
export function createSounds(
  urls: SoundUrls,
  create: (src: string) => AudioLike = (src) => new Audio(src),
  fallback: Sounds = SILENT,
): Sounds {
  const player = (src: string | null, builtIn: () => void) => () => {
    if (!src) {
      builtIn()
      return
    }
    const audio = create(src)
    audio.volume = urls.vol
    audio.play().catch(() => {})
  }
  return {
    jump: player(urls.sndJump, fallback.jump),
    hit: player(urls.sndHit, fallback.hit),
    miss: player(urls.sndMiss, fallback.miss),
  }
}
