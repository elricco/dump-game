/**
 * Liest die Antworten der Emote-APIs (7TV, BTTV, FFZ) in Tabellen Name → Bild-URL.
 *
 * Die Antworten sind untrusted: Alles wird defensiv gelesen (falsche Typen →
 * Eintrag überspringen) und Bild-URLs werden ausschließlich aus geprüften IDs
 * auf festen CDN-Hosts gebaut, nie aus URL-Feldern der API.
 */
export type EmoteTable = Map<string, string>

const SEVEN_TV_ID = /^[0-9A-Za-z]{20,32}$/
const BTTV_ID = /^[0-9a-f]{24}$/
const FFZ_ID = /^\d+$/
const FFZ_SIZES = ['4', '2', '1'] as const

type Json = Record<string, unknown>

const isObject = (value: unknown): value is Json =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])

const asString = (value: unknown): string | null =>
  typeof value === 'string' && value !== '' ? value : null

const asId = (value: unknown): string | null =>
  typeof value === 'number' && Number.isInteger(value) ? String(value) : asString(value)

function sevenTv(emotes: unknown): EmoteTable {
  const table: EmoteTable = new Map()
  for (const emote of asArray(emotes)) {
    if (!isObject(emote)) continue
    const id = asString(emote.id)
    const name = asString(emote.name)
    if (id && name && SEVEN_TV_ID.test(id))
      table.set(name, `https://cdn.7tv.app/emote/${id}/4x.webp`)
  }
  return table
}

function bttv(emotes: unknown[]): EmoteTable {
  const table: EmoteTable = new Map()
  for (const emote of emotes) {
    if (!isObject(emote)) continue
    const id = asString(emote.id)
    const code = asString(emote.code)
    if (id && code && BTTV_ID.test(id))
      table.set(code, `https://cdn.betterttv.net/emote/${id}/3x.webp`)
  }
  return table
}

function largestSize(sizes: unknown): string | null {
  if (!isObject(sizes)) return null
  return FFZ_SIZES.find((size) => size in sizes) ?? null
}

function ffzSets(sets: unknown, onlyIds?: string[]): EmoteTable {
  const table: EmoteTable = new Map()
  if (!isObject(sets)) return table
  for (const [setId, set] of Object.entries(sets)) {
    if (onlyIds && !onlyIds.includes(setId)) continue
    if (!isObject(set)) continue
    for (const emote of asArray(set.emoticons)) {
      if (!isObject(emote)) continue
      const id = asId(emote.id)
      const name = asString(emote.name)
      if (!id || !name || !FFZ_ID.test(id)) continue
      const animated = largestSize(emote.animated)
      const size = largestSize(emote.urls)
      if (animated) table.set(name, `https://cdn.frankerfacez.com/emote/${id}/animated/${animated}`)
      else if (size) table.set(name, `https://cdn.frankerfacez.com/emote/${id}/${size}`)
    }
  }
  return table
}

export function parseSevenTvUser(json: unknown): EmoteTable {
  return isObject(json) && isObject(json.emote_set) ? sevenTv(json.emote_set.emotes) : new Map()
}

export function parseSevenTvGlobal(json: unknown): EmoteTable {
  return isObject(json) ? sevenTv(json.emotes) : new Map()
}

export function parseBttvUser(json: unknown): EmoteTable {
  if (!isObject(json)) return new Map()
  return bttv([...asArray(json.channelEmotes), ...asArray(json.sharedEmotes)])
}

export function parseBttvGlobal(json: unknown): EmoteTable {
  return bttv(asArray(json))
}

export function parseFfzRoom(json: unknown): EmoteTable {
  return isObject(json) ? ffzSets(json.sets) : new Map()
}

export function parseFfzGlobal(json: unknown): EmoteTable {
  if (!isObject(json)) return new Map()
  const defaults = asArray(json.default_sets)
    .map(asId)
    .filter((id) => id !== null)
  return ffzSets(json.sets, defaults)
}
