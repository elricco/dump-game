import type { HighscoreSize } from '../core/config'
import type { ScoreEntry } from '../core/highscores'
import { formatScore } from './format'

/** Highscore-Liste oben rechts. Nur textContent; Farbe nur aus geprüften #rrggbb-Werten. */
export function createScoreboard(stage: HTMLElement, size: HighscoreSize) {
  const list = document.createElement('ol')
  list.className = 'scoreboard'
  list.hidden = true
  list.setAttribute('aria-label', 'Highscores')
  list.style.setProperty('--board-size', size)
  stage.append(list)

  return {
    render(entries: readonly ScoreEntry[], visible: boolean): void {
      list.hidden = !visible || entries.length === 0
      list.replaceChildren(
        ...entries.map((entry, index) => {
          const row = document.createElement('li')
          const name = document.createElement('span')
          name.className = 'scoreboard__name'
          name.textContent = entry.displayName
          name.style.color = entry.color
          row.append(`${index + 1}. `, name, ` ${formatScore(entry.score)}`)
          return row
        }),
      )
    },
  }
}
