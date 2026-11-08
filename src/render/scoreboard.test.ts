/* @vitest-environment jsdom */
import { describe, expect, it } from 'vitest'
import type { ScoreEntry } from '../core/highscores'
import { createScoreboard } from './scoreboard'

const entry = (displayName: string, score: number, color = '#8a2be2'): ScoreEntry => ({
  login: displayName.toLowerCase(),
  displayName,
  color,
  score,
  at: 0,
})

describe('createScoreboard', () => {
  it('zeigt Rang, Name in Spielerfarbe und Prozent', () => {
    const stage = document.createElement('div')
    createScoreboard(stage).render([entry('Anna', 98.96), entry('Bert', 100, '#ff4500')], true)
    const rows = [...stage.querySelectorAll('.scoreboard li')]
    expect(rows.map((row) => row.textContent)).toEqual(['1. Anna 98,96 %', '2. Bert 100 %'])
    expect((rows[1]?.querySelector('.scoreboard__name') as HTMLElement).style.color).toBe(
      'rgb(255, 69, 0)',
    )
  })

  it('ist versteckt, wenn nicht sichtbar oder leer', () => {
    const stage = document.createElement('div')
    const board = createScoreboard(stage)
    board.render([entry('Anna', 50)], false)
    expect((stage.querySelector('.scoreboard') as HTMLElement).hidden).toBe(true)
    board.render([], true)
    expect((stage.querySelector('.scoreboard') as HTMLElement).hidden).toBe(true)
    board.render([entry('Anna', 50)], true)
    expect((stage.querySelector('.scoreboard') as HTMLElement).hidden).toBe(false)
  })

  it('setzt Namen nie als HTML ein', () => {
    const stage = document.createElement('div')
    createScoreboard(stage).render([entry('<img src=x>', 50)], true)
    expect(stage.querySelector('img')).toBeNull()
  })
})
