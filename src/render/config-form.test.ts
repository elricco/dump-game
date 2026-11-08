/* @vitest-environment jsdom */
import { describe, expect, it, vi } from 'vitest'
import { PARAMS, parseConfig, type Config } from '../core/config'
import { serializeConfig } from '../core/config-url'
import { createConfigForm } from './config-form'
import { LABELS } from './config-labels'

const parse = (params: URLSearchParams): Config => {
  const result = parseConfig(params)
  if (!result.ok) throw new Error(result.error)
  return result.config
}

const setup = () => {
  const root = document.createElement('form')
  document.body.replaceChildren(root)
  return { root, form: createConfigForm(root) }
}

const field = (root: HTMLElement, name: string) =>
  root.querySelector<HTMLInputElement>(`[name="${name}"]`)

describe('LABELS', () => {
  it('hat für jeden Parameter Label, Hilfetext und Gruppe', () => {
    for (const param of PARAMS) {
      expect(LABELS[param.name]?.label, param.name).toBeTruthy()
      expect(LABELS[param.name]?.help, param.name).toBeTruthy()
      expect(LABELS[param.name]?.group, param.name).toBeTruthy()
    }
  })
})

describe('createConfigForm', () => {
  it('legt für jeden Parameter ein beschriftetes Feld mit Hilfetext an', () => {
    const { root } = setup()
    for (const param of PARAMS) {
      const control = field(root, param.name)
      expect(control, param.name).not.toBeNull()
      const describedBy = control?.closest('[aria-describedby]')?.getAttribute('aria-describedby')
      expect(
        describedBy && root.querySelector(`#${describedBy}`)?.textContent,
        param.name,
      ).toBeTruthy()
      const labelled =
        control?.id && root.querySelector(`label[for="${control.id}"]`)
          ? true
          : Boolean(control?.closest('fieldset')?.querySelector('legend'))
      expect(labelled, param.name).toBe(true)
    }
  })

  it('übernimmt Bereich, Schrittweite und Standard aus PARAMS', () => {
    const { root } = setup()
    const vol = field(root, 'vol')
    expect([vol?.min, vol?.max, vol?.step, vol?.value]).toEqual(['0', '1', '0.05', '0.5'])
  })

  it('ergibt mit Standardwerten nur den Kanal', () => {
    const { root, form } = setup()
    const channel = field(root, 'channel')
    if (channel) channel.value = 'elricco1978'
    expect(serializeConfig(parse(form.read()))).toBe('channel=elricco1978')
  })

  it('füllt alle Felder aus einer Config – Rundreise ohne Verlust', () => {
    const { form } = setup()
    const config = parse(
      new URLSearchParams(
        'channel=elricco1978&modes=bump&theme=custom&land=https://a.example/l.png&death=https://a.example/d.png&vol=0.2&move=0&highscore=week&perm=vip,sub&cmd_jump=sprung&debug=1&drift_max=6',
      ),
    )
    form.fill(config)
    expect(serializeConfig(parse(form.read()))).toBe(serializeConfig(config))
  })

  it('aktiviert die Felder für eigene Bilder nur bei theme=custom', () => {
    const { root, form } = setup()
    expect(field(root, 'land')?.disabled).toBe(true)
    const theme = root.querySelector<HTMLSelectElement>('[name="theme"]')
    if (theme) theme.value = 'custom'
    theme?.dispatchEvent(new Event('change', { bubbles: true }))
    expect(field(root, 'land')?.disabled).toBe(false)
    expect(field(root, 'death_surface')?.disabled).toBe(false)
    form.fill(parse(new URLSearchParams('channel=abc')))
    expect(field(root, 'land')?.disabled).toBe(true)
  })

  it('meldet Änderungen', () => {
    const { root, form } = setup()
    const listener = vi.fn()
    form.onChange(listener)
    field(root, 'vol')?.dispatchEvent(new Event('input', { bubbles: true }))
    expect(listener).toHaveBeenCalledTimes(1)
  })
})
