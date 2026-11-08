import { describe, expect, it } from 'vitest'
import { withOutline } from './pixel-art'

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
