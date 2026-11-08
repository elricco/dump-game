/* @vitest-environment jsdom */
import { describe, expect, it } from 'vitest'
import { applyDesignVars, setUnit } from './design-vars'

describe('applyDesignVars', () => {
  it('legt Farben, Schrift und Abstände aus der DESIGN.md als CSS-Variablen an', () => {
    const stage = document.createElement('div')
    applyDesignVars(stage, 1.5)
    expect(stage.style.getPropertyValue('--color-outline')).toBe('#0e0e10')
    expect(stage.style.getPropertyValue('--name-size')).toBe('8')
    expect(stage.style.getPropertyValue('--font')).toBe('"Press Start 2P"')
    expect(stage.style.getPropertyValue('--name-weight')).toBe('400')
    expect(stage.style.getPropertyValue('--name-spacing')).toBe('0')
    expect(stage.style.getPropertyValue('--score-size')).toBe('8')
    expect(stage.style.getPropertyValue('--label-gap')).toBe('2')
    expect(stage.style.getPropertyValue('--outline-width')).toBe('2')
    expect(stage.style.getPropertyValue('--scale')).toBe('1.5')
    expect(stage.style.getPropertyValue('--figure-w')).toBe('27')
    expect(stage.style.getPropertyValue('--figure-h')).toBe('36')
    expect(stage.style.getPropertyValue('--glider-w')).toBe('75')
    expect(stage.style.getPropertyValue('--glider-h')).toBe('27')
    expect(stage.style.getPropertyValue('--emote-h')).toBe('36')
  })
})

describe('setUnit', () => {
  it('rechnet die Fensterhöhe in px pro Referenz-px um', () => {
    const stage = document.createElement('div')
    expect(setUnit(stage, 1440)).toBeCloseTo(1440 / 1080)
    expect(stage.style.getPropertyValue('--u')).toBe(String(1440 / 1080))
  })
})
