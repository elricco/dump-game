---
version: alpha
name: DUMP Game
description: Overlay-Spiel für Twitch – Pixel-Figuren am Hängegleiter über dem Stream, Landefläche und Todeszone am unteren Rand.
colors:
  primary: '#ffffff'
  outline: '#0e0e10'
  skin: '#f1c27d'
  helmet: '#3a3f4b'
  goggles: '#7fd3ff'
  boots: '#2a2a2a'
  glider: '#eef1f5'
  gliderStripe: '#ff5a36'
  gliderShade: '#b9c0cc'
  targetRed: '#d7263d'
  targetWhite: '#f5f5f5'
  targetRim: '#8c1c2b'
  water: '#1e6fd9'
  waterLight: '#5fb3ff'
  lava: '#ff5a1f'
  lavaGlow: '#ffc23d'
  lavaCrust: '#5a1a0b'
typography:
  name:
    fontFamily: system-ui
    fontSize: 26px
    fontWeight: 900
    lineHeight: 1
    letterSpacing: 0.04em
  score:
    fontFamily: system-ui
    fontSize: 24px
    fontWeight: 900
    lineHeight: 1
spacing:
  labelGap: 4px
  outlineWidth: 5px
components:
  scoreLabel:
    textColor: '{colors.primary}'
    backgroundColor: '{colors.outline}'
    typography: '{typography.score}'
  nameLabel:
    backgroundColor: '{colors.outline}'
    typography: '{typography.name}'
  figure:
    backgroundColor: '{colors.skin}'
    width: 48px
    height: 72px
  figureHelmet:
    backgroundColor: '{colors.helmet}'
  figureGoggles:
    backgroundColor: '{colors.goggles}'
  figureBoots:
    backgroundColor: '{colors.boots}'
  glider:
    backgroundColor: '{colors.glider}'
    width: 144px
    height: 52px
  gliderStripe:
    backgroundColor: '{colors.gliderStripe}'
  gliderShade:
    backgroundColor: '{colors.gliderShade}'
  emote:
    height: 72px
  targetPad:
    backgroundColor: '{colors.targetRed}'
    width: 260px
    height: 60px
  targetPadRing:
    backgroundColor: '{colors.targetWhite}'
  targetPadRim:
    backgroundColor: '{colors.targetRim}'
  waterZone:
    backgroundColor: '{colors.water}'
    height: 80px
  waterZoneCrest:
    backgroundColor: '{colors.waterLight}'
  lavaZone:
    backgroundColor: '{colors.lava}'
    height: 80px
  lavaZoneGlow:
    backgroundColor: '{colors.lavaGlow}'
  lavaZoneCrust:
    backgroundColor: '{colors.lavaCrust}'
  customPad:
    height: 100px
  customZone:
    height: 88px
omitted:
  - section: rounded
    reason: 'Pixel-Grafik und Flächen – keine abgerundeten UI-Elemente.'
---

# DUMP Game

## Overview

Ein Spiel, das **über** dem Stream liegt, nicht ein Fenster im Stream. Alles
ist transparent bis auf die Figuren, die Landefläche und die Todeszone am
unteren Rand. Der Look ist verspielt-retro: kleine Pixel-Männchen im
Fallschirmspringer-Anzug, ein heller Hängegleiter mit Signalstreifen,
kräftige Flächen unten. Lesbarkeit auf **jedem** Stream-Hintergrund (hell,
dunkel, bunt, Webcam) geht vor Feinheit – deshalb tragen alle Texte eine
dicke dunkle Kontur.

Alle Maße sind **Referenz-Pixel einer 1080 px hohen Bühne**. Der Renderer
rechnet sie mit `Fensterhöhe / 1080` und dem Parameter `scale` um – so sieht
das Spiel in 1080p, 1440p und 4K gleich aus.

## Colors

