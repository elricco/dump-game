import { describe, expect, it } from 'vitest'
import type { ScoreEntry } from '../core/highscores'
import { createScoreStorage, type StorageLike } from './score-storage'

const memory = (
  initial: Record<string, string> = {},
): StorageLike & { data: Record<string, string> } => {
  const data = { ...initial }
  return {
    data,
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value
    },
    removeItem: (key) => {
      Reflect.deleteProperty(data, key)
    },
  }
}

const anna: ScoreEntry = {
  login: 'anna',
  displayName: 'Anna',
  color: '#8a2be2',
  score: 98.96,
  at: 1,
}
const KEY = 'dump-game:highscores:elricco1978'

describe('createScoreStorage', () => {
  it('speichert und lädt je Kanal', () => {
    const storage = memory()
    createScoreStorage('elricco1978', 'forever', storage).save([anna])
    expect(JSON.parse(storage.data[KEY] ?? '')).toEqual([anna])
    expect(createScoreStorage('elricco1978', 'forever', storage).load()).toEqual([anna])
  })

  it('hält bei stream nur im Speicher und schreibt nichts', () => {
    const storage = memory()
    const scores = createScoreStorage('elricco1978', 'stream', storage)
    scores.save([anna])
    expect(storage.data).toEqual({})
    expect(scores.load()).toEqual([anna])
  })

  it('leert beim Zurücksetzen', () => {
    const storage = memory({ [KEY]: JSON.stringify([anna]) })
    const scores = createScoreStorage('elricco1978', 'forever', storage)
    scores.clear()
    expect(scores.load()).toEqual([])
    expect(storage.data[KEY]).toBeUndefined()
  })

  it('verwirft kaputte oder manipulierte Daten', () => {
    const bad = [
      anna,
      { ...anna, login: 'evil', color: 'red;background:url(x)' },
      { ...anna, login: 'nan', score: 'viel' },
      { ...anna, login: 'big', score: 1000 },
      null,
      'text',
    ]
    expect(
      createScoreStorage('elricco1978', 'forever', memory({ [KEY]: JSON.stringify(bad) })).load(),
    ).toEqual([anna])
    expect(
      createScoreStorage('elricco1978', 'forever', memory({ [KEY]: '{kaputt' })).load(),
    ).toEqual([])
  })

  it('läuft ohne nutzbaren Speicher weiter (privater Modus)', () => {
    const broken: StorageLike = {
      getItem: () => {
        throw new Error('SecurityError')
      },
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
      removeItem: () => {
        throw new Error('SecurityError')
      },
    }
    const scores = createScoreStorage('elricco1978', 'forever', broken)
    expect(scores.load()).toEqual([])
    expect(() => scores.save([anna])).not.toThrow()
    expect(scores.load()).toEqual([anna]) // gilt bis zum Neuladen
    expect(() => scores.clear()).not.toThrow()
  })
})
