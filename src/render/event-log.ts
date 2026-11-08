import type { LoadedEmotes } from '../adapters/emote-loader'
import type { ChatStatus } from '../adapters/twitch-chat'
import type { RoundEvent } from '../core/round'

const MAX_ENTRIES = 10

function describe(event: RoundEvent, emote: string | null): string {
  switch (event.type) {
    case 'spawn': {
      const base = `spawn ${event.mode} ${event.message.displayName}`
      if (!event.arg) return base
      return emote ? `${base} (${event.arg})` : `${base} (${event.arg}, kein Emote)`
    }
    case 'ignored':
      return `ignored ${event.reason} ${event.login}`
    case 'reset':
      return `reset ${event.reason}`
    case 'resetScores':
      return 'reset highscores'
  }
}

/** Debug-Ansicht (debug=1): Verbindungsstatus und letzte Ereignisse. Nur textContent. */
export function createEventLog(root: HTMLElement) {
  const statusLine = document.createElement('p')
  const emoteLine = document.createElement('p')
  const list = document.createElement('ul')
  statusLine.className = emoteLine.className = list.className = 'status'
  root.prepend(statusLine, emoteLine, list)

  return {
    status(status: ChatStatus) {
      statusLine.textContent = `Chat: ${status}`
    },
    emotes({ sources, failed }: LoadedEmotes) {
      const counts = sources.map(({ label, table }) => `${label} ${table.size}`).join(', ')
      emoteLine.textContent = `Emotes: ${counts}${failed.length ? ` – Fehler: ${failed.join(', ')}` : ''}`
    },
    push(event: RoundEvent, emote: string | null = null) {
      const item = document.createElement('li')
      item.textContent = describe(event, emote)
      if (emote && event.type === 'spawn') {
        const img = document.createElement('img')
        img.src = emote
        img.alt = event.arg ?? ''
        img.height = 56
        item.append(img)
      }
      list.prepend(item)
      while (list.children.length > MAX_ENTRIES) list.lastElementChild?.remove()
    },
  }
}
