import { describe, expect, it } from 'vitest'
import { DEFAULT_COLORS, playerColor } from './colors'

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
