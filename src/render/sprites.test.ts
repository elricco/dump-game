/* @vitest-environment jsdom */
import { describe, expect, it } from 'vitest'
import { colors } from '../generated/design-tokens'
import {
  createFigureElement,
  createGlider,
  createPixelFigure,
  createTargetPad,
  zoneBackground,
} from './sprites'

const fills = (svg: SVGElement) =>
  new Set([...svg.querySelectorAll('rect')].map((rect) => rect.getAttribute('fill')))

describe('createPixelFigure', () => {
  it('färbt den Anzug in der Spielerfarbe und nutzt die Design-Farben', () => {
    const svg = createPixelFigure('#8a2be2')
    expect(fills(svg)).toEqual(
      new Set([
        '#8a2be2',
        colors.outline,
        colors.skin,
        colors.helmet,
        colors.goggles,
        colors.boots,
      ]),
    )
    expect(svg.getAttribute('shape-rendering')).toBe('crispEdges')
  })
})

describe('Grafiken', () => {
  it('baut Gleiter und Zielscheibe als SVG', () => {
    expect(createGlider().tagName).toBe('svg')
    expect(createTargetPad().querySelectorAll('ellipse').length).toBeGreaterThanOrEqual(4)
  })

  it('liefert für Wasser und Lava ein kachelbares SVG-Muster', () => {
    expect(zoneBackground('target')).toMatch(/^url\("data:image\/svg\+xml,/)
    expect(zoneBackground('lava')).toContain(encodeURIComponent(colors.lava))
  })
})

describe('createFigureElement', () => {
  const base = { displayName: 'ElRicco', color: '#8a2be2', emote: null, withGlider: true }

  it('zeigt Gleiter, Pixel-Figur und den Namen in Spielerfarbe', () => {
    const element = createFigureElement(base)
    expect(element.querySelectorAll('svg')).toHaveLength(2)
    const name = element.querySelector('.figure__name')
    expect(name?.textContent).toBe('ElRicco')
    expect((name as HTMLElement).style.color).toBe('rgb(138, 43, 226)')
  })

  it('zeigt das Emote statt der Figur', () => {
    const element = createFigureElement({ ...base, emote: 'https://cdn.7tv.app/emote/x/4x.webp' })
    expect(element.querySelector('img')?.getAttribute('src')).toBe(
      'https://cdn.7tv.app/emote/x/4x.webp',
    )
    expect(element.querySelectorAll('svg')).toHaveLength(1)
  })

  it('setzt den Namen nie als HTML ein', () => {
    const element = createFigureElement({ ...base, displayName: '<img src=x>' })
    expect(element.querySelector('img')).toBeNull()
  })

  it('hat ein leeres Feld für die Prozentzahl', () => {
    expect(createFigureElement(base).querySelector('.figure__score')?.textContent).toBe('')
  })
})
