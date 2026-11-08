import { describe, expect, it } from 'vitest'
import { loadEmotes, type FetchJson } from './emote-loader'
import bttvGlobal from '../core/fixtures/bttv-global.json'
import bttvUser from '../core/fixtures/bttv-user.json'
import ffzGlobal from '../core/fixtures/ffz-global.json'
import ffzRoom from '../core/fixtures/ffz-room.json'
import sevenTvGlobal from '../core/fixtures/7tv-global.json'
import sevenTvUser from '../core/fixtures/7tv-user.json'

const RESPONSES: Record<string, unknown> = {
  'https://7tv.io/v3/users/twitch/474178035': sevenTvUser,
  'https://api.betterttv.net/3/cached/users/twitch/474178035': bttvUser,
  'https://api.frankerfacez.com/v1/room/id/474178035': ffzRoom,
  'https://7tv.io/v3/emote-sets/global': sevenTvGlobal,
  'https://api.betterttv.net/3/cached/emotes/global': bttvGlobal,
  'https://api.frankerfacez.com/v1/set/global': ffzGlobal,
}

const fromFixtures: FetchJson = async (url) => ({ status: 200, json: RESPONSES[url] })

describe('loadEmotes', () => {
  it('lädt alle sechs Quellen, Kanal vor global', async () => {
    const result = await loadEmotes('474178035', fromFixtures)
    expect(result.sources.map((source) => [source.label, source.table.size])).toEqual([
      ['7TV Kanal', 3],
      ['BTTV Kanal', 3],
      ['FFZ Kanal', 2],
      ['7TV global', 2],
      ['BTTV global', 2],
      ['FFZ global', 2],
    ])
    expect(result.failed).toEqual([])
  })

  it('wertet 404 als „kein Konto" – leer, aber kein Fehler', async () => {
    const result = await loadEmotes('474178035', async (url) =>
      url.includes('7tv.io/v3/users') ? { status: 404, json: null } : fromFixtures(url),
    )
    expect(result.sources[0]?.table.size).toBe(0)
    expect(result.failed).toEqual([])
  })

  it('lässt die anderen Quellen weiterlaufen, wenn eine ausfällt', async () => {
    const result = await loadEmotes('474178035', async (url) => {
      if (url.includes('betterttv') && url.includes('users')) throw new Error('offline')
      if (url.includes('frankerfacez.com/v1/set')) return { status: 500, json: null }
      return fromFixtures(url)
    })
    expect(result.failed).toEqual(['BTTV Kanal', 'FFZ global'])
    expect(result.sources.map((source) => source.table.size)).toEqual([3, 0, 2, 2, 2, 0])
  })

  it('fragt bei ungültiger room-id nur die globalen Quellen ab', async () => {
    const asked: string[] = []
    await loadEmotes('12/../x', async (url) => {
      asked.push(url)
      return fromFixtures(url)
    })
    expect(asked.every((url) => url.includes('global'))).toBe(true)
  })
})
