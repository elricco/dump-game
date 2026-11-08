import { describe, expect, it } from 'vitest'
import { Bumper, GRAVITY, MAX_FALL } from './bumper'
import type { Lines } from './jumper'

const sequence = (...values: number[]) => {
  let index = 0
  return () => values[index++ % values.length] ?? 0
}

const SIZE = { width: 40, height: 60 }
const RADIUS = 13
const WORLD = 1000
const lines = (): Lines => ({ pad: { center: 500, width: 200, top: 1000 }, death: 1040 })
// Würfe: x, Seitwärts (0 → −60, 0,5 → 0, 1 → +60), danach Stupse
const at = (xRoll: number, vxRoll = 0.5, ...nudges: number[]) =>
  new Bumper(WORLD, SIZE, RADIUS, sequence(xRoll, vxRoll, ...(nudges.length ? nudges : [0.5])))

describe('Bumper – Start und Fall', () => {
  it('startet über der Bühne an zufälliger Stelle mit kleiner Seitwärtsbewegung', () => {
    const bumper = at(0, 0)
    expect(bumper.x).toBe(20)
    expect(bumper.bottom).toBe(0)
    expect(bumper.velocity).toEqual({ x: -60, y: 0 })
    expect(at(1, 1).velocity.x).toBe(60)
  })

  it('fällt mit Schwerkraft immer schneller, höchstens MAX_FALL', () => {
    const bumper = at(0.5)
    bumper.step(0.1, lines(), [])
    expect(bumper.velocity.y).toBeCloseTo(GRAVITY * 0.1)
    for (let i = 0; i < 20; i++) bumper.step(0.1, lines(), [])
    expect(bumper.velocity.y).toBe(MAX_FALL)
  })

  it('prallt an den Wänden ab', () => {
    const bumper = at(1, 1)
    bumper.step(0.1, lines(), [])
    expect(bumper.x).toBeLessThanOrEqual(980)
    expect(bumper.velocity.x).toBeLessThan(0)
  })
})

describe('Bumper – Stifte', () => {
  it('prallt an einem Stift unter sich nach oben ab und meldet den Treffer', () => {
    const bumper = at(0.5) // x = 500, gerade
    bumper.bottom = 117 // Kugelmitte = Figurmitte = 117 − 30 = 87 (+3 nach dem Schritt)
    bumper.velocity.y = 300
    const peg = { x: 500, y: 102, r: 9 } // Abstand ≈ 12 < 13 + 9 → Berührung
    const event = bumper.step(0.01, lines(), [peg])
    expect(event).toEqual({ type: 'peg' })
    expect(bumper.velocity.y).toBeLessThan(0)
  })

  it('ignoriert Stifte, die sie nicht berührt', () => {
    const bumper = at(0.5)
    expect(bumper.step(0.01, lines(), [{ x: 100, y: 500, r: 9 }])).toBeNull()
  })
})

describe('Bumper – Taumeln', () => {
  it('dreht sich in Richtung der Seitwärtsbewegung', () => {
    const right = at(0.5, 1)
    right.step(0.1, lines(), [])
    expect(right.spin).toBeGreaterThan(0)
    const left = at(0.5, 0)
    left.step(0.1, lines(), [])
    expect(left.spin).toBeLessThan(0)
  })

  it('dreht sich nicht, wenn sie gerade fällt', () => {
    const bumper = at(0.5, 0.5)
    bumper.step(0.1, lines(), [])
    expect(bumper.spin).toBe(0)
  })
})

describe('Bumper – Landung', () => {
  const settle = (bumper: Bumper) => {
    let result = null
    for (let i = 0; i < 2000 && !result; i++) {
      const event = bumper.step(1 / 60, lines(), [])
      if (event?.type !== 'peg') result = event
    }
    return result
  }

  it('landet wie ein Gleiter auf der Fläche und meldet den Abstand zur Mitte', () => {
    const bumper = at(0.55, 0.5) // x = 548, gerade
    expect(settle(bumper)).toEqual({ type: 'landed', offset: 48 })
    expect(bumper.bottom).toBe(1000)
    expect(bumper.state).toBe('landed')
  })

  it('stirbt neben der Fläche', () => {
    const bumper = at(0.1, 0.5)
    expect(settle(bumper)).toEqual({ type: 'died' })
    expect(bumper.bottom).toBe(1040)
  })
})
