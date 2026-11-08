// Design-Vorschau (nur Dev-Server): alle Themes, Figuren, Emote, Wertung, Tod.
import { STAGE_HEIGHT } from './core/game'
import { components } from './generated/design-tokens'
import { applyDesignVars, setUnit } from './render/design-vars'
import { createFigureElement, createTargetPad, zoneBackground } from './render/sprites'

const stage = document.getElementById('stage')
if (!stage) throw new Error('#stage fehlt')
applyDesignVars(stage, 1)
const unit = setUnit(stage, window.innerHeight)
const columnWidth = window.innerWidth / 3

const CUSTOM_LAND = 'https://indie-agentur.de/arthurtschik/jumper/schublade.png'
const CUSTOM_DEATH = 'https://www.indie-agentur.de/arthurtschik/jumper/swords2.png'

const place = (element: HTMLElement, x: number, bottom: number) => {
  element.style.transform = `translate(${x}px, ${bottom * unit}px) translate(-50%, -100%)`
}

const themes = [
  { theme: 'target', label: 'target – Zielscheibe + Wasser' },
  { theme: 'lava', label: 'lava – Zielscheibe + Lava' },
  { theme: 'custom', label: 'custom – Kommode + Schwertwall' },
] as const

themes.forEach(({ theme, label }, index) => {
  const column = document.createElement('div')
  column.className = 'column'
  column.style.left = `${index * columnWidth}px`
  column.style.width = `${columnWidth}px`

  const caption = document.createElement('div')
  caption.className = 'caption'
  caption.textContent = label

  const zone = document.createElement('div')
  zone.className = 'zone'
  const zoneHeight = theme === 'custom' ? components.customZone.height : components.waterZone.height
  zone.style.height = `${zoneHeight * unit}px`
  zone.style.backgroundImage = theme === 'custom' ? `url("${CUSTOM_DEATH}")` : zoneBackground(theme)

  const pad = document.createElement('div')
  pad.className = 'pad'
  const padSize =
    theme === 'custom' ? { width: 256, height: components.customPad.height } : components.targetPad
  pad.style.width = `${padSize.width * unit}px`
  pad.style.height = `${padSize.height * unit}px`
  const padX = columnWidth / 2
  pad.style.transform = `translateX(${padX - (padSize.width * unit) / 2}px)`
  if (theme === 'custom') {
    const image = document.createElement('img')
    image.className = 'pad__image'
    image.src = CUSTOM_LAND
    image.alt = ''
    pad.append(image)
  } else {
    pad.append(createTargetPad())
  }

  column.append(caption, zone, pad)

  // Fallende Figuren am Gleiter
  const falling = [
    { displayName: 'ElRicco1978', color: '#8a2be2', emote: null, x: 0.25, y: 260 },
    { displayName: 'FranklyFaye', color: '#ff4500', emote: null, x: 0.7, y: 420 },
    {
      displayName: 'cmonDancer',
      color: '#1e90ff',
      emote: 'https://cdn.7tv.app/emote/01FP0SVC4R0001BCZZ99DVJFP8/4x.webp',
      x: 0.45,
      y: 640,
    },
  ]
  for (const figure of falling) {
    const element = createFigureElement({ ...figure, withGlider: true })
    place(element, figure.x * columnWidth, figure.y)
    column.append(element)
  }

  // Gelandet: Beste voll, Zweite halb; Tote halb in der Todeszone
  const padTop = STAGE_HEIGHT - padSize.height
  const landed = [
    { displayName: 'Tenacious', color: '#2e8b57', score: '98,96 %', dx: -12, opacity: 1 },
    { displayName: 'SadPosture', color: '#daa520', score: '49,48 %', dx: 70, opacity: 0.5 },
  ]
  for (const figure of landed) {
    const element = createFigureElement({ ...figure, emote: null, withGlider: true })
    const score = element.querySelector('.figure__score')
    if (score) score.textContent = figure.score
    element.style.opacity = String(figure.opacity)
    place(element, padX + figure.dx * unit, padTop)
    column.append(element)
  }
  const dead = createFigureElement({
    displayName: 'Falseidols',
    color: '#ff69b4',
    emote: null,
    withGlider: true,
  })
  dead.style.opacity = '0.5'
  place(dead, columnWidth * 0.12, STAGE_HEIGHT - zoneHeight / 2)
  column.append(dead)

  stage.append(column)
})
