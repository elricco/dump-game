import { colors } from '../generated/design-tokens'
import { withOutline } from './pixel-art'

const SVG_NS = 'http://www.w3.org/2000/svg'

/**
 * Pixel-Männchen, hängt mit erhobenen Armen am Gleiter (10 × 15).
 * c = Anzug (Spielerfarbe), s = Haut, h = Helm, g = Brille, b = Stiefel, o = Gürtel.
 */
const FIGURE = [
  '.s......s.',
  '.c.hhhh.c.',
  '.c.hhhh.c.',
  '.c.gggg.c.',
  '.c.ssss.c.',
  '.cc.ss.cc.',
  '..cccccc..',
  '..cccccc..',
  '..oooooo..',
  '..cccccc..',
  '..cc..cc..',
  '..cc..cc..',
  '..cc..cc..',
  '..bb..bb..',
  '.bbb..bbb.',
]

function svg(width: number, height: number): SVGSVGElement {
  const element = document.createElementNS(SVG_NS, 'svg')
  element.setAttribute('viewBox', `0 0 ${width} ${height}`)
  element.setAttribute('aria-hidden', 'true')
  return element
}

function shape(name: string, attributes: Record<string, string | number>): SVGElement {
  const element = document.createElementNS(SVG_NS, name)
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, String(value))
  return element
}

export function createPixelFigure(suit: string): SVGSVGElement {
  const palette: Record<string, string> = {
    c: suit,
    s: colors.skin,
    h: colors.helmet,
    g: colors.goggles,
    b: colors.boots,
    o: colors.outline,
  }
  const rows = withOutline(FIGURE)
  const element = svg(rows[0]?.length ?? 0, rows.length)
  element.setAttribute('shape-rendering', 'crispEdges')
  element.classList.add('figure__body')
  rows.forEach((row, y) =>
    [...row].forEach((cell, x) => {
      const fill = palette[cell]
      if (fill) element.append(shape('rect', { x, y, width: 1, height: 1, fill }))
    }),
  )
  return element
}

/** Delta-Flügel mit Schattenseite, Signalstreifen und Steuerbügel (120 × 44). */
export function createGlider(): SVGSVGElement {
  const element = svg(120, 44)
  element.setAttribute('preserveAspectRatio', 'none')
  element.classList.add('figure__glider')
  const stroke = { stroke: colors.outline, 'stroke-width': 2, 'stroke-linejoin': 'round' }
  element.append(
    shape('polygon', { points: '2,26 60,4 118,26 60,20', fill: colors.glider, ...stroke }),
    shape('polygon', { points: '60,4 118,26 60,20', fill: colors.gliderShade }),
    shape('polyline', {
      points: '8,24 60,6 112,24',
      fill: 'none',
      stroke: colors.gliderStripe,
      'stroke-width': 3,
    }),
    shape('polyline', { points: '60,20 46,42 74,42 60,20', fill: 'none', ...stroke }),
  )
  return element
}

/** Flach liegende Zielscheibe mit sichtbarer Kante (260 × 60). */
export function createTargetPad(): SVGSVGElement {
  const element = svg(260, 60)
  element.classList.add('pad__target')
  const ring = (cy: number, rx: number, ry: number, fill: string) =>
    shape('ellipse', { cx: 130, cy, rx, ry, fill, stroke: colors.outline, 'stroke-width': 2 })
  element.append(
    ring(36, 126, 22, colors.targetRim),
    ring(28, 126, 22, colors.targetRed),
    ring(28, 94, 16, colors.targetWhite),
    ring(28, 62, 11, colors.targetRed),
    ring(28, 30, 5, colors.targetWhite),
  )
  return element
}

const tile = (content: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="${SVG_NS}" width="120" height="80" viewBox="0 0 120 80">${content}</svg>`,
  )}")`

/** Kachelbares Muster der Todeszone für die eingebauten Themes. Nur eigene Konstanten. */
export function zoneBackground(theme: 'target' | 'lava'): string {
  if (theme === 'lava') {
    return tile(
      `<rect width="120" height="80" fill="${colors.lava}"/>` +
        `<ellipse cx="30" cy="44" rx="18" ry="7" fill="${colors.lavaGlow}"/>` +
        `<ellipse cx="88" cy="60" rx="14" ry="5" fill="${colors.lavaGlow}"/>` +
        `<path d="M0 10 Q15 0 30 8 T60 8 T90 6 T120 10 V0 H0Z" fill="${colors.lavaCrust}"/>` +
        `<ellipse cx="70" cy="30" rx="10" ry="4" fill="${colors.lavaCrust}"/>`,
    )
  }
  return tile(
    `<rect width="120" height="80" fill="${colors.water}"/>` +
      `<path d="M0 12 Q15 0 30 12 T60 12 T90 12 T120 12 V20 H0Z" fill="${colors.waterLight}"/>` +
      `<rect x="14" y="44" width="26" height="4" fill="${colors.waterLight}"/>` +
      `<rect x="74" y="62" width="30" height="4" fill="${colors.waterLight}"/>`,
  )
}

export interface FigureView {
  displayName: string
  color: string
  emote: string | null
  withGlider: boolean
}

/** Figur-Element: Prozentzahl, Name, ggf. Gleiter, dann Pixel-Figur oder Emote. */
export function createFigureElement(view: FigureView): HTMLElement {
  const element = document.createElement('div')
  element.className = 'figure'

  const score = document.createElement('div')
  score.className = 'figure__score'

  const name = document.createElement('div')
  name.className = 'figure__name'
  name.textContent = view.displayName
  name.style.color = view.color

  element.append(score, name)
  if (view.withGlider) element.append(createGlider())

  if (view.emote) {
    const emote = document.createElement('img')
    emote.className = 'figure__emote'
    emote.src = view.emote
    emote.alt = ''
    element.append(emote)
  } else {
    element.append(createPixelFigure(view.color))
  }
  return element
}
