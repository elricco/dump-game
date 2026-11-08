import type { Config } from '../core/config'
import type { Game } from '../core/game'
import { formatScore } from './format'
import { poseFor, type Facing } from './pose'
import { createFigureElement, createTargetPad, zoneBackground } from './sprites'

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
  stage.append(zone, sunk, pad, layer)

  const nodes = new Map<string, FigureNode>()
  let zoneOffset = 0

  return {
    render(game: Game, dt: number, unit: number): void {
      zoneOffset = (zoneOffset + ZONE_SPEED * dt) % 10_000
      zone.style.height = `${game.deathHeight * unit}px`
      zone.style.backgroundPositionX = `${-zoneOffset * unit}px`

      const { width, height } = game.pad.size
      pad.style.width = `${width * unit}px`
      pad.style.height = `${height * unit}px`
      pad.style.transform = `translateX(${(game.pad.center - width / 2) * unit}px)`

      const seen = new Set<string>()
      for (const figure of game.figures) {
        seen.add(figure.id)
        let node = nodes.get(figure.id)
        if (!node) {
          const element = createFigureElement({
            displayName: figure.displayName,
            color: figure.color,
            emote: figure.emote,
            withGlider: true,
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
