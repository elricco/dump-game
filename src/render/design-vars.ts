import { STAGE_HEIGHT } from '../core/game'
import { colors, components, spacing, typography } from '../generated/design-tokens'

/** Macht die Tokens aus DESIGN.md als CSS-Variablen verfügbar (Zahlen = Referenz-px). */
export function applyDesignVars(stage: HTMLElement, scale: number): void {
  const set = (name: string, value: string | number) => stage.style.setProperty(name, String(value))
  for (const [name, value] of Object.entries(colors)) set(`--color-${name}`, value)
  set('--name-size', typography.name.fontSize)
  set('--name-weight', typography.name.fontWeight)
  set('--name-spacing', typography.name.letterSpacing)
  set('--score-size', typography.score.fontSize)
  set('--score-weight', typography.score.fontWeight)
  set('--font', `"${typography.name.fontFamily}"`)
  set('--label-gap', spacing.labelGap)
  set('--outline-width', spacing.outlineWidth)
  set('--scoreboard-inset', spacing.scoreboardInset)
  set('--scale', scale)
  set('--figure-w', components.figure.width)
  set('--figure-h', components.figure.height)
  set('--glider-w', components.glider.width)
  set('--glider-h', components.glider.height)
  set('--emote-h', components.emote.height)
}

/** Setzt --u = Bildschirm-px pro Referenz-px und gibt den Wert zurück. */
export function setUnit(stage: HTMLElement, viewportHeight: number): number {
  const unit = viewportHeight / STAGE_HEIGHT
  stage.style.setProperty('--u', String(unit))
  return unit
}

/** Tokens der Config-Seite als CSS-Variablen (Größen mit Einheit, für normales CSS). */
export function applyConfigVars(root: HTMLElement): void {
  const set = (name: string, value: string | number) => root.style.setProperty(name, String(value))
  for (const [name, value] of Object.entries(colors)) set(`--color-${name}`, value)
  set('--pixel-font', `"${typography.configTitle.fontFamily}"`)
  set('--config-title-size', `${typography.configTitle.fontSize}px`)
  set('--config-heading-size', `${typography.configHeading.fontSize}px`)
  set('--config-body-size', `${typography.configBody.fontSize}px`)
  set('--config-body-line', typography.configBody.lineHeight)
  set('--config-label-size', `${typography.configLabel.fontSize}px`)
  set('--config-label-weight', typography.configLabel.fontWeight)
  set('--config-code-size', `${typography.configCode.fontSize}px`)
  set('--config-gap', `${spacing.configGap}px`)
  set('--config-section', `${spacing.configSection}px`)
  set('--config-focus', `${spacing.configFocus}px`)
}
