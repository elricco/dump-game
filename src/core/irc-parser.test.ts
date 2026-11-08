import { describe, expect, it } from 'vitest'
import { parseIrcLine, splitIrcFrame } from './irc-parser'

describe('splitIrcFrame', () => {
  it('zerlegt einen Frame an CRLF und lässt leere Zeilen weg', () => {
    expect(splitIrcFrame('PING :tmi.twitch.tv\r\n:a JOIN #b\r\n')).toEqual([
      'PING :tmi.twitch.tv',
      ':a JOIN #b',
    ])
  })
})

describe('parseIrcLine', () => {
  it('liefert null für eine leere Zeile', () => {
    expect(parseIrcLine('')).toBeNull()
  })

  it('liest einen PING ohne Tags und Prefix', () => {
    expect(parseIrcLine('PING :tmi.twitch.tv')).toEqual({
      tags: {},
      prefix: null,
      command: 'PING',
      params: [],
      trailing: 'tmi.twitch.tv',
    })
  })

  it('liest Tags, Prefix, Parameter und Trailing einer PRIVMSG', () => {
    const line =
      '@badges=moderator/1;color=#FF0000;display-name=Elricco :elricco!elricco@elricco.tmi.twitch.tv PRIVMSG #elricco1978 :!jump Kappa'
    expect(parseIrcLine(line)).toEqual({
      tags: { badges: 'moderator/1', color: '#FF0000', 'display-name': 'Elricco' },
      prefix: 'elricco!elricco@elricco.tmi.twitch.tv',
      command: 'PRIVMSG',
      params: ['#elricco1978'],
      trailing: '!jump Kappa',
    })
  })

  it('behält Doppelpunkte im Trailing', () => {
    expect(parseIrcLine(':a PRIVMSG #b :hallo: welt :)')?.trailing).toBe('hallo: welt :)')
  })

  it('liest numerische Befehle mit mehreren Parametern', () => {
    expect(
      parseIrcLine(':tmi.twitch.tv 366 justinfan1 #elricco1978 :End of /NAMES list'),
    ).toMatchObject({
      command: '366',
      params: ['justinfan1', '#elricco1978'],
    })
  })

  it('entschlüsselt Tag-Werte', () => {
    const line = String.raw`@system-msg=a\sb\:c\\d\re\nf\xg\ :tmi.twitch.tv USERNOTICE #b`
    expect(parseIrcLine(line)?.tags['system-msg']).toBe('a b;c\\d\re\nfxg')
  })

  it('liest Tags ohne Wert als leeren String', () => {
    expect(parseIrcLine('@emotes=;flag :a PRIVMSG #b :x')?.tags).toEqual({ emotes: '', flag: '' })
  })
})
