import { describe, expect, it } from 'vitest'
import { resolveEmote, twitchEmoteAt } from './emotes'

const twitch = (id: string) => `https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/dark/3.0`

describe('twitchEmoteAt', () => {
  it('findet das Emote, das an der Position beginnt', () => {
    expect(twitchEmoteAt('25:6-10', 6)).toBe(twitch('25'))
  })

  it('liest mehrere Emotes und Vorkommen', () => {
    const tag = '25:0-4,12-16/emotesv2_abc123:6-10'
    expect(twitchEmoteAt(tag, 6)).toBe(twitch('emotesv2_abc123'))
    expect(twitchEmoteAt(tag, 12)).toBe(twitch('25'))
  })

  it.each(['', '25:0-4', 'kaputt', '25:x-y'])('liefert null für %j an Position 6', (tag) => {
    expect(twitchEmoteAt(tag, 6)).toBeNull()
  })

  it('verwirft IDs mit fremden Zeichen', () => {
    expect(twitchEmoteAt('a.b"<x>:6-10', 6)).toBeNull()
  })
})

describe('resolveEmote', () => {
  const none = new Map<string, string>()
  const table = (name: string, url: string) => new Map([[name, url]])

  it('liefert null ohne zweites Wort', () => {
    expect(resolveEmote('!jump', '', [])).toBeNull()
  })

  it('nimmt das Twitch-Emote an der Position des zweiten Worts', () => {
    expect(resolveEmote('!jump Kappa', '25:6-10', [])).toBe(twitch('25'))
  })

  it('berücksichtigt mehrere Leerzeichen vor dem Emote', () => {
    expect(resolveEmote('!jump   Kappa', '25:8-12', [])).toBe(twitch('25'))
  })

  it('bevorzugt das Twitch-Emote vor gleichnamigen Drittanbieter-Emotes', () => {
    const tables = [table('Kappa', 'https://cdn.7tv.app/x')]
    expect(resolveEmote('!jump Kappa', '25:6-10', tables)).toBe(twitch('25'))
  })

  it('nimmt sonst die erste Tabelle, die den Namen kennt', () => {
    const tables = [
      none,
      table('catJAM', 'https://cdn.betterttv.net/a'),
      table('catJAM', 'https://b'),
    ]
    expect(resolveEmote('!bump catJAM', '', tables)).toBe('https://cdn.betterttv.net/a')
  })

  it('unterscheidet Groß- und Kleinschreibung', () => {
    expect(resolveEmote('!jump catjam', '', [table('catJAM', 'https://a')])).toBeNull()
  })

  it('liefert null für unbekannte Wörter', () => {
    expect(resolveEmote('!jump hallo', '', [table('catJAM', 'https://a')])).toBeNull()
  })
})