- **Primary (#ffffff):** Text der Prozentzahl.
- **Outline (#0e0e10):** Kontur um Name und Prozentzahl und um die
  Pixel-Figur – trennt alles vom Stream-Hintergrund.
- **Spielerfarbe:** Anzug der Figur und Name kommen aus der Twitch-Chatfarbe
  (ohne Chatfarbe: feste Twitch-Standardfarbe je Login). Sie ist kein Token,
  weil sie zur Laufzeit kommt; die Kontur sorgt für Lesbarkeit unabhängig
  von der Farbe.
- **Figur:** Haut (#f1c27d), Helm (#3a3f4b), Brille (#7fd3ff), Stiefel
  (#2a2a2a).
- **Gleiter:** Segel hell (#eef1f5), Schattenseite (#b9c0cc), Signalstreifen
  (#ff5a36).
- **Theme `target`/`lava` – Landefläche:** flach liegende Zielscheibe in Rot
  (#d7263d) und Weiß (#f5f5f5), dunklerer Rand (#8c1c2b) als Kante.
- **Theme `target` – Wasser:** Blau (#1e6fd9) mit hellen Wellenkämmen
  (#5fb3ff).
- **Theme `lava` – Lava:** Orange (#ff5a1f), Glut (#ffc23d), dunkle Kruste
  (#5a1a0b).

Die Grafikfarben (Figur, Gleiter, Flächen) sind keine Textfarben; sie stehen
deshalb nur als `backgroundColor` in Komponenten und werden nicht gegen
Textkontrast geprüft.

## Typography

Systemschrift (`system-ui`) in Schwarz-Gewicht – keine Webfonts, also keine
externen Requests und nichts nachzuladen.

- **Name (26 px, 900, Versalien, leicht gesperrt):** über der Figur, in der
  Spielerfarbe mit 5 px dunkler Kontur (`paint-order: stroke`).
- **Prozentzahl (24 px, 900):** über dem Namen nach der Landung, weiß mit
  derselben Kontur, deutsches Format `98,96 %`.

## Layout

- Figur-Kasten 48 × 72, Gleiter 144 × 52 mittig darüber, Name 4 px über dem
  Gleiter (bzw. über der Figur, wenn kein Gleiter), Prozentzahl 4 px darüber.
- Emote statt Figur: 72 px hoch, Breite nach Seitenverhältnis.
- Landefläche `target`/`lava`: 260 × 60, steht auf dem unteren Rand und
  überdeckt die Todeszone.
- Todeszone `target`/`lava`: volle Breite, 80 hoch, Muster läuft langsam
  seitlich durch.
- `custom`: Landefläche 100 hoch, Todeszone 88 hoch, Breite jeweils nach
  Seitenverhältnis des Bildes; die Todeszone wird gekachelt.

## Elevation & Depth

Keine Schatten auf UI-Ebene. Tiefe entsteht nur in den Grafiken selbst:
Zielscheibe als flache Ellipse mit sichtbarer Kante, Wellen bzw. Krusten in
zwei Tönen. Reihenfolge von hinten nach vorn: Todeszone, Landefläche,
Figuren, Texte.

## Shapes

Pixel-Grafik mit `shape-rendering: crispEdges`, harte Kanten. Gleiter als
Delta-Flügel, Zielscheibe als Ellipse mit drei Ringen.

## Components

- **figure:** 10 × 15-Pixel-Raster, Helm mit Brille, Anzug in
  Spielerfarbe, Gürtel und Stiefel. Hängt mit beiden Armen an der Stange des
  Gleiters.
- **glider:** Delta-Flügel, helle Oberseite, Schattenseite, ein
  Signalstreifen.
- **nameLabel / scoreLabel:** siehe Typografie.
- **targetPad, waterZone, lavaZone:** siehe Farben und Layout.
- **customPad, customZone:** Bilder aus `land` bzw. `death`.

## Do's and Don'ts

- **Do:** Text immer mit dunkler Kontur – er muss auf jedem Stream lesbar
  sein.
- **Do:** Halbdurchsichtig (Deckkraft 0,5) heißt immer „nicht (mehr) im
  Rennen": tote Figuren und alle Gelandeten außer den Besten.
- **Don't:** Keine Hintergründe, Rahmen oder Panels – das Overlay ist bis auf
  das Spiel durchsichtig.
- **Don't:** Keine Grafiken, Sprites oder Namen aus anderen Overlay-Tools
  übernehmen.
- **Don't:** Keine Webfonts oder externen Bilder außer Emotes und den vom
  Streamer gesetzten `land`/`death`/Sound-URLs.
