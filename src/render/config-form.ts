import { PARAMS, type Config, type ParamSpec } from '../core/config'
import { GROUPS, LABELS } from './config-labels'

type Control = HTMLInputElement | HTMLSelectElement

/**
 * Formular der Config-Seite, erzeugt aus PARAMS (Bereiche, Standards,
 * Optionen) und LABELS (deutsche Texte). Liefert die rohen Werte als
 * URLSearchParams – geprüft wird wie im Overlay mit parseConfig.
 */
export function createConfigForm(root: HTMLElement) {
  const listeners: (() => void)[] = []
  const customOnly: Control[] = []

  const text = (tag: string, className: string, content: string) => {
    const element = document.createElement(tag)
    element.className = className
    element.textContent = content
    return element
  }

  const help = (param: ParamSpec) => {
    const element = text('p', 'config__help', LABELS[param.name]?.help ?? '')
    element.id = `help-${param.name}`
    return element
  }

  const build = (param: ParamSpec): HTMLElement => {
    const label = LABELS[param.name]
    const wrapper = document.createElement('div')
    wrapper.className = 'config__field'

    if (param.kind === 'list') {
      const group = document.createElement('fieldset')
      group.className = 'config__choices'
      group.setAttribute('aria-describedby', `help-${param.name}`)
      group.append(text('legend', 'config__label', label?.label ?? param.name))
      for (const option of param.options) {
        const id = `field-${param.name}-${option}`
        const box = document.createElement('input')
        box.type = 'checkbox'
        box.id = id
        box.name = param.name
        box.value = option
        box.checked = param.fallback.includes(option)
        const optionLabel = text('label', 'config__option', label?.options?.[option] ?? option)
        optionLabel.setAttribute('for', id)
        const row = document.createElement('div')
        row.className = 'config__choice'
        row.append(box, optionLabel)
        group.append(row)
      }
      group.append(help(param))
      wrapper.append(group)
      return wrapper
    }

    const id = `field-${param.name}`
    let control: Control
    if (param.kind === 'choice') {
      control = document.createElement('select')
      for (const option of param.options) {
        const element = document.createElement('option')
        element.value = option
        element.textContent = label?.options?.[option] ?? option
        control.append(element)
      }
      control.value = param.fallback
    } else {
      control = document.createElement('input')
      if (param.kind === 'number') {
        control.type = 'number'
        control.min = String(param.min)
        control.max = String(param.max)
        control.step = String(param.step)
        control.value = String(param.fallback)
        control.inputMode = 'decimal'
      } else if (param.kind === 'flag') {
        control.type = 'checkbox'
        control.checked = param.fallback
      } else if (param.kind === 'url') {
        control.type = 'url'
        control.placeholder = 'https://…'
      } else {
        control.type = 'text'
        control.autocomplete = 'off'
        control.spellcheck = false
        if (param.kind === 'command') control.value = param.fallback
        if (param.kind === 'channel') control.required = true
      }
    }
    control.id = id
    control.name = param.name
    control.className = 'config__control'
    control.setAttribute('aria-describedby', `help-${param.name}`)
    if (label?.customOnly) customOnly.push(control)

    const labelElement = text('label', 'config__label', label?.label ?? param.name)
    labelElement.setAttribute('for', id)
    if (param.kind === 'flag') {
      wrapper.classList.add('config__field--flag')
      wrapper.append(control, labelElement, help(param))
    } else {
      wrapper.append(labelElement, control, help(param))
    }
    return wrapper
  }

  for (const group of GROUPS) {
    const section = document.createElement('fieldset')
    section.className = 'config__group'
    section.append(text('legend', 'config__heading', group))
    for (const param of PARAMS)
      if (LABELS[param.name]?.group === group) section.append(build(param))
    root.append(section)
  }

  const controls = (name: string) => [
    ...root.querySelectorAll<Control>(`[name="${CSS.escape(name)}"]`),
  ]
  const theme = () => root.querySelector<HTMLSelectElement>('[name="theme"]')?.value
  const syncCustom = () => {
    for (const control of customOnly) control.disabled = theme() !== 'custom'
  }
  syncCustom()

  const notify = () => {
    syncCustom()
    for (const listener of listeners) listener()
  }
  root.addEventListener('input', notify)
  root.addEventListener('change', notify)

  return {
    /** Rohe Feldwerte als URL-Parameter (ungeprüft). */
    read(): URLSearchParams {
      const params = new URLSearchParams()
      for (const param of PARAMS) {
        const [control] = controls(param.name)
        if (!control) continue
        if (param.kind === 'list') {
          const checked = controls(param.name).filter((box) => (box as HTMLInputElement).checked)
          params.set(param.name, checked.map((box) => box.value).join(','))
        } else if (param.kind === 'flag') {
          params.set(param.name, (control as HTMLInputElement).checked ? '1' : '0')
        } else if (control.value.trim() !== '') {
          params.set(param.name, control.value.trim())
        }
      }
      return params
    },

    /** Alle Felder aus einer geprüften Config füllen. */
    fill(config: Config, channel = config.channel): void {
      for (const param of PARAMS) {
        const value = param.kind === 'channel' ? channel : config[param.key]
        const [control] = controls(param.name)
        if (!control) continue
        if (param.kind === 'list' && Array.isArray(value)) {
          const selected = value.map(String)
          for (const box of controls(param.name)) {
            ;(box as HTMLInputElement).checked = selected.includes(box.value)
          }
        } else if (param.kind === 'flag') {
          ;(control as HTMLInputElement).checked = value === true
        } else {
          control.value = value === null ? '' : String(value)
        }
      }
      syncCustom()
    },

    onChange(listener: () => void): void {
      listeners.push(listener)
    },
  }
}
