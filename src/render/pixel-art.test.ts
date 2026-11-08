import { describe, expect, it } from 'vitest'
import { pixelRuns, rasterize, withOutline } from './pixel-art'

describe('withOutline', () => {
  it('legt einen Rand an und färbt leere Nachbarn gefüllter Pixel als Kontur', () => {
    expect(withOutline(['c'])).toEqual(['.o.', 'oco', '.o.'])
  })

  it('lässt Löcher ohne gefüllte Nachbarn leer und behält gefüllte Pixel', () => {
    expect(withOutline(['c.c', '...', '...'])).toEqual([
      '.o.o.',
      'ococo',
      '.o.o.',
      '.....',
      '.....',
    ])
  })
})

describe('rasterize', () => {
  it('baut ein Raster aus einer Funktion je Pixel', () => {
    expect(rasterize(3, 2, (x, y) => (x === y ? 'a' : '.'))).toEqual(['a..', '.a.'])
  })
})

describe('pixelRuns', () => {
  it('fasst gleichfarbige Pixel einer Zeile zusammen und lässt Leeres und Unbekanntes weg', () => {
    expect(pixelRuns(['aab.a', 'zbb..'], { a: '#111111', b: '#222222' })).toEqual([
      { x: 0, y: 0, width: 2, fill: '#111111' },
      { x: 2, y: 0, width: 1, fill: '#222222' },
      { x: 4, y: 0, width: 1, fill: '#111111' },
      { x: 1, y: 1, width: 2, fill: '#222222' },
    ])
  })
})
