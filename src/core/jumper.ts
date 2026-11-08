import type { FigureState } from './scoring'

export interface Motion {
  driftMin: number
  driftMax: number
  sinkMin: number
  sinkMax: number
  straight: number
  wallslide: number
}

/** Wo gelandet bzw. gestorben wird (Referenz-px, y wächst nach unten). */
export interface Lines {
  pad: { center: number; width: number; top: number }
  death: number
}

export type JumperEvent = { type: 'landed'; offset: number } | { type: 'died' }

const FPS = 60
const between = (min: number, max: number, roll: number) => min + (max - min) * roll

/** Figur am Gleiter. Koordinaten: x = Mitte, bottom = Unterkante (Füße). */
export class Jumper {
  x: number
  bottom = 0
  state: FigureState = 'falling'
  readonly velocity: { x: number; y: number }
  private readonly wallSlide: boolean

  constructor(
    private worldWidth: number,
    readonly size: { width: number; height: number },
    motion: Motion,
    random: () => number,
  ) {
    const half = size.width / 2
    this.x = between(half, worldWidth - half, random())
    const straight = random() < motion.straight
    const drift = between(motion.driftMin, motion.driftMax, random()) * FPS
    const direction = random() < 0.5 ? -1 : 1
    this.velocity = {
      x: straight ? 0 : drift * direction,
      y: between(motion.sinkMin, motion.sinkMax, random()) * FPS,
    }
    this.wallSlide = random() < motion.wallslide
  }

  step(dt: number, lines: Lines): JumperEvent | null {
    if (this.state !== 'falling') return null

    this.x += this.velocity.x * dt
    this.keepInside()

    const previous = this.bottom
    this.bottom += this.velocity.y * dt

    const landingLine = Math.min(lines.pad.top, lines.death)
    if (previous < landingLine && this.bottom >= landingLine) {
      const offset = this.x - lines.pad.center
      if (Math.abs(offset) <= lines.pad.width / 2) {
        this.bottom = landingLine
        this.state = 'landed'
        return { type: 'landed', offset }
      }
    }
    if (this.bottom >= lines.death) {
      this.bottom = lines.death
      this.state = 'dead'
      return { type: 'died' }
    }
    return null
  }

  resize(worldWidth: number): void {
    this.worldWidth = worldWidth
    this.x = Math.min(this.x, worldWidth - this.size.width / 2)
  }

  private keepInside(): void {
    const min = this.size.width / 2
    const max = this.worldWidth - min
    if (this.x >= min && this.x <= max) return
    const wall = this.x < min ? min : max
    if (this.wallSlide) {
      this.x = wall
      this.velocity.x = 0
    } else {
      this.x = 2 * wall - this.x
      this.velocity.x *= -1
    }
  }
}
