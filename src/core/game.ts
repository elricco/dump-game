import { Bumper } from './bumper'
import { playerColor } from './colors'
import type { Config, Mode } from './config'
import { Pad } from './ground'
import { collide, Jumper } from './jumper'
import type { LandingEvent, Lines } from './landing'
import { pegLayout, type Peg } from './pegs'
import { landingScore, opacityFor, type FigureState } from './scoring'
import { STAGE_HEIGHT } from './stage'

export { STAGE_HEIGHT }

export interface Size {
  width: number
  height: number
}

/** Größen bei scale=1 in Referenz-px (aus DESIGN.md bzw. dem Theme). */
export interface GameSizes {
  /** Gleiter-Figur: Breite = Gleiter, Höhe = Figur. */
  figure: Size
  /** surface: so weit unter der Oberkante stehen gelandete Figuren (Oberseite der Fläche). */
  pad: Size & { surface: number }
  /** surface: so weit unter der Oberkante der Todeszone liegen Tote. */
  death: { height: number; surface: number }
  /** Bump-Figur (ohne Gleiter); Kollisionskreis = halbe Höhe. */
  bump: Size
  /** Radius eines Stifts */
  peg: number
}

export interface Player {
  login: string
  displayName: string
  color: string | null
}

export type GameEvent =
  | { type: 'landed'; id: string; score: number }
  | { type: 'died'; id: string }
  | { type: 'peg'; id: string }

type Body = Jumper | Bumper

export class Figure {
  score: number | null = null
  opacity = 1
  private offset = 0

  constructor(
    readonly id: string,
    readonly login: string,
    readonly mode: Mode,
    readonly displayName: string,
    readonly color: string,
    readonly emote: string | null,
    /** Nur Jump-Figuren hängen am Gleiter – außer bei `!jump !jump`. */
    readonly glider: boolean,
    private readonly body: Body,
  ) {}

  get x(): number {
    return this.body.x
  }
  get bottom(): number {
    return this.body.bottom
  }
  get state(): FigureState {
    return this.body.state
  }
  get velocity(): { x: number; y: number } {
    return this.state === 'falling' ? { ...this.body.velocity } : { x: 0, y: 0 }
  }
  get size(): Size {
    return this.body.size
  }
  /** Drehwinkel in Grad (nur Bump-Figuren taumeln; gelandet: gerade). */
  get spin(): number {
    return this.body instanceof Bumper && this.state !== 'landed' ? this.body.spin : 0
  }

  /** Intern: Landung merken, damit die Figur mit der Fläche mitfährt. */
  land(offset: number, score: number): void {
    this.offset = offset
    this.score = score
  }

  ride(padCenter: number): void {
    if (this.state === 'landed') this.body.x = padCenter + this.offset
  }

  step(dt: number, lines: Lines, pegs: readonly (Peg & { r: number })[]) {
    return this.body instanceof Bumper ? this.body.step(dt, lines, pegs) : this.body.step(dt, lines)
  }

  resize(width: number): void {
    this.body.resize(width)
  }

  /** Intern: Zusammenstoß zweier Gleiter prüfen und auflösen. */
  collideWith(other: Figure): void {
    if (this.body instanceof Jumper && other.body instanceof Jumper) collide(this.body, other.body)
  }
}

const scaled = (size: Size, scale: number): Size => ({
  width: size.width * scale,
  height: size.height * scale,
})

/** Spielzustand einer Runde: Figuren, Landefläche, Todeszone, Stifte. */
export class Game {
  readonly pad: Pad
  readonly deathHeight: number
  readonly padSurface: number
  readonly pegRadius: number
  figures: Figure[] = []
  pegs: Peg[]
  pegsVisible = false
  private readonly deathSurface: number
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
    this.pegRadius = sizes.peg * config.scale
    this.pegs = pegLayout(width)
  }

  spawnJump(player: Player, emote: string | null, glider = true): Figure {
    const size = scaled(this.sizes.figure, this.config.scale)
    return this.add(
      'jump',
      player,
      emote,
      glider,
      new Jumper(this.width, size, this.config, this.random),
    )
  }

  spawnBump(player: Player, emote: string | null): Figure {
    const size = scaled(this.sizes.bump, this.config.scale)
    this.pegsVisible = true
    return this.add(
      'bump',
      player,
      emote,
      false,
      new Bumper(this.width, size, size.height / 2, this.random),
    )
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
    const pegs = this.pegsVisible ? this.pegs.map((peg) => ({ ...peg, r: this.pegRadius })) : []

    const events: GameEvent[] = []
    for (const figure of this.figures) {
      figure.ride(this.pad.center)
      const result: LandingEvent | { type: 'peg' } | null = figure.step(dt, lines, pegs)
      if (result?.type === 'landed') {
        const score = landingScore(figure.x, lines.pad, this.config.difficulty)
        figure.land(result.offset, score)
        events.push({ type: 'landed', id: figure.id, score })
      } else if (result) {
        events.push({ type: result.type, id: figure.id })
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
    this.pegsVisible = false
  }

  resize(width: number): void {
    this.width = width
    this.pad.resize(width)
    this.pegs = pegLayout(width)
    for (const figure of this.figures) figure.resize(width)
  }

  private add(
    mode: Mode,
    player: Player,
    emote: string | null,
    glider: boolean,
    body: Body,
  ): Figure {
    const figure = new Figure(
      String(this.nextId++),
      player.login,
      mode,
      player.displayName,
      playerColor(player.login, player.color),
      emote,
      glider,
      body,
    )
    this.figures.push(figure)
    return figure
  }
}
