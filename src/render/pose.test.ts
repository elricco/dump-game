import { describe, expect, it } from 'vitest'
import { MAX_TILT, poseFor } from './pose'

describe('poseFor', () => {
  it('schaut nach rechts und neigt sich nach rechts, wenn die Figur nach rechts fliegt', () => {
    const pose = poseFor({ x: 120, y: 240 }, -1)
    expect(pose.facing).toBe(1)
    expect(pose.tilt).toBeGreaterThan(0)
  })

  it('spiegelt nach links und neigt sich nach links, wenn sie nach links fliegt', () => {
    const pose = poseFor({ x: -120, y: 240 }, 1)
    expect(pose.facing).toBe(-1)
    expect(pose.tilt).toBeLessThan(0)
  })

  it('neigt sich stärker, je schneller sie seitwärts fliegt – höchstens MAX_TILT', () => {
    const slow = poseFor({ x: 60, y: 240 }, 1).tilt
    const fast = poseFor({ x: 240, y: 240 }, 1).tilt
    expect(fast).toBeGreaterThan(slow)
    expect(poseFor({ x: 10_000, y: 1 }, 1).tilt).toBe(MAX_TILT)
  })

  it('neigt sich dezent – höchstens 8°', () => {
    expect(MAX_TILT).toBe(8)
    expect(Math.abs(poseFor({ x: 120, y: 120 }, 1).tilt)).toBeLessThanOrEqual(8)
  })

  it('hängt gerade und behält die Blickrichtung, wenn sie senkrecht fällt', () => {
    expect(poseFor({ x: 0, y: 240 }, -1)).toEqual({ facing: -1, tilt: 0 })
  })
})
