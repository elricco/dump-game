import type { Highscore } from './config'

export interface ScoreEntry {
  login: string
  displayName: string
  color: string
  score: number
  /** Zeitpunkt der Landung (ms seit Epoch) */
  at: number
}

export type Period = Exclude<Highscore, 'off'>

const TOP = 5

/** Beginn des Zeitraums in Ortszeit: Tag 00:00, Woche Montag 00:00; sonst ohne Grenze. */
export function periodStart(period: Period, now: Date): number {
  if (period === 'stream' || period === 'forever') return -Infinity
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (period === 'week') start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
  return start.getTime()
}

/** Trägt eine Landung ein: nur Einträge im Zeitraum, je Person der Bestwert (bei Gleichstand der frühere). */
export function recordScore(
  entries: readonly ScoreEntry[],
  entry: ScoreEntry,
  period: Period,
  now: Date,
): ScoreEntry[] {
  const start = periodStart(period, now)
  const current = entries.filter((existing) => existing.at >= start)
  const previous = current.find((existing) => existing.login === entry.login)
  if (previous && previous.score >= entry.score) return current
  return [...current.filter((existing) => existing.login !== entry.login), entry]
}

/** Die besten Einträge im Zeitraum: absteigend nach Punkten, bei Gleichstand wer früher da war. */
export function topScores(
  entries: readonly ScoreEntry[],
  period: Period = 'forever',
  now: Date = new Date(),
  limit = TOP,
): ScoreEntry[] {
  const start = periodStart(period, now)
  return entries
    .filter((entry) => entry.at >= start)
    .sort((a, b) => b.score - a.score || a.at - b.at)
    .slice(0, limit)
}
