import type { FigureState } from './scoring'

/** Wo gelandet bzw. gestorben wird (Referenz-px, y wächst nach unten). */
export interface Lines {
  pad: { center: number; width: number; top: number }
  death: number
}

export type LandingEvent = { type: 'landed'; offset: number } | { type: 'died' }

interface Body {
  x: number
  bottom: number
  state: FigureState
}

/**
 * Landet die Figur auf der Fläche (Mitte über der Fläche, Standlinie gerade
 * überschritten) oder stirbt sie in der Todeszone? Setzt Höhe und Zustand.
 */
export function settle(body: Body, previousBottom: number, lines: Lines): LandingEvent | null {
  const landingLine = Math.min(lines.pad.top, lines.death)
  if (previousBottom < landingLine && body.bottom >= landingLine) {
    const offset = body.x - lines.pad.center
    if (Math.abs(offset) <= lines.pad.width / 2) {
      body.bottom = landingLine
      body.state = 'landed'
      return { type: 'landed', offset }
    }
  }
  if (body.bottom >= lines.death) {
    body.bottom = lines.death
    body.state = 'dead'
    return { type: 'died' }
  }
  return null
}
