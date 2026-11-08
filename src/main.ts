import { browserFetchJson, loadEmotes, type EmoteSource } from './adapters/emote-loader'
import { browserSocket, connectChat } from './adapters/twitch-chat'
import { parseCommand } from './core/commands'
import { parseConfig } from './core/config'
import { resolveEmote } from './core/emotes'
import { Round, type RoundEvent } from './core/round'
import { createEventLog } from './render/event-log'
import { renderStatus } from './render/status'

const EMOTE_REFRESH_MS = 10 * 60 * 1000

const statusRoot = document.getElementById('status')
const result = parseConfig(new URLSearchParams(window.location.search))
if (statusRoot) renderStatus(statusRoot, result)

if (result.ok) {
  const { config } = result
  const log = config.debug && statusRoot ? createEventLog(statusRoot) : null
  const round = new Round(config)
  let emoteSources: EmoteSource[] = []
  let refreshTimer: number | undefined

  const refreshEmotes = async (roomId: string) => {
    const loaded = await loadEmotes(roomId, browserFetchJson)
    emoteSources = loaded.sources
    log?.emotes(loaded)
  }

  const emit = (event: RoundEvent) => {
    const emote =
      event.type === 'spawn'
        ? resolveEmote(
            event.message.text,
            event.message.emotes,
            emoteSources.map((source) => source.table),
          )
        : null
    log?.push(event, emote) // AP 4: Figur bzw. Emote ins Spiel bringen
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
      if (command) emit(round.handle(message, command, Date.now()))
    },
  })

  window.setInterval(() => {
    const event = round.tick(Date.now())
    if (event) emit(event)
  }, 1000)
}
