import { describe, expect, it } from 'vitest'
import { landingScore, opacityFor } from './scoring'

describe('landingScore', () => {
  const pad = { center: 500, width: 200 }

  it('gibt 100 in der Mitte und 0 am Rand', () => {
    expect(landingScore(500, pad, 100)).toBe(100)
    expect(landingScore(400, pad, 100)).toBe(0)
    expect(landingScore(600, pad, 100)).toBe(0)
  })

  it('rechnet linear und rundet auf 2 Nachkommastellen', () => {
    expect(landingScore(550, pad, 100)).toBe(50)
    expect(landingScore(501.0333, pad, 100)).toBe(98.97)
  })

  it('begrenzt auf 0 außerhalb der Fläche', () => {
    expect(landingScore(350, pad, 100)).toBe(0)
  })

  it('wertet ab der Schwelle als 100', () => {
    expect(landingScore(504, pad, 95)).toBe(100)
    expect(landingScore(506, pad, 95)).toBe(94)
  })
})

describe('opacityFor', () => {
  it('zeigt nur die Bestplatzierten voll, andere und Tote halb', () => {
    const figures = [
      { id: 'a', state: 'landed', score: 80 },
      { id: 'b', state: 'landed', score: 95.5 },
      { id: 'c', state: 'dead', score: null },
      { id: 'd', state: 'falling', score: null },
    ] as const
    expect(opacityFor(figures)).toEqual({ a: 0.5, b: 1, c: 0.5, d: 1 })
  })

  it('zeigt bei Gleichstand alle Bestplatzierten voll', () => {
    const figures = [
      { id: 'a', state: 'landed', score: 90 },
      { id: 'b', state: 'landed', score: 90 },
    ] as const
    expect(opacityFor(figures)).toEqual({ a: 1, b: 1 })
  })
})
