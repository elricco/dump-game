import { describe, expect, it } from 'vitest'
import { bounceOffPeg, pegLayout } from './pegs'

describe('pegLayout', () => {
  const rows = (width: number) => {
    const byRow = new Map<number, number[]>()
    for (const peg of pegLayout(width)) byRow.set(peg.y, [...(byRow.get(peg.y) ?? []), peg.x])
    return [...byRow.entries()]
  }

  it('legt 5 versetzte Reihen mit abwechselnd 10 und 11 Stiften an', () => {
    expect(rows(1920).map(([, xs]) => xs.length)).toEqual([10, 11, 10, 11, 10])
  })

  it('verteilt die Reihen zwischen 25 % und 80 % der Höhe', () => {
    const ys = rows(1920).map(([y]) => y)
    expect(ys[0]).toBe(270)
    expect(ys.at(-1)).toBe(864)
  })

  it('verteilt die Spalten gleichmäßig über die Breite, versetzt um eine halbe Spalte', () => {
    const [[, first = []] = [], [, second = []] = []] = rows(1100)
    expect(first[0]).toBe(100)
    expect(first.at(-1)).toBe(1000)
    expect(second[0]).toBe(50)
    expect(second.at(-1)).toBe(1050)
  })
})

describe('bounceOffPeg', () => {
  const peg = { x: 100, y: 100, r: 10 }

  it('liefert null ohne Berührung', () => {
    expect(bounceOffPeg({ x: 100, y: 70, vx: 0, vy: 200, r: 10 }, peg, 0.5, 0)).toBeNull()
  })

  it('wirft eine senkrecht fallende Figur gedämpft nach oben zurück und schiebt sie heraus', () => {
    const result = bounceOffPeg({ x: 100, y: 85, vx: 0, vy: 200, r: 10 }, peg, 0.5, 0)
    expect(result).toEqual({ x: 100, y: 80, vx: 0, vy: -100 })
  })

  it('lenkt bei einem seitlichen Treffer zur Seite ab', () => {
    const result = bounceOffPeg({ x: 110, y: 88, vx: 0, vy: 200, r: 10 }, peg, 0.5, 0)
    expect(result?.vx).toBeGreaterThan(0)
    expect(Math.hypot((result?.x ?? 0) - 100, (result?.y ?? 0) - 100)).toBeCloseTo(20)
  })

  it('gibt den Stups seitwärts dazu', () => {
    expect(bounceOffPeg({ x: 100, y: 85, vx: 0, vy: 200, r: 10 }, peg, 0.5, 30)?.vx).toBe(30)
  })

  it('ändert die Geschwindigkeit nicht, wenn sich die Figur schon entfernt', () => {
    const result = bounceOffPeg({ x: 100, y: 85, vx: 0, vy: -50, r: 10 }, peg, 0.5, 0)
    expect(result).toEqual({ x: 100, y: 80, vx: 0, vy: -50 })
  })
})
