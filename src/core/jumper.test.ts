import { describe, expect, it } from 'vitest'
import { collide, Jumper, type Lines, type Motion } from './jumper'

/** Liefert die Zahlen der Reihe nach – macht den Zufall vorhersagbar. */
const sequence = (...values: number[]) => {
  let index = 0
  return () => values[index++ % values.length] ?? 0
}

const MOTION: Motion = {
  driftMin: 1,
  driftMax: 4,
  sinkMin: 2,
  sinkMax: 4,
  straight: 0.1,
  wallslide: 0.1,
}
const SIZE = { width: 40, height: 60 }
const WORLD = 1000
// Reihenfolge der Würfe: x, gerade?, Seitwärts-Betrag, Richtung, Sinken, Wand-Rutschen?
const lines = (padCenter = 500): Lines => ({
  pad: { center: padCenter, width: 200, top: 1000 },
  death: 1040,
})

describe('Jumper – Start', () => {
  it('startet über der Bühne an zufälliger Stelle innerhalb der Breite', () => {
    const jumper = new Jumper(WORLD, SIZE, MOTION, sequence(0, 0.5, 0, 0.9, 0, 0.5))
    expect(jumper.x).toBe(20)
    expect(jumper.bottom).toBe(0)
    const right = new Jumper(WORLD, SIZE, MOTION, sequence(1, 0.5, 0, 0.9, 0, 0.5))
    expect(right.x).toBe(980)
  })

  it('würfelt Geschwindigkeiten in Referenz-px pro Frame bei 60 fps', () => {
    const jumper = new Jumper(WORLD, SIZE, MOTION, sequence(0.5, 0.5, 1, 0.9, 1, 0.5))
    expect(jumper.velocity).toEqual({ x: 4 * 60, y: 4 * 60 })
  })

  it('fliegt mit Richtung < 0,5 nach links', () => {
    const jumper = new Jumper(WORLD, SIZE, MOTION, sequence(0.5, 0.5, 0, 0.2, 0, 0.5))
    expect(jumper.velocity).toEqual({ x: -1 * 60, y: 2 * 60 })
  })

  it('fällt mit Chance straight gerade', () => {
    const jumper = new Jumper(WORLD, SIZE, MOTION, sequence(0.5, 0.05, 1, 0.9, 0, 0.5))
    expect(jumper.velocity.x).toBe(0)
  })
})

describe('Jumper – Flug', () => {
  it('bewegt sich mit dt', () => {
    const jumper = new Jumper(WORLD, SIZE, MOTION, sequence(0.5, 0.5, 0, 0.9, 0, 0.5))
    jumper.step(0.5, lines())
    expect(jumper.x).toBe(500 + 30)
    expect(jumper.bottom).toBe(60)
  })

  it('prallt am rechten Rand ab', () => {
    const jumper = new Jumper(WORLD, SIZE, MOTION, sequence(1, 0.5, 1, 0.9, 0, 0.5))
    jumper.step(0.1, lines())
    expect(jumper.x).toBeLessThanOrEqual(980)
    expect(jumper.velocity.x).toBe(-240)
  })

  it('rutscht mit Chance wallslide an der Wand herunter', () => {
    const jumper = new Jumper(WORLD, SIZE, MOTION, sequence(0, 0.5, 1, 0.2, 0, 0.05))
    jumper.step(0.1, lines())
    expect(jumper.x).toBe(20)
    expect(jumper.velocity.x).toBe(0)
    jumper.step(0.1, lines())
    expect(jumper.x).toBe(20)
  })
})

