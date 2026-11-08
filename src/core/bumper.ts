import { settle, type LandingEvent, type Lines } from './landing'
import { bounceOffPeg, type Peg } from './pegs'
import type { FigureState } from './scoring'

/** Referenz-px/s² */
export const GRAVITY = 600
/** Höchste Fallgeschwindigkeit in Referenz-px/s */
export const MAX_FALL = 320
const START_DRIFT = 60
const RESTITUTION = 0.55
const NUDGE = 60
/** Grad Drehung je Referenz-px Seitwärtsweg */
const SPIN_PER_PX = 1.2

export type BumperEvent = LandingEvent | { type: 'peg' }

/** Pachinko-Figur: fällt mit Schwerkraft, prallt an Stiften und Wänden ab. x = Mitte, bottom = Füße. */
export class Bumper {
  x: number
  bottom = 0
  spin = 0
  state: FigureState = 'falling'
  readonly velocity: { x: number; y: number }

  constructor(
    private worldWidth: number,
    readonly size: { width: number; height: number },
    private readonly radius: number,
    private readonly random: () => number,
  ) {
    const half = size.width / 2
    this.x = half + (worldWidth - 2 * half) * random()
    this.velocity = { x: (random() * 2 - 1) * START_DRIFT, y: 0 }
  }

  step(dt: number, lines: Lines, pegs: readonly (Peg & { r: number })[]): BumperEvent | null {
    if (this.state !== 'falling') return null

    this.velocity.y = Math.min(this.velocity.y + GRAVITY * dt, MAX_FALL)
    this.x += this.velocity.x * dt
    this.spin += this.velocity.x * dt * SPIN_PER_PX
    this.keepInside()

    const previous = this.bottom
    this.bottom += this.velocity.y * dt

    let hitPeg = false
    for (const peg of pegs) {
      const ball = {
        x: this.x,
        y: this.bottom - this.size.height / 2,
        vx: this.velocity.x,
        vy: this.velocity.y,
        r: this.radius,
      }
      const nudge = (this.random() * 2 - 1) * NUDGE
      const bounced = bounceOffPeg(ball, peg, RESTITUTION, nudge)
      if (!bounced) continue
      this.x = bounced.x
      this.bottom = bounced.y + this.size.height / 2
      this.velocity.x = bounced.vx
      this.velocity.y = bounced.vy
      hitPeg = true
    }

    return settle(this, previous, lines) ?? (hitPeg ? { type: 'peg' } : null)
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
    this.x = 2 * wall - this.x
    this.velocity.x *= -1
  }
}
