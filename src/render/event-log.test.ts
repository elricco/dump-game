/* @vitest-environment jsdom */
import { describe, expect, it } from 'vitest'
import type { ChatMessage } from '../core/chat-message'
import { createEventLog } from './event-log'

const anna: ChatMessage = {
  login: 'anna',
  displayName: 'Anna',
  color: null,
  roles: { broadcaster: false, mod: false, vip: false, sub: false },
  text: '!jump Kappa',
  emotes: '',
}

const lines = (root: HTMLElement) => [...root.querySelectorAll('li')].map((li) => li.textContent)

describe('createEventLog', () => {
  it('zeigt den Verbindungsstatus', () => {
    const root = document.createElement('div')
    createEventLog(root).status('connected')
    expect(root.textContent).toContain('Chat: connected')
  })

  it('steht vor bereits vorhandenem Inhalt (z. B. der Config-Ausgabe)', () => {
    const root = document.createElement('div')
    root.append(document.createElement('pre'))
    createEventLog(root).status('connected')
    expect(root.firstElementChild?.textContent).toBe('Chat: connected')
  })

  it('beschreibt Ereignisse lesbar, neueste oben', () => {
    const root = document.createElement('div')
    const log = createEventLog(root)
    log.push({ type: 'spawn', mode: 'jump', message: anna, arg: 'Kappa' })
    log.push({ type: 'spawn', mode: 'bump', message: anna, arg: null })
    log.push({ type: 'ignored', reason: 'already-played', login: 'anna' })
    log.push({ type: 'reset', reason: 'auto' })
    expect(lines(root)).toEqual([
      'reset auto',
      'ignored already-played anna',
      'spawn bump Anna',
      'spawn jump Anna (Kappa)',
    ])
  })

  it('behält nur die letzten 10 Ereignisse', () => {
    const root = document.createElement('div')
    const log = createEventLog(root)
    for (let i = 0; i < 12; i++) log.push({ type: 'reset', reason: 'command' })
    expect(lines(root)).toHaveLength(10)
  })

  it('setzt Namen und Emote-Text nie als HTML ein', () => {
    const root = document.createElement('div')
    const log = createEventLog(root)
    log.push({
      type: 'spawn',
      mode: 'jump',
      message: { ...anna, displayName: '<b>x</b>' },
      arg: '<img src=x>',
    })
    expect(root.querySelector('b, img')).toBeNull()
  })
})
