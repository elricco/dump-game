import { describe, expect, it } from 'vitest'
import { Pad, PAD_SPEED } from './ground'

describe('Pad', () => {
  const size = { width: 200, height: 100 }

  it('startet mittig', () => {
    expect(new Pad(1000, size, true).center).toBe(500)
  })

  it('bewegt sich mit PAD_SPEED Referenz-px pro Sekunde', () => {
    const pad = new Pad(1000, size, true)
    pad.step(1)
    expect(pad.center).toBe(500 + PAD_SPEED)
  })

  it('pendelt am rechten Rand zurück, ohne über den Rand zu gehen', () => {
    const pad = new Pad(1000, size, true)
    pad.step(400 / PAD_SPEED) // genau am rechten Rand (Mitte 900)
    expect(pad.center).toBe(900)
    pad.step(100 / PAD_SPEED)
    expect(pad.center).toBe(800)
  })

  it('pendelt auch am linken Rand zurück', () => {
    const pad = new Pad(1000, size, true)
    pad.step(1200 / PAD_SPEED) // rechts anschlagen, dann bis an den linken Rand
    expect(pad.center).toBe(100)
    pad.step(50 / PAD_SPEED)
    expect(pad.center).toBe(150)
  })

  it('steht mit move=false still', () => {
    const pad = new Pad(1000, size, false)
    pad.step(5)
    expect(pad.center).toBe(500)
  })

  it('bleibt nach resize auf der Bühne', () => {
    const pad = new Pad(1000, size, true)
    pad.step(400 / PAD_SPEED)
    pad.resize(600)
    expect(pad.center).toBe(500)
  })

  it('bleibt mit move=false nach resize mittig', () => {
    const pad = new Pad(1000, size, false)
    pad.resize(1600)
    expect(pad.center).toBe(800)
  })

  it('steht mittig, wenn die Bühne schmaler als die Fläche ist', () => {
    const pad = new Pad(150, size, true)
    pad.step(1)
    expect(pad.center).toBe(75)
  })
})
