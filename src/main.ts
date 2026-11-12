import { createSounds } from './adapters/audio'
import { createSynth } from './adapters/synth'
import { browserFetchJson, loadEmotes, type EmoteSource } from './adapters/emote-loader'
import { browserSocket, connectChat } from './adapters/twitch-chat'
import { jumpsWithGlider, parseCommand } from './core/commands'
import { parseConfig } from './core/config'
import { resolveEmote } from './core/emotes'
import { Game } from './core/game'
import { Round, type RoundEvent } from './core/round'
import { applyDesignVars, setUnit } from './render/design-vars'
import { createEventLog } from './render/event-log'
import { createHighscores } from './render/highscore-view'
import { createStageView } from './render/stage-view'
import { renderStatus } from './render/status'
import { themeSizes } from './render/theme-sizes'

const EMOTE_REFRESH_MS = 10 * 60 * 1000
const MAX_DT = 0.1

async function start(): Promise<void> {
  const stage = document.getElementById('stage')
  const statusRoot = document.getElementById('status')
  if (!stage || !statusRoot) return

  const result = parseConfig(new URLSearchParams(window.location.search))
  renderStatus(statusRoot, result)
  if (!result.ok) return
  const { config } = result

  applyDesignVars(stage, config.scale)
  let unit = setUnit(stage, window.innerHeight)
  const game = new Game(config, await themeSizes(config), window.innerWidth / unit, Math.random)
  const view = createStageView(stage, config)
  const highscores = createHighscores(stage, config)
  const sounds = createSounds(config, undefined, createSynth(config.vol))
  const log = config.debug ? createEventLog(statusRoot) : null
  const round = new Round(config)
  let emoteSources: EmoteSource[] = []
  let refreshTimer: number | undefined

  window.addEventListener('resize', () => {
    unit = setUnit(stage, window.innerHeight)
    game.resize(window.innerWidth / unit)
  })

  const refreshEmotes = async (roomId: string) => {
    const loaded = await loadEmotes(roomId, browserFetchJson)
    emoteSources = loaded.sources
    log?.emotes(loaded)
  }

  const handle = (event: RoundEvent) => {
    let emote: string | null = null
    if (event.type === 'spawn') {
      const tables = emoteSources.map((source) => source.table)
      emote = resolveEmote(event.message.text, event.message.emotes, tables)
      if (event.mode === 'jump')
        game.spawnJump(event.message, emote, jumpsWithGlider(event.arg, emote, config))
      else game.spawnBump(event.message, emote)
      sounds.jump()
    } else if (event.type === 'reset') {
      game.reset()
    } else if (event.type === 'resetScores') {
      highscores.clear()
    }
    log?.push(event, emote)
  }

  connectChat({
    channel: config.channel,
    createSocket: browserSocket,
    schedule: (run, ms) => window.setTimeout(run, ms),
    random: Math.random,
    onStatus: (status) => log?.status(status),
    onRoom: (roomId) => {
      void refreshEmotes(roomId)
      window.clearInterval(refreshTimer)
      refreshTimer = window.setInterval(() => void refreshEmotes(roomId), EMOTE_REFRESH_MS)
    },
    onMessage: (message) => {
      const command = parseCommand(message.text, config)
      if (command) handle(round.handle(message, command, Date.now()))
    },
  })

  window.setInterval(() => {
    const event = round.tick(Date.now())
    if (event) handle(event)
  }, 1000)

  let last = performance.now()
  const frame = (now: number) => {
    const dt = Math.min((now - last) / 1000, MAX_DT)
    last = now
    const events = game.step(dt)
    highscores.onGameEvents(game, events)
    for (const event of events) {
      if (event.type === 'landed') sounds.hit()
      else if (event.type === 'died') sounds.miss()
      else sounds.peg()
    }
    view.render(game, dt, unit)
    highscores.sync(game)
    window.requestAnimationFrame(frame)
  }
  window.requestAnimationFrame(frame)
}

void start()
