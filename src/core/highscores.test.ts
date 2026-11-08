import { describe, expect, it } from 'vitest'
import { periodStart, recordScore, topScores, type ScoreEntry } from './highscores'

// Ortszeit: So 08.11.2026, Mo 09.11.2026
const at = (day: number, hour = 12, minute = 0) => new Date(2026, 10, day, hour, minute).getTime()
const entry = (login: string, score: number, time = at(9)): ScoreEntry => ({
  login,
  displayName: login.toUpperCase(),
  color: '#8a2be2',
  score,
  at: time,
})

describe('periodStart', () => {
  it('beginnt den Tag um 00:00 Ortszeit', () => {
    expect(periodStart('day', new Date(at(9, 0, 30)))).toBe(at(9, 0, 0))
  })

  it('beginnt die Woche am Montag 00:00 – auch sonntags', () => {
    expect(new Date(at(9)).getDay()).toBe(1)
    expect(periodStart('week', new Date(at(11, 18)))).toBe(at(9, 0, 0))
    expect(periodStart('week', new Date(at(8, 23)))).toBe(new Date(2026, 10, 2).getTime())
  })

  it('kennt bei stream und forever keine Grenze', () => {
    expect(periodStart('stream', new Date(at(9)))).toBe(-Infinity)
    expect(periodStart('forever', new Date(at(9)))).toBe(-Infinity)
  })
})

describe('recordScore', () => {
  const now = new Date(at(9, 20))

  it('trägt eine neue Person ein', () => {
    expect(recordScore([], entry('anna', 50), 'forever', now)).toEqual([entry('anna', 50)])
  })

  it('behält je Person nur den Bestwert', () => {
    let entries = recordScore([], entry('anna', 50), 'forever', now)
    entries = recordScore(entries, entry('anna', 80, at(9, 13)), 'forever', now)
    entries = recordScore(entries, entry('anna', 60, at(9, 14)), 'forever', now)
    expect(entries).toEqual([entry('anna', 80, at(9, 13))])
  })

  it('behält bei gleicher Punktzahl den früheren Eintrag', () => {
    const entries = recordScore(
      [entry('anna', 80, at(9, 10))],
      entry('anna', 80, at(9, 15)),
      'forever',
      now,
    )
    expect(entries[0]?.at).toBe(at(9, 10))
  })

  it('wirft Einträge außerhalb des Zeitraums raus – ein alter Rekord blockiert nicht', () => {
    const yesterday = entry('anna', 100, at(8, 22))
    const entries = recordScore(
      [yesterday, entry('bert', 30, at(8, 23))],
      entry('anna', 40, at(9, 9)),
      'day',
      now,
    )
    expect(entries).toEqual([entry('anna', 40, at(9, 9))])
  })
})

describe('topScores', () => {
  it('liefert die besten 5, absteigend, bei Gleichstand wer früher da war', () => {
    const entries = [
      entry('a', 50),
      entry('b', 90, at(9, 13)),
      entry('c', 90, at(9, 11)),
      entry('d', 10),
      entry('e', 70),
      entry('f', 100),
      entry('g', 20),
    ]
    expect(topScores(entries).map((e) => e.login)).toEqual(['f', 'c', 'b', 'e', 'a'])
  })
})

describe('topScores – Zeitraum', () => {
  it('zeigt nach Mitternacht keine Werte von gestern mehr', () => {
    const entries = [entry('anna', 90, at(8, 23, 50)), entry('bert', 40, at(9, 0, 5))]
    expect(topScores(entries, 'day', new Date(at(9, 0, 10))).map((e) => e.login)).toEqual(['bert'])
  })
})
