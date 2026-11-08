import { playerColor } from './colors'
import type { Config } from './config'
import { Pad } from './ground'
import { collide, Jumper, type Lines } from './jumper'
import { landingScore, opacityFor, type FigureState } from './scoring'

import { STAGE_HEIGHT } from './stage'

export { STAGE_HEIGHT }

export interface Size {
  width: number
  height: number
}

/** Größen bei scale=1 in Referenz-px (aus dem Theme). */
export interface GameSizes {
  figure: Size
  /** surface: so weit unter der Oberkante stehen gelandete Figuren (Oberseite der Fläche). */
  pad: Size & { surface: number }
  /** surface: so weit unter der Oberkante der Todeszone liegen Tote. */
  death: { height: number; surface: number }
}

export interface Player {
  login: string
  displayName: string
  color: string | null
}

export type GameEvent = { type: 'landed'; id: string; score: number } | { type: 'died'; id: string }

export class Figure {
  score: number | null = null
  opacity = 1
  private offset = 0

  constructor(
    readonly id: string,
    readonly displayName: string,
    readonly color: string,
    readonly emote: string | null,
    private readonly jumper: Jumper,
  ) {}

  get x(): number {
    return this.jumper.x
  }
  get bottom(): number {
    return this.jumper.bottom
  }
  get state(): FigureState {
    return this.jumper.state
  }
  get velocity(): { x: number; y: number } {
    return this.state === 'falling' ? { ...this.jumper.velocity } : { x: 0, y: 0 }
  }
  get size(): Size {
    return this.jumper.size
  }

  /** Intern: Landung merken, damit die Figur mit der Fläche mitfährt. */
  land(offset: number, score: number): void {
    this.offset = offset
    this.score = score
  }

  ride(padCenter: number): void {
    if (this.state === 'landed') this.jumper.x = padCenter + this.offset
  }

  step(dt: number, lines: Lines) {
    return this.jumper.step(dt, lines)
  }

  resize(width: number): void {
    this.jumper.resize(width)
  }

  /** Intern: Zusammenstoß mit einer anderen Figur prüfen und auflösen. */
  collideWith(other: Figure): void {
    collide(this.jumper, other.jumper)
  }
}

const scaled = (size: Size, scale: number): Size => ({
  width: size.width * scale,
  height: size.height * scale,
})

/** Spielzustand einer Runde: Figuren, Landefläche, Todeszone. */
export class Game {
  readonly pad: Pad
  readonly deathHeight: number
  private readonly deathSurface: number
  readonly padSurface: number
  figures: Figure[] = []
  private nextId = 1

  constructor(
    private readonly config: Config,
    private readonly sizes: GameSizes,
    public width: number,
    private readonly random: () => number,
  ) {
    this.pad = new Pad(width, scaled(sizes.pad, config.scale), config.move)
    this.padSurface = sizes.pad.surface * config.scale
    this.deathHeight = sizes.death.height * config.scale
    this.deathSurface = sizes.death.surface * config.scale
  }

  spawnJump(player: Player, emote: string | null): Figure {
    const jumper = new Jumper(
      this.width,
      scaled(this.sizes.figure, this.config.scale),
      this.config,
      this.random,
    )
    const figure = new Figure(
      String(this.nextId++),
      player.displayName,
      playerColor(player.login, player.color),
      emote,
      jumper,
    )
    this.figures.push(figure)
    return figure
  }

  step(dt: number): GameEvent[] {
    this.pad.step(dt)
    const lines: Lines = {
      pad: {
        center: this.pad.center,
        width: this.pad.size.width,
        top: STAGE_HEIGHT - this.pad.size.height + this.padSurface,
      },
      death: STAGE_HEIGHT - this.deathHeight + this.deathSurface,
    }

    const events: GameEvent[] = []
    for (const figure of this.figures) {
      figure.ride(this.pad.center)
      const result = figure.step(dt, lines)
      if (result?.type === 'landed') {
        const score = landingScore(figure.x, lines.pad, this.config.difficulty)
        figure.land(result.offset, score)
        events.push({ type: 'landed', id: figure.id, score })
      } else if (result?.type === 'died') {
        events.push({ type: 'died', id: figure.id })
      }
    }

    this.figures.forEach((figure, index) => {
      for (const other of this.figures.slice(index + 1)) figure.collideWith(other)
    })

    const opacity = opacityFor(this.figures)
    for (const figure of this.figures) figure.opacity = opacity[figure.id] ?? 1
    return events
  }

  reset(): void {
    this.figures = []
  }

  resize(width: number): void {
    this.width = width
    this.pad.resize(width)
    for (const figure of this.figures) figure.resize(width)
  }
}
