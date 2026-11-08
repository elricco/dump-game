import { describe, expect, it } from 'vitest'
import {
  parseBttvGlobal,
  parseBttvUser,
  parseFfzGlobal,
  parseFfzRoom,
  parseSevenTvGlobal,
  parseSevenTvUser,
} from './emote-providers'
import bttvGlobal from './fixtures/bttv-global.json'
import bttvUser from './fixtures/bttv-user.json'
import ffzGlobal from './fixtures/ffz-global.json'
import ffzRoom from './fixtures/ffz-room.json'
import sevenTvGlobal from './fixtures/7tv-global.json'
import sevenTvUser from './fixtures/7tv-user.json'

const entries = (table: Map<string, string>) => Object.fromEntries(table)

describe('7TV', () => {
  it('liest Kanal-Emotes mit dem Namen aus dem Set (Alias)', () => {
    expect(entries(parseSevenTvUser(sevenTvUser))).toEqual({
      OMEGASP: 'https://cdn.7tv.app/emote/01FAJVGPA0000FAV86FDA2RVFP/4x.webp',
      cmonDance: 'https://cdn.7tv.app/emote/01FP0SVC4R0001BCZZ99DVJFP8/4x.webp',
      peepoJump: 'https://cdn.7tv.app/emote/01FDC150C8000F43V49GZTVECJ/4x.webp',
    })
  })

  it('liest globale Emotes', () => {
    expect([...parseSevenTvGlobal(sevenTvGlobal).keys()]).toEqual(['RainTime', 'PETPET'])
  })

  it('kommt mit Konten ohne Emote-Set klar', () => {
    expect(parseSevenTvUser({ id: 'x', emote_set: null }).size).toBe(0)
  })
})

describe('BTTV', () => {
  it('liest Kanal- und geteilte Emotes', () => {
    expect(entries(parseBttvUser(bttvUser))).toEqual({
      elriccoShy: 'https://cdn.betterttv.net/emote/6228cb2506fd6a9f5be69d95/3x.webp',
      blobDance: 'https://cdn.betterttv.net/emote/5ada077451d4120ea3918426/3x.webp',
      pepeD: 'https://cdn.betterttv.net/emote/5b1740221c5a6065a7bad4b5/3x.webp',
    })
  })

  it('liest globale Emotes', () => {
    expect([...parseBttvGlobal(bttvGlobal).keys()]).toEqual([':tf:', 'CiGrip'])
  })
})

describe('FFZ', () => {
  it('liest Kanal-Emotes in der größten vorhandenen Größe', () => {
    expect(entries(parseFfzRoom(ffzRoom))).toEqual({
      LULW: 'https://cdn.frankerfacez.com/emote/139407/4',
      YEP: 'https://cdn.frankerfacez.com/emote/418189/4',
    })
  })

  it('nimmt global nur die default_sets', () => {
    expect([...parseFfzGlobal(ffzGlobal).keys()]).toEqual(['ZrehplaR', 'ffzW'])
  })

  it('nimmt animierte Varianten, wenn vorhanden, und sonst kleinere Größen', () => {
    const room = {
      sets: {
        '1': {
          emoticons: [
            {
              id: 5,
              name: 'Wiggle',
              urls: { '1': 'x', '2': 'x', '4': 'x' },
              animated: { '1': 'x', '2': 'x' },
            },
            { id: 6, name: 'Tiny', urls: { '1': 'x' } },
          ],
        },
      },
    }
    expect(entries(parseFfzRoom(room))).toEqual({
      Wiggle: 'https://cdn.frankerfacez.com/emote/5/animated/2',
      Tiny: 'https://cdn.frankerfacez.com/emote/6/1',
    })
  })
})

describe('untrusted API-Antworten', () => {
  it('überspringt kaputte Einträge statt zu werfen', () => {
    const user = {
      channelEmotes: [
        null,
        42,
        { id: 'kein-hex', code: 'Bad' },
        { id: '6228cb2506fd6a9f5be69d95' },
      ],
      sharedEmotes: 'kaputt',
    }
    expect(parseBttvUser(user).size).toBe(0)
    expect(parseSevenTvGlobal({ emotes: [{ id: '../../evil', name: 'X' }] }).size).toBe(0)
    expect(
      parseFfzRoom({
        sets: { a: { emoticons: [{ id: '1;drop', name: 'X', urls: { '1': 'x' } }] } },
      }).size,
    ).toBe(0)
    for (const parse of [parseSevenTvUser, parseBttvGlobal, parseFfzGlobal]) {
      expect(parse(undefined).size).toBe(0)
      expect(parse('<html>').size).toBe(0)
    }
  })

  it('übernimmt nie URL-Felder aus der API', () => {
    const [emote] = sevenTvUser.emote_set.emotes
    if (!emote) throw new Error('Fixture leer')
    const tampered = {
      emote_set: {
        emotes: [{ ...emote, data: { ...emote.data, host: { url: '//evil.example/x' } } }],
      },
    }
    expect([...parseSevenTvUser(tampered).values()]).toEqual([
      'https://cdn.7tv.app/emote/01FAJVGPA0000FAV86FDA2RVFP/4x.webp',
    ])
    const ffz = {
      sets: { a: { emoticons: [{ id: 7, name: 'X', urls: { '4': 'https://evil.example/x' } }] } },
    }
    expect(parseFfzRoom(ffz).get('X')).toBe('https://cdn.frankerfacez.com/emote/7/4')
  })
})
