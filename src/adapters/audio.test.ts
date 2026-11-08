import { describe, expect, it } from 'vitest'
import { createSounds, type AudioLike } from './audio'

const recorder = () => {
  const played: { src: string; volume: number }[] = []
  const create = (src: string): AudioLike => {
    const audio = {
      volume: 1,
      play: () => {
        played.push({ src, volume: audio.volume })
        return Promise.resolve()
      },
    }
    return audio
  }
  return { played, create }
}

describe('createSounds', () => {
  const urls = {
    sndJump: 'https://a.example/j.mp3',
    sndHit: 'https://a.example/h.mp3',
    sndMiss: null,
    vol: 0.5,
  }

  it('spielt den passenden Sound mit der eingestellten Lautstärke', () => {
    const { played, create } = recorder()
    const sounds = createSounds(urls, create)
    sounds.jump()
    sounds.hit()
    expect(played).toEqual([
      { src: 'https://a.example/j.mp3', volume: 0.5 },
      { src: 'https://a.example/h.mp3', volume: 0.5 },
    ])
  })

  it('nimmt ohne URL den eingebauten Klang', () => {
    const { played, create } = recorder()
    const builtIn: string[] = []
    const fallback = {
      jump: () => builtIn.push('jump'),
      hit: () => builtIn.push('hit'),
      miss: () => builtIn.push('miss'),
      peg: () => builtIn.push('peg'),
    }
    const sounds = createSounds(urls, create, fallback)
    sounds.miss()
    sounds.hit()
    sounds.peg()
    expect(builtIn).toEqual(['miss', 'peg'])
    expect(played.map((sound) => sound.src)).toEqual(['https://a.example/h.mp3'])
  })

  it('erlaubt überlappende Sounds (je Abspielen ein eigenes Objekt)', () => {
    const { played, create } = recorder()
    const sounds = createSounds(urls, create)
    sounds.jump()
    sounds.jump()
    expect(played).toHaveLength(2)
  })

  it('schluckt Abspielfehler wie die Autoplay-Sperre', async () => {
    const failing = (): AudioLike => ({
      volume: 1,
      play: () => Promise.reject(new Error('NotAllowedError')),
    })
    expect(() => createSounds(urls, failing).jump()).not.toThrow()
    await new Promise((resolve) => setTimeout(resolve, 0))
  })
})
