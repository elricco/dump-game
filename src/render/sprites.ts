import { shade } from '../core/colors'
import { colors } from '../generated/design-tokens'
import { pixelRuns, rasterize, withOutline } from './pixel-art'

const SVG_NS = 'http://www.w3.org/2000/svg'
/** Überlappung je Pixel: verhindert helle Fugen, wenn das Rig gedreht wird. */
const SEAM = 0.06

/**
 * Pixel-Männchen im 16-Bit-Look (16 × 22), schaut nach rechts, hängt mit
 * erhobenen Armen am Gleiter. Licht von links oben.
 * c/l/C = Anzug Basis/Licht/Schatten (aus der Spielerfarbe), w = Handschuhe,
 * h/L/H = Helm Basis/Licht/Schatten, g/G = Brille/Glanz, s/S = Haut/Schatten,
 * k = Gürtel, b/B = Stiefel/Licht.
 */
const FIGURE = [
  '...ww......ww...',
  '...ww......ww...',
  '...lc......lC...',
  '...lc..LLh.lC...',
  '...lc.LhhhHlC...',
  '...lc.hhhhHlC...',
  '...lc.HggGGlC...',
  '...lc.sssSSlC...',
  '...lc..ssS.lC...',
  '...lccccccclC...',
  '....lcccccccC...',
  '....lccccccCC...',
  '....lccccccCC...',
  '....kkkkkkkkk...',
  '....lcccccCCC...',
  '....lcc..cCC....',
  '....lcc..cCC....',
  '....lcc..cCC....',
  '....lcc..cCC....',
  '....lcc..cCC....',
  '....bbb..bbB....',
  '....bbbB.bbbB...',
]

/**
 * Gleiter (48 × 16) als sichelförmiger Flügel, Nase rechts, darunter der
 * Steuerbügel. a/A = Segel/Schatten, r = Streifen an der Vorderkante, k = Bügel.
 */
const GLIDER = (() => {
  const top = (x: number) => 10 - 9 * Math.sin((Math.PI * x) / 60)
  const bottom = (x: number) => 12.5 - 5 * Math.sin((Math.PI * x) / 60)
  const nearSegment = (px: number, py: number, ax: number, ay: number, bx: number, by: number) => {
    const t = Math.max(
      0,
      Math.min(
        1,
        ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2),
      ),
    )
    return Math.hypot(px - (ax + t * (bx - ax)), py - (ay + t * (by - ay))) < 0.6
  }
  return rasterize(48, 16, (x, y) => {
    const px = x + 0.5
    const py = y + 0.5
    if (py >= top(px) && py <= bottom(px)) {
      if (py < top(px) + 1.3) return 'r'
      return py > bottom(px) - 1.6 ? 'A' : 'a'
    }
    if (nearSegment(px, py, 26, 9, 20.5, 15.5) || nearSegment(px, py, 26, 9, 31.5, 15.5)) return 'k'
    if (y === 15 && x >= 18 && x <= 33) return 'k'
    return '.'
  })
})()

/** Flach liegende Zielscheibe (65 × 15) mit fünf Ringen und Kante. */
const TARGET = rasterize(65, 15, (x, y) => {
  const dx = (x + 0.5 - 32.5) / 31.5
  const top = Math.hypot(dx, (y + 0.5 - 6) / 5.5)
  if (top < 1) {
    const bands = [0.18, 0.42, 0.66, 0.88]
    const ring = bands.findIndex((limit) => top < limit)
    return ring === -1 || ring % 2 === 0 ? 'r' : 'w'
  }
  return Math.hypot(dx, (y + 0.5 - 8.5) / 5.5) < 1 ? 'R' : '.'
})

/** Stift als Metallkugel (10 × 10, mit Kontur 12 × 12): Glanz oben links, Schatten unten rechts. */
const PEG = rasterize(10, 10, (x, y) => {
  const dx = x + 0.5 - 5
  const dy = y + 0.5 - 5
  if (Math.hypot(dx, dy) >= 5) return '.'
  if (Math.hypot(dx + 2, dy + 2) < 1.6) return 'l'
  return dx + dy > 3 ? 'd' : 'b'
})

/** Kachelbares Wasser (30 × 20): Kamm, Tiefe, Glitzer. */
const WATER = rasterize(30, 20, (x, y) => {
  const crest = 2.5 + 1.5 * Math.sin((x / 30) * Math.PI * 4)
  if (y < crest - 1) return '.'
  if (y < crest + 1) return 'l'
  if (y > 13 && (x + y) % 2 === 0) return 'd'
  if (y > 16) return 'd'
  if ((x * 7 + y * 3) % 23 === 0) return 'l'
  return 'b'
})

