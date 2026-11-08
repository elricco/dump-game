import type { ChatStatus } from '../adapters/twitch-chat'
import type { RoundEvent } from '../core/round'

const MAX_ENTRIES = 10

function describe(event: RoundEvent): string {
  switch (event.type) {
    case 'spawn': {
      const base = `spawn ${event.mode} ${event.message.displayName}`
      return event.arg ? `${base} (${event.arg})` : base
    }
    case 'ignored':
      return `ignored ${event.reason} ${event.login}`
    case 'reset':
      return `reset ${event.reason}`
  }
}

/** Debug-Ansicht (debug=1): Verbindungsstatus und letzte Ereignisse. Nur textContent. */
export function createEventLog(root: HTMLElement) {
  const statusLine = document.createElement('p')
  const list = document.createElement('ul')
  statusLine.className = list.className = 'status'
  root.prepend(statusLine, list)

  return {
    status(status: ChatStatus) {
      statusLine.textContent = `Chat: ${status}`
    },
    push(event: RoundEvent) {
      const item = document.createElement('li')
      item.textContent = describe(event)
      list.prepend(item)
      while (list.children.length > MAX_ENTRIES) list.lastElementChild?.remove()
    },
  }
}