describe('Jumper – Landung', () => {
  const falling = (x: number) => new Jumper(WORLD, SIZE, MOTION, sequence(x, 0.05, 0, 0.9, 1, 0.5))

  it('landet, wenn die Mitte über der Fläche ist, und meldet den Abstand zur Mitte', () => {
    const jumper = falling(0.55) // x = 20 + 0.55 * 960 = 548
    let result = null
    while (!result) result = jumper.step(0.05, lines())
    expect(result).toEqual({ type: 'landed', offset: 48 })
    expect(jumper.bottom).toBe(1000)
    expect(jumper.state).toBe('landed')
  })

  it('stirbt neben der Fläche in der Todeszone', () => {
    const jumper = falling(0.1)
    let result = null
    while (!result) result = jumper.step(0.05, lines())
    expect(result).toEqual({ type: 'died' })
    expect(jumper.bottom).toBe(1040)
    expect(jumper.state).toBe('dead')
  })

  it('bewegt sich nach Landung oder Tod nicht mehr selbst', () => {
    const jumper = falling(0.1)
    while (jumper.state === 'falling') jumper.step(0.05, lines())
    const before = { x: jumper.x, bottom: jumper.bottom }
    expect(jumper.step(1, lines())).toBeNull()
    expect({ x: jumper.x, bottom: jumper.bottom }).toEqual(before)
  })

  it('landet auch, wenn die Fläche tiefer liegt als die Todeslinie', () => {
    const jumper = falling(0.55)
    let result = null
    while (!result)
      result = jumper.step(0.05, { pad: { center: 500, width: 200, top: 1060 }, death: 1040 })
    expect(result).toEqual({ type: 'landed', offset: 48 })
    expect(jumper.bottom).toBe(1040)
  })
})

describe('Jumper – resize', () => {
  it('schiebt die Figur zurück auf eine schmalere Bühne', () => {
    const jumper = new Jumper(WORLD, SIZE, MOTION, sequence(1, 0.5, 0, 0.9, 0, 0.5))
    jumper.resize(600)
    expect(jumper.x).toBe(580)
  })
})

describe('collide – Gleiter stoßen sich ab', () => {
  /** Figur an Stelle x (Wurf), mit Seitwärts-Wurf und Richtung; kein gerade, kein Wandrutschen. */
  const at = (xRoll: number, driftRoll: number, directionRoll: number) =>
    new Jumper(WORLD, SIZE, MOTION, sequence(xRoll, 0.5, driftRoll, directionRoll, 0, 0.5))
  // SIZE.width = 40: x = 20 + roll * 960

  it('lässt zwei aufeinander zufliegende, überlappende Gleiter voneinander abprallen', () => {
    const left = at(0.5, 0, 0.9) // x 500, nach rechts 60
    const right = at(0.52, 1, 0.1) // x 519,2, nach links 240
    expect(collide(left, right)).toBe(true)
    expect(left.velocity.x).toBe(-240)
    expect(right.velocity.x).toBe(240)
    expect(right.x - left.x).toBeCloseTo(40)
  })

  it('stößt auch einen gerade fallenden Gleiter weg', () => {
    const mover = at(0.5, 0, 0.9) // nach rechts 60
    const straight = new Jumper(WORLD, SIZE, MOTION, sequence(0.52, 0.05, 0, 0.9, 0, 0.5))
    expect(collide(mover, straight)).toBe(true)
    expect(mover.velocity.x).toBe(-60)
    expect(straight.velocity.x).toBe(60)
  })

  it('ignoriert Gleiter, die sich nicht berühren', () => {
    const a = at(0.5, 0, 0.9)
    const b = at(0.6, 0, 0.1)
    expect(collide(a, b)).toBe(false)
    expect(a.velocity.x).toBe(60)
  })

  it('ignoriert Gleiter, die sich schon voneinander entfernen', () => {
    const a = at(0.5, 0, 0.1) // nach links
    const b = at(0.52, 0, 0.9) // nach rechts
    expect(collide(a, b)).toBe(false)
  })

  it('ignoriert Gleiter auf deutlich verschiedener Höhe', () => {
    const a = at(0.5, 0, 0.9)
    const b = at(0.52, 1, 0.1)
    b.bottom = 70 // tiefer als eine Figurenhöhe (60)
    expect(collide(a, b)).toBe(false)
  })

  it('ignoriert gelandete und tote Figuren', () => {
    const a = at(0.5, 0, 0.9)
    const b = at(0.52, 1, 0.1)
    b.state = 'dead'
    expect(collide(a, b)).toBe(false)
  })
})
