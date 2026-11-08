import type { Config } from '../core/config'
import type { Game } from '../core/game'
import { formatScore } from './format'
import { poseFor, type Facing } from './pose'
import { createFigureElement, createPeg, createTargetPad, zoneBackground } from './sprites'

/** Referenz-px pro Sekunde, mit denen das Muster der Todeszone seitlich läuft. */
const ZONE_SPEED = 30

interface FigureNode {
  element: HTMLElement
  rig: HTMLElement
  score: HTMLElement
  facing: Facing
}

/** Überträgt den Spielzustand ins DOM. `unit` = Bildschirm-px je Referenz-px. */
export function createStageView(stage: HTMLElement, config: Config) {
  const zone = document.createElement('div')
  zone.className = 'zone'
  zone.style.backgroundImage =
    config.theme === 'custom' && config.death
      ? `url("${config.death}")`
      : zoneBackground(config.theme === 'lava' ? 'lava' : 'target')

  const pad = document.createElement('div')
  pad.className = 'pad'
  if (config.theme === 'custom' && config.land) {
    const image = document.createElement('img')
    image.className = 'pad__image'
    image.src = config.land
    image.alt = ''
    pad.append(image)
  } else {
    pad.append(createTargetPad())
  }

  const layer = document.createElement('div')
  layer.className = 'figures'
  // Tote liegen hinter der Landefläche: Sie stecken in der Todeszone.
  const sunk = document.createElement('div')
  sunk.className = 'figures'
  const pegLayer = document.createElement('div')
  pegLayer.className = 'pegs'
  stage.append(zone, sunk, pad, pegLayer, layer)
  let pegKey = ''

  const nodes = new Map<string, FigureNode>()
  let zoneOffset = 0

  return {
    render(game: Game, dt: number, unit: number): void {
      // Fläche und Todeszone nur während einer Runde (erste Figur bis Reset).
      stage.classList.toggle('stage--idle', game.figures.length === 0)
      zoneOffset = (zoneOffset + ZONE_SPEED * dt) % 10_000
      zone.style.height = `${game.deathHeight * unit}px`
      zone.style.backgroundPositionX = `${-zoneOffset * unit}px`

      const { width, height } = game.pad.size
      pad.style.width = `${width * unit}px`
      pad.style.height = `${height * unit}px`
      pad.style.transform = `translateX(${(game.pad.center - width / 2) * unit}px)`

      // Stifte nur neu aufbauen, wenn sich Sichtbarkeit, Lage oder Größe ändert.
      const key = game.pegsVisible ? `${game.pegs.length}:${game.pegs[0]?.x}:${unit}` : ''
      if (key !== pegKey) {
        pegKey = key
        const size = game.pegRadius * 2 * unit
        pegLayer.replaceChildren(
          ...(game.pegsVisible ? game.pegs : []).map((peg) => {
            const element = document.createElement('div')
            element.className = 'peg'
            element.style.width = element.style.height = `${size}px`
            element.style.transform = `translate(${peg.x * unit - size / 2}px, ${peg.y * unit - size / 2}px)`
            element.append(createPeg())
            return element
          }),
        )
      }

      const seen = new Set<string>()
      for (const figure of game.figures) {
        seen.add(figure.id)
        let node = nodes.get(figure.id)
        if (!node) {
          const element = createFigureElement({
            displayName: figure.displayName,
            color: figure.color,
            emote: figure.emote,
            withGlider: figure.mode === 'jump',
          })
          const rig = element.querySelector<HTMLElement>('.figure__rig')
          const score = element.querySelector<HTMLElement>('.figure__score')
          if (!rig || !score) continue
          node = { element, rig, score, facing: 1 }
          nodes.set(figure.id, node)
          layer.append(element)
        }

        node.element.style.transform = `translate(${figure.x * unit}px, ${figure.bottom * unit}px) translate(-50%, -100%)`
        node.element.style.opacity = String(figure.opacity)

        if (figure.state === 'dead' && node.element.parentElement !== sunk) {
          sunk.append(node.element)
        }

        if (figure.state === 'landed') {
          node.element.classList.add('figure--landed')
          node.rig.style.transform = ''
          if (figure.score !== null) node.score.textContent = formatScore(figure.score)
        } else if (figure.mode === 'bump') {
          node.rig.style.transform = `rotate(${figure.spin}deg)`
        } else {
          const pose = poseFor(figure.velocity, node.facing)
          node.facing = pose.facing
          node.rig.style.transform = `rotate(${pose.tilt}deg) scaleX(${pose.facing})`
        }
      }

      for (const [id, node] of nodes) {
        if (seen.has(id)) continue
        node.element.remove()
        nodes.delete(id)
      }
    },
  }
}
