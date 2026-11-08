import { describe, expect, it } from 'vitest'
import { parseConfig } from './config'
import { Game, type GameSizes } from './game'

const config = (query = '') => {
  const result = parseConfig(
    new URLSearchParams(
      `channel=elricco1978&${query}&drift_min=1&drift_max=4&sink_min=2&sink_max=4`,
    ),
  )
  if (!result.ok) throw new Error(result.error)
  return result.config
}

const SIZES: GameSizes = {
  figure: { width: 40, height: 60 },
  pad: { width: 200, height: 60, surface: 0 },
  death: { height: 80, surface: 40 },
  bump: { width: 20, height: 30 },
  peg: 9,
}

/** x-Wurf, dann: gerade fallen, Seitwärts, Richtung, schnell sinken, kein Wandrutschen. */
const dropAt = (xRoll: number) => {
  const values = [xRoll, 0, 0, 0.9, 1, 0.9]
  let index = 0
  return () => values[index++ % values.length] ?? 0
}

/** Würfel-Warteschlange: je Figur 6 Würfe, siehe dropAt. */
const queue = () => {
  const values: number[] = []
  return {
    drop: (xRoll: number) => values.push(xRoll, 0, 0, 0.9, 1, 0.9),
    random: () => values.shift() ?? 0,
  }
}

const anna = { login: 'anna', displayName: 'Anna', color: null }

const runUntilSettled = (game: Game) => {
  const events = []
  for (let i = 0; i < 1000 && game.figures.some((f) => f.state === 'falling'); i++)
    events.push(...game.step(1 / 60))
  return events
}

