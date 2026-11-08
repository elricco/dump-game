/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it } from 'vitest'
import { parseConfig } from '../core/config'
import { renderStatus } from './status'

const show = (query: string) => {
  const root = document.createElement('div')
  renderStatus(root, parseConfig(new URLSearchParams(query)))
  return root
}

describe('renderStatus', () => {
  beforeEach(() => {
    document.body.replaceChildren()
  })

  it('zeigt ohne channel einen Hinweis mit Beispiel-URL', () => {
    const root = show('')
    expect(root.textContent).toContain('channel fehlt')
    expect(root.textContent).toContain('?channel=')
  })

  it('zeigt bei gültiger Config ohne debug nichts an', () => {
    expect(show('channel=elricco1978').childElementCount).toBe(0)
  })

  it('zeigt mit debug=1 Config und Warnungen', () => {
    const root = show('channel=elricco1978&debug=1&vol=9')
    expect(root.textContent).toContain('"channel": "elricco1978"')
    expect(root.textContent).toContain('vol: ungültiger Wert "9"')
  })

  it('setzt Fremdtext nie als HTML ein', () => {
    const root = show('channel=elricco1978&debug=1&vol=%3Cimg%20src%3Dx%3E')
    expect(root.querySelector('img')).toBeNull()
    expect(root.textContent).toContain('<img src=x>')
  })
})
