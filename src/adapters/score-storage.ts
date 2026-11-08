import type { Period, ScoreEntry } from '../core/highscores'

/** Der Teil von localStorage, den wir brauchen – in Tests ersetzbar. */
export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

const COLOR = /^#[0-9a-f]{6}$/

/** Gespeicherte Daten sind manipulierbar: nur vollständige, plausible Einträge übernehmen. */
function isEntry(value: unknown): value is ScoreEntry {
  if (typeof value !== 'object' || value === null) return false
  const entry = value as Record<string, unknown>
  return (
    typeof entry.login === 'string' &&
    typeof entry.displayName === 'string' &&
    typeof entry.color === 'string' &&
    COLOR.test(entry.color) &&
    typeof entry.score === 'number' &&
    entry.score >= 0 &&
    entry.score <= 100 &&
    typeof entry.at === 'number' &&
    Number.isFinite(entry.at)
  )
}

/**
 * Highscores je Kanal: bei `stream` nur im Speicher, sonst in localStorage.
 * Fehler des Speichers (privater Modus, voll, gesperrt) werden still ignoriert.
 */
export function createScoreStorage(channel: string, period: Period, storage: StorageLike) {
  const key = `dump-game:highscores:${channel}`
  let memory: ScoreEntry[] = []

  return {
    load(): ScoreEntry[] {
      if (period === 'stream') return memory
      try {
        const parsed: unknown = JSON.parse(storage.getItem(key) ?? '[]')
        return Array.isArray(parsed) ? parsed.filter(isEntry) : []
      } catch {
        return memory
      }
    },
    save(entries: ScoreEntry[]): void {
      memory = entries
      if (period === 'stream') return
      try {
        storage.setItem(key, JSON.stringify(entries))
      } catch {
        // Speicher nicht nutzbar – Highscores gelten dann nur bis zum Neuladen.
      }
    },
    clear(): void {
      memory = []
      try {
        storage.removeItem(key)
      } catch {
        // siehe save()
      }
    },
  }
}
