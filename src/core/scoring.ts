export type FigureState = 'falling' | 'landed' | 'dead'

export interface ScoredFigure {
  id: string
  state: FigureState
  score: number | null
}

const HALF = 0.5

/** Prozent nach Abstand zur Flächenmitte: Rand 0, Mitte 100; ab `difficulty` zählt 100. */
export function landingScore(
  x: number,
  pad: { center: number; width: number },
  difficulty: number,
): number {
  const ratio = 1 - Math.abs(x - pad.center) / (pad.width / 2)
  const score = Math.round(Math.max(0, Math.min(1, ratio)) * 10_000) / 100
  return score >= difficulty ? 100 : score
}

/** Nur die Bestplatzierten voll sichtbar; andere Gelandete und Tote halbdurchsichtig. */
export function opacityFor(figures: readonly ScoredFigure[]): Record<string, number> {
  const scores = figures.flatMap((figure) => (figure.state === 'landed' ? [figure.score ?? 0] : []))
  const best = Math.max(...scores)
  return Object.fromEntries(
    figures.map((figure) => {
      if (figure.state === 'dead') return [figure.id, HALF]
      if (figure.state === 'landed') return [figure.id, figure.score === best ? 1 : HALF]
      return [figure.id, 1]
    }),
  )
}
