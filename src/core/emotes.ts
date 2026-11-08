import type { EmoteTable } from './emote-providers'

const TWITCH_ID = /^[A-Za-z0-9_]+$/

/** URL des Twitch-Emotes, das laut emotes-Tag an Codepoint-Position `start` beginnt. */
export function twitchEmoteAt(emotesTag: string, start: number): string | null {
  for (const group of emotesTag.split('/')) {
    const [id = '', ranges = ''] = group.split(':')
    if (!TWITCH_ID.test(id)) continue
    const hit = ranges.split(',').some((range) => Number(range.split('-')[0]) === start)
    if (hit) return `https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/dark/3.0`
  }
  return null
}

/**
 * Emote-URL für das zweite Wort einer Befehlsnachricht: erst das Twitch-Emote
 * an dieser Position, dann die erste Tabelle, die den Namen kennt.
 */
export function resolveEmote(text: string, emotesTag: string, tables: EmoteTable[]): string | null {
  const match = /^(\S+\s+)(\S+)/u.exec(text)
  if (!match?.[1] || !match[2]) return null
  const [, prefix, word] = match

  // Twitch zählt Positionen in Codepoints, nicht in UTF-16-Einheiten.
  const twitch = twitchEmoteAt(emotesTag, Array.from(prefix).length)
  if (twitch) return twitch

  for (const table of tables) {
    const url = table.get(word)
    if (url) return url
  }
  return null
}
