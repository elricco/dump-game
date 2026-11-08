/* @vitest-environment jsdom */
import { describe, expect, it } from 'vitest'
import { applyConfigVars, applyDesignVars, setUnit } from './design-vars'

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
    expect(stage.style.getPropertyValue('--scoreboard-inset')).toBe('16')
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

describe('applyConfigVars', () => {
  it('legt Farben, Schriften und Abstände der Config-Seite an', () => {
    const root = document.createElement('div')
    applyConfigVars(root)
    expect(root.style.getPropertyValue('--color-pageBg')).toBe('#14161c')
    expect(root.style.getPropertyValue('--config-title-size')).toBe('24px')
    expect(root.style.getPropertyValue('--config-heading-size')).toBe('12px')
    expect(root.style.getPropertyValue('--config-body-size')).toBe('16px')
    expect(root.style.getPropertyValue('--config-label-size')).toBe('15px')
    expect(root.style.getPropertyValue('--config-label-weight')).toBe('600')
    expect(root.style.getPropertyValue('--config-code-size')).toBe('14px')
    expect(root.style.getPropertyValue('--config-gap')).toBe('16px')
    expect(root.style.getPropertyValue('--config-section')).toBe('24px')
    expect(root.style.getPropertyValue('--config-focus')).toBe('3px')
    expect(root.style.getPropertyValue('--pixel-font')).toBe('"Press Start 2P"')
  })
})
