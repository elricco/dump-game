import { describe, expect, it } from 'vitest'
import { formatScore } from './format'

describe('formatScore', () => {
  it.each([
    [98.96, '98,96 %'],
    [100, '100 %'],
    [49.5, '49,5 %'],
    [0, '0 %'],
  ])('%s → %s', (score, text) => {
    expect(formatScore(score)).toBe(text)
  })
})
