import { browserSocket, connectChat } from './adapters/twitch-chat'
import { parseCommand } from './core/commands'
import { parseConfig } from './core/config'
import { Round, type RoundEvent } from './core/round'
import { createEventLog } from './render/event-log'
import { renderStatus } from './render/status'

const statusRoot = document.getElementById('status')
const result = parseConfig(new URLSearchParams(window.location.search))
if (statusRoot) renderStatus(statusRoot, result)

if (result.ok) {
  const { config } = result
  const log = config.debug && statusRoot ? createEventLog(statusRoot) : null
  const round = new Round(config)
  const emit = (event: RoundEvent) => log?.push(event)

  connectChat({
    channel: config.channel,
    createSocket: browserSocket,
    schedule: (run, ms) => window.setTimeout(run, ms),
    random: Math.random,
    onStatus: (status) => log?.status(status),
    onRoom: () => {}, // Emotes ab AP 3
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
