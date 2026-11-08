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

/** Sounds für Start, Landung und Tod. Fehler (z. B. Autoplay-Sperre) werden still ignoriert. */
export function createSounds(
  urls: SoundUrls,
  create: (src: string) => AudioLike = (src) => new Audio(src),
): Sounds {
  const player = (src: string | null) => () => {
    if (!src) return
    const audio = create(src)
    audio.volume = urls.vol
    audio.play().catch(() => {})
  }
  return { jump: player(urls.sndJump), hit: player(urls.sndHit), miss: player(urls.sndMiss) }
}
