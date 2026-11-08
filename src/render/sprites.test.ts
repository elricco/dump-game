/* @vitest-environment jsdom */
import { describe, expect, it } from 'vitest'
import { shade } from '../core/colors'
import { colors } from '../generated/design-tokens'
import {
  createFigureElement,
  createGlider,
  createPeg,
  createPixelFigure,
  createTargetPad,
  zoneBackground,
} from './sprites'

const fills = (svg: Element) =>
  new Set([...svg.querySelectorAll('rect')].map((rect) => rect.getAttribute('fill')))

describe('createPixelFigure', () => {
  const suit = '#8a2be2'

  it('schattiert den Anzug aus der Spielerfarbe in drei Tönen', () => {
    const used = fills(createPixelFigure(suit))
    expect(used).toContain(suit)
    expect(used).toContain(shade(suit, 0.3))
    expect(used).toContain(shade(suit, -0.35))
  })

  it('nutzt sonst nur Farben aus der DESIGN.md', () => {
    const allowed = new Set<string>([
      suit,
      shade(suit, 0.3),
      shade(suit, -0.35),
      ...Object.values(colors),
    ])
    for (const fill of fills(createPixelFigure(suit))) expect(allowed).toContain(fill)
  })

  it('lässt Pixel minimal überlappen, damit beim Drehen keine Fugen entstehen', () => {
    const rect = createPixelFigure(suit).querySelector('rect')
    expect(Number(rect?.getAttribute('height'))).toBeGreaterThan(1)
    expect(Number(rect?.getAttribute('width')) % 1).toBeGreaterThan(0)
  })

  it('ist ein 18 × 24-Raster (16 × 22 plus Kontur) mit harten Kanten', () => {
    const svg = createPixelFigure(suit)
    expect(svg.getAttribute('viewBox')).toBe('0 0 18 24')
    expect(svg.getAttribute('shape-rendering')).toBe('crispEdges')
  })
})

describe('Pixel-Grafiken', () => {
  it('baut den Gleiter als 50 × 18-Raster mit Streifen und Schatten', () => {
    const glider = createGlider()
    expect(glider.getAttribute('viewBox')).toBe('0 0 50 18')
    expect(fills(glider)).toEqual(
      new Set([colors.glider, colors.gliderShade, colors.gliderStripe, colors.outline]),
    )
  })

  it('baut den Stift als 12 × 12-Pixelkugel mit Glanz und Schatten', () => {
    const peg = createPeg()
    expect(peg.getAttribute('viewBox')).toBe('0 0 12 12')
    expect(fills(peg)).toEqual(
      new Set([colors.peg, colors.pegLight, colors.pegShadow, colors.outline]),
    )
  })

  it('baut die Zielscheibe mit Ringen und Kante', () => {
    expect(fills(createTargetPad())).toEqual(
      new Set([colors.targetRed, colors.targetWhite, colors.targetRim, colors.outline]),
    )
  })

  it('liefert für Wasser und Lava ein kachelbares Pixel-Muster', () => {
    expect(zoneBackground('target')).toMatch(/^url\("data:image\/svg\+xml,/)
    expect(zoneBackground('target')).toContain(encodeURIComponent(colors.waterDeep))
    expect(zoneBackground('lava')).toContain(encodeURIComponent(colors.lavaGlow))
  })
})

describe('createFigureElement', () => {
  const base = { displayName: 'ElRicco', color: '#8a2be2', emote: null, withGlider: true }

  it('steckt Gleiter und Figur in ein drehbares Rig, Name und Prozent bleiben draußen', () => {
    const element = createFigureElement(base)
    const rig = element.querySelector('.figure__rig')
    expect(rig?.querySelectorAll('svg')).toHaveLength(2)
    expect(rig?.querySelector('.figure__name')).toBeNull()
    const name = element.querySelector('.figure__name')
    expect(name?.textContent).toBe('ElRicco')
    expect((name as HTMLElement).style.color).toBe('rgb(138, 43, 226)')
  })

  it('zeigt das Emote statt der Figur', () => {
    const element = createFigureElement({ ...base, emote: 'https://cdn.7tv.app/emote/x/4x.webp' })
    expect(element.querySelector('.figure__rig img')?.getAttribute('src')).toBe(
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
