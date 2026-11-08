import type { ParseResult } from '../core/config'

const EXAMPLE = '?channel=deinkanal'

/** Zeigt Konfigurationsfehler bzw. (mit debug=1) die geladene Config. Nur textContent. */
export function renderStatus(root: HTMLElement, result: ParseResult): void {
  root.replaceChildren()

  if (!result.ok) {
    const hint = document.createElement('p')
    hint.className = 'status status--error'
    hint.textContent = `DUMP Game: ${result.error}. Beispiel-URL: ${EXAMPLE}`
    root.append(hint)
    return
  }

  if (!result.config.debug) return

  const details = document.createElement('details')
  details.className = 'status'
  const summary = document.createElement('summary')
  summary.textContent = 'Config'
  const json = document.createElement('pre')
  json.textContent = JSON.stringify(result.config, null, 2)
  details.append(summary, json)

  const warnings = document.createElement('ul')
  warnings.className = 'status'
  for (const warning of result.warnings) {
    const item = document.createElement('li')
    item.textContent = warning
    warnings.append(item)
  }

  if (result.warnings.length > 0) root.append(warnings)
  root.append(details)
}
