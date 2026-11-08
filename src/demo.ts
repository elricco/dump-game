// Demo (nur Dev-Server): echtes Spiel ohne Chat – 8 Sprünge, Ruhe, Reset (Zyklus 24 s).
// URL-Parameter wie im Overlay (theme, move, scale, …); channel ist hier egal.
import { createSounds } from './adapters/audio'
import { createSynth } from './adapters/synth'
import { parseConfig } from './core/config'
import { Game } from './core/game'
import { applyDesignVars, setUnit } from './render/design-vars'
import { createStageView } from './render/stage-view'
import { themeSizes } from './render/theme-sizes'

const NAMES = [
  'ElRicco1978',
  'FranklyFaye',
  'Tenacious',
  'SadPosture',
  'Falseidols',
  'PixelPaul',
  'LavaLisa',
]
const EMOTES = [null, null, null, 'https://cdn.7tv.app/emote/01FP0SVC4R0001BCZZ99DVJFP8/4x.webp']

async function demo(): Promise<void> {
  const stage = document.getElementById('stage')
  const params = new URLSearchParams(window.location.search)
  params.set('channel', 'demo_channel')
  const result = parseConfig(params)
  if (!stage || !result.ok) return
  const { config } = result

  applyDesignVars(stage, config.scale)
  let unit = setUnit(stage, window.innerHeight)
  const game = new Game(config, await themeSizes(config), window.innerWidth / unit, Math.random)
  const view = createStageView(stage, config)
  const sounds = createSounds(config, undefined, createSynth(config.vol))
  window.addEventListener('resize', () => {
    unit = setUnit(stage, window.innerHeight)
    game.resize(window.innerWidth / unit)
  })

  // Takt wie im echten Spiel: 8 Sprünge im Abstand von 1,2 s, dann Ruhe, dann Reset.
  let tick = 0
  window.setInterval(() => {
    const step = tick % 20
    if (step === 19) game.reset()
    else if (step < 8) {
      const name = NAMES[step % NAMES.length] ?? 'Demo'
      const emote = EMOTES[step % EMOTES.length] ?? null
      game.spawnJump({ login: name.toLowerCase(), displayName: name, color: null }, emote)
    }
    tick++
  }, 1200)

  let last = performance.now()
  const frame = (now: number) => {
    const dt = Math.min((now - last) / 1000, 0.1)
    last = now
    for (const event of game.step(dt)) (event.type === 'landed' ? sounds.hit : sounds.miss)()
    view.render(game, dt, unit)
    window.requestAnimationFrame(frame)
  }
  window.requestAnimationFrame(frame)
}

void demo()
