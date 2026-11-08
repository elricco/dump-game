import type { Sounds } from './audio'

/**
 * Eingebaute 16-Bit-Klänge per Web Audio – keine Dateien, keine Downloads.
 * Start: steigender Rechteck-Sweep; Landung („Cheer"): Dur-Arpeggio mit
 * gehaltenem Schlussakkord; Tod („Kill"): absteigendes Wah-wah im mittleren
 * Tonbereich plus heller Platscher; Stift: kurzer, leiser Tick.
 * Klänge liegen bewusst über ~150 Hz, damit sie auch auf Laptop-Lautsprechern
 * und im Stream hörbar sind.
 */
export function createSynth(volume: number, makeContext = () => new AudioContext()): Sounds {
  let context: AudioContext | null = null

  const audio = (): AudioContext | null => {
    if (volume <= 0) return null
    try {
      context ??= makeContext()
      if (context.state === 'suspended') void context.resume()
      return context
    } catch {
      return null
    }
  }

  const envelope = (c: AudioContext, start: number, duration: number, level: number) => {
    const gain = c.createGain()
    gain.gain.setValueAtTime(volume * level, start)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    gain.connect(c.destination)
    return gain
  }

  const tone = (
    c: AudioContext,
    type: OscillatorType,
    from: number,
    to: number,
    offset: number,
    duration: number,
    level: number,
  ) => {
    const start = c.currentTime + offset
    const oscillator = c.createOscillator()
    oscillator.type = type
    oscillator.frequency.setValueAtTime(from, start)
    oscillator.frequency.exponentialRampToValueAtTime(to, start + duration)
    oscillator.connect(envelope(c, start, duration, level))
    oscillator.start(start)
    oscillator.stop(start + duration)
  }

  const noise = (c: AudioContext, duration: number, level: number, from = 2400, to = 200) => {
    const buffer = c.createBuffer(1, Math.floor(c.sampleRate * duration), c.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    const source = c.createBufferSource()
    source.buffer = buffer
    const filter = c.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(from, c.currentTime)
    filter.frequency.exponentialRampToValueAtTime(to, c.currentTime + duration)
    source.connect(filter).connect(envelope(c, c.currentTime, duration, level))
    source.start()
  }

  return {
    jump() {
      const c = audio()
      if (c) tone(c, 'square', 220, 880, 0, 0.18, 0.15)
    },
    hit() {
      const c = audio()
      if (!c) return
      ;[523.25, 659.25, 783.99].forEach((note, index) =>
        tone(c, 'square', note, note, index * 0.08, 0.12, 0.22),
      )
      tone(c, 'square', 1046.5, 1046.5, 0.24, 0.45, 0.22)
      tone(c, 'triangle', 1318.5, 1318.5, 0.24, 0.45, 0.18)
    },
    peg() {
      const c = audio()
      if (c) tone(c, 'square', 1568, 1318.5, 0, 0.04, 0.06)
    },
    miss() {
      const c = audio()
      if (!c) return
      noise(c, 0.3, 0.45, 4000, 600)
      tone(c, 'square', 660, 440, 0, 0.22, 0.22)
      tone(c, 'square', 440, 165, 0.22, 0.4, 0.22)
    },
  }
}
