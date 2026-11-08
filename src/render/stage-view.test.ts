/* @vitest-environment jsdom */
import { describe, expect, it } from 'vitest'
import { parseConfig } from '../core/config'
import { Game, type GameSizes } from '../core/game'
import { createStageView } from './stage-view'

const SIZES: GameSizes = {
  figure: { width: 54, height: 72 },
  pad: { width: 268, height: 68, surface: 26 },
  death: { height: 80, surface: 40 },
}

const setup = (query = '', rolls = [0.5, 0, 0, 0.9, 1, 0.9]) => {
  const result = parseConfig(
    new URLSearchParams(
      `channel=elricco1978&move=0&${query}&drift_min=1&drift_max=4&sink_min=2&sink_max=4`,
    ),
  )
  if (!result.ok) throw new Error(result.error)
  const values = [...rolls]
  const game = new Game(result.config, SIZES, 1000, () => values.shift() ?? 0.5)
  const stage = document.createElement('div')
  const view = createStageView(stage, result.config)
  return { game, stage, view }
}

const anna = { login: 'anna', displayName: 'Anna', color: '#8a2be2' }

describe('createStageView – Landefläche und Todeszone', () => {
  it('zeichnet beim Theme target Zielscheibe und Wassermuster', () => {
    const { stage } = setup()
    expect(stage.querySelector('.pad .pad__target')).not.toBeNull()
    expect((stage.querySelector('.zone') as HTMLElement).style.backgroundImage).toContain(
      'data:image/svg+xml',
    )
  })

  it('nutzt bei custom die Bilder aus land und death', () => {
    const { stage } = setup(
      'theme=custom&land=https://a.example/l.png&death=https://a.example/d.png',
    )
    expect(stage.querySelector('.pad img')?.getAttribute('src')).toBe('https://a.example/l.png')
    expect((stage.querySelector('.zone') as HTMLElement).style.backgroundImage).toContain(
      'https://a.example/d.png',
    )
  })

  it('setzt Größe und Lage der Fläche in Bildschirm-px', () => {
    const { game, stage, view } = setup()
    view.render(game, 0, 2)
    const pad = stage.querySelector('.pad') as HTMLElement
    expect(pad.style.width).toBe(`${268 * 2}px`)
    expect(pad.style.transform).toBe(`translateX(${(500 - 134) * 2}px)`)
    expect((stage.querySelector('.zone') as HTMLElement).style.height).toBe('160px')
  })
})

describe('createStageView – Figuren', () => {
  it('legt für jede Figur ein Element an und setzt die Position', () => {
    const { game, stage, view } = setup()
    const figure = game.spawnJump(anna, null)
    game.step(0.5)
    view.render(game, 0, 2)
    const element = stage.querySelector('.figure') as HTMLElement
    expect(element.style.transform).toBe(
      `translate(${figure.x * 2}px, ${figure.bottom * 2}px) translate(-50%, -100%)`,
    )
  })

  it('entfernt Figuren nach dem Reset', () => {
    const { game, stage, view } = setup()
    game.spawnJump(anna, null)
    view.render(game, 0, 1)
    game.reset()
    view.render(game, 0, 1)
    expect(stage.querySelectorAll('.figure')).toHaveLength(0)
  })

  it('zeigt nach der Landung die Prozentzahl, nimmt den Gleiter ab und steht gerade', () => {
    const { game, stage, view } = setup()
    game.spawnJump(anna, null)
    for (let i = 0; i < 600; i++) game.step(1 / 60)
    view.render(game, 0, 1)
    const element = stage.querySelector('.figure') as HTMLElement
    expect(element.classList.contains('figure--landed')).toBe(true)
    expect(element.querySelector('.figure__score')?.textContent).toBe('100 %')
    expect((element.querySelector('.figure__rig') as HTMLElement).style.transform).toBe('')
  })

  it('neigt und spiegelt das Rig nach der Flugrichtung', () => {
    const { game, stage, view } = setup('', [0.5, 0.5, 1, 0.1, 0, 0.9]) // schnell nach links
    game.spawnJump(anna, null)
    view.render(game, 0, 1)
    const rig = stage.querySelector('.figure__rig') as HTMLElement
    expect(rig.style.transform).toMatch(/^rotate\(-[\d.]+deg\) scaleX\(-1\)$/)
  })

  it('zeichnet Tote hinter die Landefläche – sie stecken in der Todeszone', () => {
    const { game, stage, view } = setup('', [0, 0, 0, 0.9, 1, 0.9]) // ganz links, neben der Fläche
    game.spawnJump(anna, null)
    for (let i = 0; i < 600; i++) game.step(1 / 60)
    view.render(game, 0, 1)
    const figure = stage.querySelector('.figure') as HTMLElement
    const pad = stage.querySelector('.pad') as HTMLElement
    expect(figure.style.opacity).toBe('0.5')
    expect(figure.compareDocumentPosition(pad) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('übernimmt die Deckkraft aus dem Spiel', () => {
    const { game, stage, view } = setup()
    const figure = game.spawnJump(anna, null)
    figure.opacity = 0.5
    view.render(game, 0, 1)
    expect((stage.querySelector('.figure') as HTMLElement).style.opacity).toBe('0.5')
  })
})
