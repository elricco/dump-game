/* @vitest-environment jsdom */
import { describe, expect, it } from 'vitest'
import { parseConfig } from '../core/config'
import { themeSizes } from './theme-sizes'

const config = (query: string) => {
  const result = parseConfig(new URLSearchParams(`channel=elricco1978&${query}`))
  if (!result.ok) throw new Error(result.error)
  return result.config
}

describe('themeSizes', () => {
  it('gibt Landefläche und Todeszone 1,5-fache Größe, Figuren bleiben klein', async () => {
    const sizes = await themeSizes(config('theme=target'))
    expect(sizes.pad).toEqual({ width: 201, height: 51, surface: 19.5 })
    expect(sizes.death).toEqual({ height: 60, surface: 30 })
    expect(sizes.figure).toEqual({ width: 75, height: 36 })
    expect(sizes.bump).toEqual({ width: 27, height: 36 })
    expect(sizes.peg).toBe(9)
  })

  it('nutzt bei custom 75 bzw. 66 px Höhe und die Standhöhen aus der Config', async () => {
    const sizes = await themeSizes(
      config(
        'theme=custom&land=https://a.example/l.png&death=https://a.example/d.png&land_surface=0.4&death_surface=0.8',
      ),
    )
    expect(sizes.pad.height).toBe(75)
    expect(sizes.pad.surface).toBeCloseTo(30)
    expect(sizes.death).toEqual({ height: 66, surface: 66 * 0.8 })
  })
})
