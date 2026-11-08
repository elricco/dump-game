// Config-Seite: Formular → geprüfte Config → Vorschau + kopierbare Overlay-URL.
import { parseConfig } from './core/config'
import { paramsFromText, serializeConfig } from './core/config-url'
import { createConfigForm } from './render/config-form'
import { applyConfigVars } from './render/design-vars'

const PREVIEW_DELAY_MS = 500
const PLACEHOLDER_CHANNEL = 'kanal_fehlt'

const $ = <T extends HTMLElement>(id: string) => {
  const element = document.getElementById(id)
  if (!element) throw new Error(`#${id} fehlt`)
  return element as T
}

applyConfigVars(document.documentElement)

const formRoot = $<HTMLFormElement>('config-form')
const form = createConfigForm(formRoot)
const result = $<HTMLTextAreaElement>('result')
const messages = $<HTMLUListElement>('messages')
const preview = $<HTMLIFrameElement>('preview')
const previewToggle = $<HTMLButtonElement>('preview-toggle')
const previewPaused = $<HTMLParagraphElement>('preview-paused')
const copyStatus = $<HTMLParagraphElement>('copy-status')
const channelField = formRoot.querySelector<HTMLInputElement>('[name="channel"]')

const overlayBase = new URL('./', window.location.href)
let previewQuery = ''
let previewTimer: number | undefined
let paused = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const showMessages = (lines: string[]) => {
  messages.replaceChildren(
    ...lines.map((line) => {
      const item = document.createElement('li')
      item.textContent = line
      return item
    }),
  )
}

const updatePreview = () => {
  previewToggle.textContent = paused ? 'Vorschau starten' : 'Vorschau anhalten'
  previewToggle.setAttribute('aria-pressed', String(paused))
  previewPaused.hidden = !paused
  preview.hidden = paused
  const src = paused ? 'about:blank' : `./demo.html?${previewQuery}&preview=1`
  if (preview.getAttribute('src') !== src) preview.setAttribute('src', src)
}

const update = () => {
  const parsed = parseConfig(form.read())
  if (!parsed.ok) {
    channelField?.setAttribute('aria-invalid', 'true')
    result.value = ''
    showMessages([
      parsed.error === 'channel fehlt'
        ? 'Bitte den Twitch-Kanal eintragen.'
        : 'Der Kanal ist ungültig: 3–25 Zeichen, nur Buchstaben, Ziffern und _.',
    ])
    return
  }
  channelField?.removeAttribute('aria-invalid')
  const query = serializeConfig(parsed.config)
  result.value = new URL(`?${query}`, overlayBase).href
  showMessages(parsed.warnings)
  window.history.replaceState(null, '', `?${query}`)
  window.clearTimeout(previewTimer)
  previewTimer = window.setTimeout(() => {
    previewQuery = query
    updatePreview()
  }, PREVIEW_DELAY_MS)
}

/** URL-Parameter ins Formular übernehmen; ohne gültigen Kanal bleibt das Kanalfeld leer. */
const importParams = (params: URLSearchParams): string[] => {
  const channel = params.get('channel') ?? ''
  const probe = new URLSearchParams(params)
  if (!parseConfig(new URLSearchParams(`channel=${encodeURIComponent(channel)}`)).ok) {
    probe.set('channel', PLACEHOLDER_CHANNEL)
  }
  const parsed = parseConfig(probe)
  if (!parsed.ok) return [parsed.error]
  form.fill(
    parsed.config,
    probe.get('channel') === PLACEHOLDER_CHANNEL ? '' : parsed.config.channel,
  )
  return parsed.warnings
}

form.onChange(update)

$<HTMLButtonElement>('import-button').addEventListener('click', () => {
  const field = $<HTMLInputElement>('import-url')
  const warnings = importParams(paramsFromText(field.value))
  update()
  copyStatus.textContent = 'URL eingelesen.'
  if (warnings.length)
    showMessages([...warnings, ...[...messages.children].map((li) => li.textContent ?? '')])
})

$<HTMLButtonElement>('copy').addEventListener('click', async () => {
  if (!result.value) {
    copyStatus.textContent = 'Erst den Twitch-Kanal eintragen.'
    channelField?.focus()
    return
  }
  try {
    await navigator.clipboard.writeText(result.value)
    copyStatus.textContent = 'Kopiert.'
  } catch {
    result.focus()
    result.select()
    copyStatus.textContent =
      'Kopieren nicht erlaubt – URL ist markiert, bitte mit Strg/Cmd+C kopieren.'
  }
})

previewToggle.addEventListener('click', () => {
  paused = !paused
  updatePreview()
})

importParams(new URLSearchParams(window.location.search))
update()
updatePreview()
