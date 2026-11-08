import { describe, expect, it } from 'vitest'
import { DEFAULT_COLORS, playerColor, shade } from './colors'

describe('playerColor', () => {
  it('nimmt die Chatfarbe, wenn vorhanden', () => {
    expect(playerColor('anna', '#8a2be2')).toBe('#8a2be2')
  })

  it('wählt ohne Chatfarbe eine feste Farbe je Login aus der Palette', () => {
    const color = playerColor('anna', null)
    expect(DEFAULT_COLORS).toContain(color)
    expect(playerColor('anna', null)).toBe(color)
  })

  it('verteilt verschiedene Logins auf verschiedene Farben', () => {
    const colors = new Set(
      ['anna', 'bert', 'cem', 'dora', 'emil', 'fritz'].map((l) => playerColor(l, null)),
    )
    expect(colors.size).toBeGreaterThan(3)
  })
})

describe('shade', () => {
  it('hellt Richtung Weiß auf und dunkelt Richtung Schwarz ab', () => {
    expect(shade('#808080', 0.5)).toBe('#c0c0c0')
    expect(shade('#808080', -0.5)).toBe('#404040')
  })

  it('lässt die Farbe bei 0 gleich und erreicht bei ±1 Weiß bzw. Schwarz', () => {
    expect(shade('#8a2be2', 0)).toBe('#8a2be2')
    expect(shade('#8a2be2', 1)).toBe('#ffffff')
    expect(shade('#8a2be2', -1)).toBe('#000000')
  })
})
