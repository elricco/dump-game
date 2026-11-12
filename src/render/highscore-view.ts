import { createScoreStorage, type StorageLike } from '../adapters/score-storage'
import type { Config } from '../core/config'
import type { Game, GameEvent } from '../core/game'
import { recordScore, topScores, type ScoreEntry } from '../core/highscores'
import { createScoreboard } from './scoreboard'

const memoryStorage = (): StorageLike => {
  const data = new Map<string, string>()
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  }
}

function browserStorage(): StorageLike {
  try {
    return window.localStorage
  } catch {
    return memoryStorage()
  }
}

/** Verbindet Spiel, Speicher und Anzeige der Highscores; mit highscore=off ein No-op. */
export function createHighscores(stage: HTMLElement, config: Config) {
  const period = config.highscore
  if (period === 'off') return { onGameEvents: () => {}, sync: () => {}, clear: () => {} }

  const storage = createScoreStorage(config.channel, period, browserStorage())
  const board = createScoreboard(stage, config.highscoreSize)
  let entries: ScoreEntry[] = storage.load()
  let shown: boolean | null = null

  const draw = (visible: boolean) => {
    shown = visible
    board.render(topScores(entries, period, new Date()), visible)
  }

  return {
    onGameEvents(game: Game, events: readonly GameEvent[]): void {
      let changed = false
      for (const event of events) {
        if (event.type !== 'landed') continue
        const figure = game.figures.find((candidate) => candidate.id === event.id)
        if (!figure) continue
        const entry = {
          login: figure.login,
          displayName: figure.displayName,
          color: figure.color,
          score: event.score,
          at: Date.now(),
        }
        entries = recordScore(entries, entry, period, new Date())
        changed = true
      }
      if (changed) {
        storage.save(entries)
        draw(game.figures.length > 0)
      }
    },
    /** Sichtbarkeit an die Runde koppeln (nur bei Änderung neu zeichnen). */
    sync(game: Game): void {
      const visible = game.figures.length > 0
      if (visible !== shown) draw(visible)
    },
    clear(): void {
      entries = []
      storage.clear()
      draw(shown ?? false)
    },
  }
}