/** Kachelbare Lava (30 × 20): Kruste oben, Glutblasen, Tiefe. */
const LAVA = rasterize(30, 20, (x, y) => {
  const crust = 1.5 + 1.2 * Math.sin((x / 30) * Math.PI * 6)
  if (y < crust) return 'k'
  if (Math.hypot(x - 8, y - 9) < 2.6 || Math.hypot(x - 22, y - 14) < 1.8) return 'g'
  if (y > 14 && (x + y) % 2 === 0) return 'd'
  if ((x * 5 + y * 11) % 29 === 0) return 'k'
  return 'b'
})

function pixelSvg(
  rows: readonly string[],
  palette: Record<string, string>,
  className: string,
): SVGSVGElement {
  const element = document.createElementNS(SVG_NS, 'svg')
  element.setAttribute('viewBox', `0 0 ${rows[0]?.length ?? 0} ${rows.length}`)
  element.setAttribute('shape-rendering', 'crispEdges')
  element.setAttribute('preserveAspectRatio', 'none')
  element.setAttribute('aria-hidden', 'true')
  element.classList.add(className)
  for (const run of pixelRuns(rows, palette)) {
    const rect = document.createElementNS(SVG_NS, 'rect')
    rect.setAttribute('x', String(run.x))
    rect.setAttribute('y', String(run.y))
    rect.setAttribute('width', String(run.width + SEAM))
    rect.setAttribute('height', String(1 + SEAM))
    rect.setAttribute('fill', run.fill)
    element.append(rect)
  }
  return element
}

export function createPixelFigure(suit: string): SVGSVGElement {
  return pixelSvg(
    withOutline(FIGURE),
    {
      c: suit,
      l: shade(suit, 0.3),
      C: shade(suit, -0.35),
      w: colors.gloves,
      h: colors.helmet,
      L: colors.helmetLight,
      H: colors.helmetShadow,
      g: colors.goggles,
      G: colors.gogglesGlint,
      s: colors.skin,
      S: colors.skinShadow,
      k: colors.belt,
      b: colors.boots,
      B: colors.bootsLight,
      o: colors.outline,
    },
    'figure__body',
  )
}

export function createGlider(): SVGSVGElement {
  return pixelSvg(
    withOutline(GLIDER),
    {
      a: colors.glider,
      A: colors.gliderShade,
      r: colors.gliderStripe,
      k: colors.outline,
      o: colors.outline,
    },
    'figure__glider',
  )
}

export function createTargetPad(): SVGSVGElement {
  return pixelSvg(
    withOutline(TARGET),
    { r: colors.targetRed, w: colors.targetWhite, R: colors.targetRim, o: colors.outline },
    'pad__target',
  )
}

export function createPeg(): SVGSVGElement {
  return pixelSvg(
    withOutline(PEG),
    { b: colors.peg, l: colors.pegLight, d: colors.pegShadow, o: colors.outline },
    'peg__ball',
  )
}

/** Kachelbares Muster der Todeszone als CSS-Hintergrund. Nur eigene Konstanten. */
export function zoneBackground(theme: 'target' | 'lava'): string {
  const [rows, palette] =
    theme === 'lava'
      ? [LAVA, { b: colors.lava, d: colors.lavaDeep, g: colors.lavaGlow, k: colors.lavaCrust }]
      : [WATER, { b: colors.water, d: colors.waterDeep, l: colors.waterLight }]
  const rects = pixelRuns(rows, palette)
    .map(
      (run) =>
        `<rect x="${run.x}" y="${run.y}" width="${run.width}" height="1" fill="${run.fill}"/>`,
    )
    .join('')
  const markup = `<svg xmlns="${SVG_NS}" width="120" height="80" viewBox="0 0 30 20" shape-rendering="crispEdges">${rects}</svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(markup)}")`
}

export interface FigureView {
  displayName: string
  color: string
  emote: string | null
  withGlider: boolean
}

/**
 * Figur-Element: Prozentzahl und Name (bleiben gerade), darunter das „Rig"
 * aus Gleiter und Pixel-Figur bzw. Emote – nur das Rig wird geneigt/gespiegelt.
 */
export function createFigureElement(view: FigureView): HTMLElement {
  const element = document.createElement('div')
  element.className = 'figure'

  const score = document.createElement('div')
  score.className = 'figure__score'

  const name = document.createElement('div')
  name.className = 'figure__name'
  name.textContent = view.displayName
  name.style.color = view.color

  const rig = document.createElement('div')
  rig.className = 'figure__rig'
  if (view.withGlider) rig.append(createGlider())
  if (view.emote) {
    const emote = document.createElement('img')
    emote.className = 'figure__emote'
    emote.src = view.emote
    emote.alt = ''
    rig.append(emote)
  } else {
    rig.append(createPixelFigure(view.color))
  }

  element.append(score, name, rig)
  return element
}
