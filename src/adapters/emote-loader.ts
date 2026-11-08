import {
  parseBttvGlobal,
  parseBttvUser,
  parseFfzGlobal,
  parseFfzRoom,
  parseSevenTvGlobal,
  parseSevenTvUser,
  type EmoteTable,
} from '../core/emote-providers'

export type FetchJson = (url: string) => Promise<{ status: number; json: unknown }>

export interface EmoteSource {
  label: string
  table: EmoteTable
}

export interface LoadedEmotes {
  /** Reihenfolge = Vorrang bei gleichem Namen: Kanal vor global. */
  sources: EmoteSource[]
  failed: string[]
}

const ROOM_ID = /^\d+$/

/** Lädt die Emote-Tabellen aller Drittanbieter parallel; ein Ausfall stoppt die anderen nicht. */
export async function loadEmotes(roomId: string, fetchJson: FetchJson): Promise<LoadedEmotes> {
  const room = ROOM_ID.test(roomId) ? roomId : null
  const endpoints: [string, string | null, (json: unknown) => EmoteTable][] = [
    ['7TV Kanal', room && `https://7tv.io/v3/users/twitch/${room}`, parseSevenTvUser],
    [
      'BTTV Kanal',
      room && `https://api.betterttv.net/3/cached/users/twitch/${room}`,
      parseBttvUser,
    ],
    ['FFZ Kanal', room && `https://api.frankerfacez.com/v1/room/id/${room}`, parseFfzRoom],
    ['7TV global', 'https://7tv.io/v3/emote-sets/global', parseSevenTvGlobal],
    ['BTTV global', 'https://api.betterttv.net/3/cached/emotes/global', parseBttvGlobal],
    ['FFZ global', 'https://api.frankerfacez.com/v1/set/global', parseFfzGlobal],
  ]

  const failed: string[] = []
  const sources = await Promise.all(
    endpoints.map(async ([label, url, parse]): Promise<EmoteSource> => {
      if (!url) return { label, table: new Map() }
      try {
        const response = await fetchJson(url)
        if (response.status === 200) return { label, table: parse(response.json) }
        if (response.status !== 404) failed.push(label)
      } catch {
        failed.push(label)
      }
      return { label, table: new Map() }
    }),
  )

  const order = endpoints.map(([label]) => label)
  failed.sort((a, b) => order.indexOf(a) - order.indexOf(b))
  return { sources, failed }
}

/** fetch() hinter FetchJson – ohne Cookies, ohne Referrer. */
export const browserFetchJson: FetchJson = async (url) => {
  const response = await fetch(url, { credentials: 'omit', referrerPolicy: 'no-referrer' })
  return { status: response.status, json: response.ok ? await response.json() : null }
}