describe('Game', () => {
  it('bringt eine Figur ins Spiel, mit Farbe und Emote', () => {
    const game = new Game(config('move=0'), SIZES, 1000, dropAt(0.5))
    const figure = game.spawnJump(anna, 'https://cdn.7tv.app/emote/x/4x.webp')
    expect(game.figures).toHaveLength(1)
    expect(figure).toMatchObject({
      displayName: 'Anna',
      emote: 'https://cdn.7tv.app/emote/x/4x.webp',
      state: 'falling',
      score: null,
    })
    expect(figure.color).toMatch(/^#[0-9a-f]{6}$/)
  })

  it('wertet eine mittige Landung mit 100', () => {
    const game = new Game(config('move=0'), SIZES, 1000, dropAt(0.5))
    const figure = game.spawnJump(anna, null)
    expect(runUntilSettled(game)).toEqual([{ type: 'landed', id: figure.id, score: 100 }])
    expect(figure.bottom).toBe(1080 - 60)
  })

  it('stellt gelandete Figuren auf die Standhöhe der Fläche statt auf ihre Oberkante', () => {
    const sizes = {
      ...SIZES,
      pad: { ...SIZES.pad, surface: 24 },
      death: { height: 40, surface: 20 },
    }
    const game = new Game(config('move=0&scale=2'), sizes, 1000, dropAt(0.5))
    const figure = game.spawnJump(anna, null)
    runUntilSettled(game)
    expect(figure.state).toBe('landed')
    expect(figure.bottom).toBe(1080 - 120 + 48)
  })

  it('lässt Figuren neben der Fläche in der Todeszone sterben', () => {
    const game = new Game(config('move=0'), SIZES, 1000, dropAt(0))
    const figure = game.spawnJump(anna, null)
    expect(runUntilSettled(game)).toEqual([{ type: 'died', id: figure.id }])
    expect(figure.bottom).toBe(1080 - 40)
  })

  it('lässt Tote bis zur Standhöhe der Todeszone einsinken', () => {
    const sizes = { ...SIZES, death: { height: 80, surface: 70 } }
    const game = new Game(config('move=0'), sizes, 1000, dropAt(0))
    const figure = game.spawnJump(anna, null)
    runUntilSettled(game)
    expect(figure.state).toBe('dead')
    expect(figure.bottom).toBe(1080 - 80 + 70)
  })

  it('lässt gelandete Figuren mit der Fläche mitfahren', () => {
    // Fallzeit 1020 / 240 = 4,25 s: Fläche 500 → 900 → zurück bis ≈ 790
    const game = new Game(config('move=1'), SIZES, 1000, dropAt(0.802))
    const figure = game.spawnJump(anna, null)
    runUntilSettled(game)
    expect(figure.state).toBe('landed')
    const offset = figure.x - game.pad.center
    game.step(0.5)
    expect(figure.x - game.pad.center).toBeCloseTo(offset)
    expect(game.pad.center).not.toBe(500) // die Fläche hat sich wirklich bewegt
  })

  it('zeigt nur die Beste voll, andere Gelandete und Tote halb', () => {
    const rolls = queue()
    const game = new Game(config('move=0'), SIZES, 1000, rolls.random)
    rolls.drop(0.5) // mittig → 100
    const best = game.spawnJump(anna, null)
    rolls.drop(0.52) // x = 519,2 → 80,8
    const second = game.spawnJump({ ...anna, login: 'bert' }, null)
    rolls.drop(0) // neben der Fläche → tot
    const dead = game.spawnJump({ ...anna, login: 'cem' }, null)
    const events = runUntilSettled(game)
    expect(events).toContainEqual({ type: 'landed', id: second.id, score: 80.8 })
    expect([best.opacity, second.opacity, dead.opacity]).toEqual([1, 0.5, 0.5])
  })

  it('zeigt fallende Figuren voll', () => {
    const game = new Game(config('move=0'), SIZES, 1000, dropAt(0.5))
    const figure = game.spawnJump(anna, null)
    game.step(1 / 60)
    expect(figure.opacity).toBe(1)
  })

  it('verrät die Fluggeschwindigkeit, nach der Landung steht die Figur still', () => {
    const values = [0.5, 0.5, 1, 0.9, 1, 0.9] // nicht gerade, 4 seitwärts nach rechts, 4 sinken
    const game = new Game(config('move=0'), SIZES, 1000, () => values.shift() ?? 0)
    const figure = game.spawnJump(anna, null)
    expect(figure.velocity).toEqual({ x: 240, y: 240 })
    runUntilSettled(game)
    expect(figure.velocity).toEqual({ x: 0, y: 0 })
  })

  it('lässt Gleiter, die zusammenstoßen, voneinander abprallen', () => {
    const values = [0.5, 0.5, 0, 0.9, 0, 0.9, 0.52, 0.5, 0, 0.1, 0, 0.9]
    const game = new Game(config('move=0'), SIZES, 1000, () => values.shift() ?? 0)
    const left = game.spawnJump(anna, null) // x 500 → rechts
    const right = game.spawnJump({ ...anna, login: 'bert' }, null) // x 519,2 → links
    game.step(1 / 60)
    expect(left.velocity.x).toBeLessThan(0)
    expect(right.velocity.x).toBeGreaterThan(0)
  })

  it('leert das Feld beim Reset', () => {
    const game = new Game(config(), SIZES, 1000, dropAt(0.5))
    game.spawnJump(anna, null)
    game.reset()
    expect(game.figures).toEqual([])
  })

  it('vergrößert Figuren und Flächen mit scale', () => {
    const game = new Game(config('scale=2&move=0'), SIZES, 1000, dropAt(0.5))
    const figure = game.spawnJump(anna, null)
    expect(figure.size).toEqual({ width: 80, height: 120 })
    expect(game.pad.size).toEqual({ width: 400, height: 120 })
    expect(game.padSurface).toBe(0)
    expect(game.deathHeight).toBe(160)
  })

  it('übernimmt eine neue Bühnenbreite', () => {
    const game = new Game(config('move=0'), SIZES, 1000, dropAt(1))
    const figure = game.spawnJump(anna, null)
    game.resize(600)
    expect(game.width).toBe(600)
    expect(figure.x).toBe(580)
    expect(game.pad.center).toBe(300)
  })
})

describe('Game – Bump', () => {
  const bumpGame = (rolls: number[], query = 'move=0') => {
    const values = [...rolls]
    return new Game(config(query), SIZES, 1100, () => values.shift() ?? 0.5)
  }

  it('bringt eine Bump-Figur ins Spiel und zeigt ab dann die Stifte', () => {
    const game = bumpGame([0.5, 0.5])
    expect(game.pegsVisible).toBe(false)
    const figure = game.spawnBump(anna, null)
    expect(figure.mode).toBe('bump')
    expect(figure.state).toBe('falling')
    expect(game.pegsVisible).toBe(true)
    expect(game.pegs).toHaveLength(52)
  })

  it('blendet die Stifte beim Reset wieder aus', () => {
    const game = bumpGame([0.5, 0.5])
    game.spawnBump(anna, null)
    game.reset()
    expect(game.pegsVisible).toBe(false)
  })

  it('lässt Bump-Figuren an Stiften abprallen und meldet den Treffer', () => {
    // x-Wurf so, dass die Figur genau über dem ersten Stift der ersten Reihe startet (x = 100)
    const game = bumpGame([(100 - 10) / (1100 - 20), 0.5])
    const figure = game.spawnBump(anna, null)
    const events = []
    for (let i = 0; i < 120; i++) events.push(...game.step(1 / 60))
    expect(events).toContainEqual({ type: 'peg', id: figure.id })
  })

  it('lässt Gleiter durch die Stifte hindurchfliegen', () => {
    // gerade fallender Gleiter genau über einem Stift
    const game = bumpGame([0.5, 0.5, (100 - 20) / (1100 - 40), 0, 0, 0.9, 1, 0.9])
    game.spawnBump(anna, null) // macht Stifte sichtbar
    game.figures = []
    const glider = game.spawnJump({ ...anna, login: 'bert' }, null)
    const events = []
    for (let i = 0; i < 600 && glider.state === 'falling'; i++) events.push(...game.step(1 / 60))
    expect(events.filter((event) => event.type === 'peg')).toEqual([])
    expect(glider.state).toBe('dead')
  })

  it('verteilt die Stifte nach einem resize neu', () => {
    const game = bumpGame([0.5, 0.5])
    const before = game.pegs[0]?.x
    game.resize(2200)
    expect(game.pegs[0]?.x).toBe((before ?? 0) * 2)
  })

  it('dreht nur Bump-Figuren', () => {
    const game = bumpGame([0.5, 1])
    const figure = game.spawnBump(anna, null)
    game.step(0.1)
    expect(figure.spin).toBeGreaterThan(0)
  })
})
