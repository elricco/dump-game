---
version: alpha
name: DUMP Game
description: Overlay-Spiel für Twitch im 16-Bit-Look – Pixel-Figuren am Hängegleiter über dem Stream, Landefläche und Todeszone am unteren Rand.
colors:
  primary: '#ffffff'
  outline: '#0e0e10'
  skin: '#f1c27d'
  skinShadow: '#c98f52'
  helmet: '#3a3f4b'
  helmetLight: '#626b80'
  helmetShadow: '#22252d'
  goggles: '#3fa9f5'
  gogglesGlint: '#d9f4ff'
  gloves: '#f2efe6'
  belt: '#1b1b1f'
  boots: '#2a2a2a'
  bootsLight: '#55555c'
  glider: '#eef1f5'
  gliderStripe: '#ff5a36'
  gliderShade: '#b9c0cc'
  targetRed: '#d7263d'
  targetWhite: '#f5f5f5'
  targetRim: '#8c1c2b'
  water: '#1e6fd9'
  waterLight: '#5fb3ff'
  waterDeep: '#14519f'
  lava: '#ff5a1f'
  lavaDeep: '#c7360d'
  lavaGlow: '#ffc23d'
  lavaCrust: '#5a1a0b'
  peg: '#aeb6c4'
  pegLight: '#f4f6fa'
  pegShadow: '#6b7383'
  pageBg: '#14161c'
  surface: '#1f222c'
  text: '#eef1f5'
  muted: '#b4bccb'
  danger: '#ff8a80'
  border: '#4a5060'
typography:
  name:
    fontFamily: Press Start 2P
    fontSize: 8px
    fontWeight: 400
    lineHeight: 1
    letterSpacing: 0px
  score:
    fontFamily: Press Start 2P
    fontSize: 8px
    fontWeight: 400
    lineHeight: 1
  configTitle:
    fontFamily: Press Start 2P
    fontSize: 24px
    fontWeight: 400
    lineHeight: 1.4
  configHeading:
    fontFamily: Press Start 2P
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.6
  configBody:
    fontFamily: system-ui
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  configLabel:
    fontFamily: system-ui
    fontSize: 15px
    fontWeight: 600
    lineHeight: 1.4
  configCode:
    fontFamily: ui-monospace
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
spacing:
  labelGap: 2px
  outlineWidth: 2px
  scoreboardInset: 16px
  configGap: 16px
  configSection: 24px
  configFocus: 3px
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
    width: 27px
    height: 36px
  figureSkinShadow:
    backgroundColor: '{colors.skinShadow}'
  figureHelmet:
    backgroundColor: '{colors.helmet}'
  figureHelmetLight:
    backgroundColor: '{colors.helmetLight}'
  figureHelmetShadow:
    backgroundColor: '{colors.helmetShadow}'
  figureGoggles:
    backgroundColor: '{colors.goggles}'
  figureGogglesGlint:
    backgroundColor: '{colors.gogglesGlint}'
  figureGloves:
    backgroundColor: '{colors.gloves}'
  figureBelt:
    backgroundColor: '{colors.belt}'
  figureBoots:
    backgroundColor: '{colors.boots}'
  figureBootsLight:
    backgroundColor: '{colors.bootsLight}'
  glider:
    backgroundColor: '{colors.glider}'
    width: 75px
    height: 27px
  gliderStripe:
    backgroundColor: '{colors.gliderStripe}'
  gliderShade:
    backgroundColor: '{colors.gliderShade}'
  emote:
    height: 36px
  targetPad:
    backgroundColor: '{colors.targetRed}'
    width: 201px
    height: 51px
  targetPadSurface:
    height: 19.5px
  targetPadRing:
    backgroundColor: '{colors.targetWhite}'
  targetPadRim:
    backgroundColor: '{colors.targetRim}'
  waterZone:
    backgroundColor: '{colors.water}'
    height: 60px
  waterZoneCrest:
    backgroundColor: '{colors.waterLight}'
  waterZoneDeep:
    backgroundColor: '{colors.waterDeep}'
  lavaZone:
    backgroundColor: '{colors.lava}'
    height: 60px
  lavaZoneDeep:
    backgroundColor: '{colors.lavaDeep}'
  lavaZoneGlow:
    backgroundColor: '{colors.lavaGlow}'
  lavaZoneCrust:
    backgroundColor: '{colors.lavaCrust}'
  customPad:
    height: 75px
  customZone:
    height: 66px
  peg:
    backgroundColor: '{colors.peg}'
    width: 18px
    height: 18px
  pegLight:
    backgroundColor: '{colors.pegLight}'
  pegShadow:
    backgroundColor: '{colors.pegShadow}'
  configPage:
    backgroundColor: '{colors.pageBg}'
    textColor: '{colors.text}'
    typography: '{typography.configBody}'
  configPanel:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
  configHelp:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.muted}'
  configError:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.danger}'
  configField:
    backgroundColor: '{colors.outline}'
    textColor: '{colors.text}'
  configButton:
    backgroundColor: '{colors.targetRed}'
    textColor: '{colors.primary}'
    typography: '{typography.configLabel}'
  configTitle:
    backgroundColor: '{colors.pageBg}'
    textColor: '{colors.gliderStripe}'
    typography: '{typography.configTitle}'
  configHeading:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.lavaGlow}'
    typography: '{typography.configHeading}'
  configCode:
    backgroundColor: '{colors.outline}'
    textColor: '{colors.waterLight}'
    typography: '{typography.configCode}'
  configFocus:
    backgroundColor: '{colors.lavaGlow}'
  configBorder:
    backgroundColor: '{colors.border}'
omitted:
  - section: rounded
    reason: 'Pixel-Grafik und Flächen – keine abgerundeten UI-Elemente.'
---

# DUMP Game

## Overview

Ein Spiel, das **über** dem Stream liegt, nicht ein Fenster im Stream. Alles
ist transparent bis auf die Figuren, die Landefläche und die Todeszone am
unteren Rand. Der Look ist **16 Bit**: Pixel-Grafik mit Schattierung in drei
Tönen (Licht von links oben), kleine Männchen im Fliegeranzug, ein heller
Hängegleiter mit Signalstreifen, gerasterte Zielscheibe, Wasser und Lava. Lesbarkeit auf **jedem** Stream-Hintergrund (hell,
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
- **Figur:** Haut (#f1c27d / Schatten #c98f52), Helm (#3a3f4b, Licht
  #626b80, Schatten #22252d), Brille (#3fa9f5 mit Glanz #d9f4ff),
  Handschuhe (#f2efe6), Gürtel (#1b1b1f), Stiefel (#2a2a2a, Licht #55555c).
- **Anzug-Schattierung:** aus der Spielerfarbe berechnet – Licht = 30 %
  Richtung Weiß, Schatten = 35 % Richtung Schwarz.
- **Gleiter:** Segel hell (#eef1f5), Schattenseite (#b9c0cc), Signalstreifen
  (#ff5a36).
- **Theme `target`/`lava` – Landefläche:** flach liegende Zielscheibe in Rot
  (#d7263d) und Weiß (#f5f5f5), dunklerer Rand (#8c1c2b) als Kante.
- **Theme `target` – Wasser:** Blau (#1e6fd9), Tiefe (#14519f), helle
  Wellenkämme und Glitzer (#5fb3ff).
- **Stifte (Bump):** Metallkugeln in Grau (#aeb6c4) mit Glanz (#f4f6fa)
  oben links und Schatten (#6b7383) unten rechts.
- **Theme `lava` – Lava:** Orange (#ff5a1f), Tiefe (#c7360d), Glut
  (#ffc23d), dunkle Kruste (#5a1a0b).

Die Grafikfarben (Figur, Gleiter, Flächen) sind keine Textfarben; sie stehen
deshalb nur als `backgroundColor` in Komponenten und werden nicht gegen
Textkontrast geprüft.

## Typography

**Press Start 2P** – Pixel-Schrift im Stil der 8/16-Bit-Ära (SIL Open Font
License 1.1, liegt lokal unter `src/assets/fonts/`, kein externer Request).
Größen nur in Vielfachen ihres 8-px-Rasters (8 px = Grundgröße). Zeichen, die die Schrift nicht
kennt (z. B. asiatische Anzeigenamen), fallen auf `system-ui` zurück.

- **Name (8 px, Versalien):** über der Figur, in der Spielerfarbe mit 2 px
  dunkler Kontur (`paint-order: stroke`). Steht bei allen Figuren, auch bei
  halbdurchsichtigen.
- **Prozentzahl (8 px):** über dem Namen nach der Landung, weiß mit
  derselben Kontur, deutsches Format `98,96 %`.

## Layout

- Figur-Kasten 27 × 36 (Raster 18 × 24 inkl. Kontur, 1,5 Referenz-px je
  Pixel), Gleiter 75 × 27 (Raster 50 × 18) mittig darüber, Name 2 px über dem
  Gleiter (bzw. über der Figur, wenn kein Gleiter), Prozentzahl 2 px darüber.
- Abstand zum Bildschirmrand richtet sich nach der Gleiterbreite (75) –
  Gleiter und Figur werden nie abgeschnitten.
- Emote statt Figur: 36 px hoch, Breite nach Seitenverhältnis.
- Landefläche `target`/`lava`: 201 × 51 (Raster 67 × 17, 3 Referenz-px je
  Pixel), steht auf dem unteren Rand und
  überdeckt die Todeszone.
- Todeszone `target`/`lava`: volle Breite, 60 hoch, Muster läuft langsam
  seitlich durch.
- `custom`: Landefläche 75 hoch, Todeszone 66 hoch, Breite jeweils nach
  Seitenverhältnis des Bildes; die Todeszone wird gekachelt.
- **Standhöhe (`targetPadSurface`; bei `custom` Parameter `land_surface`):** Gelandete Figuren stehen nicht auf der
  Bildoberkante, sondern auf der Oberseite der Fläche – bei der Zielscheibe
  19,5 px unter der Oberkante (Mitte der Ellipse). Bei `custom` per
  URL-Parameter `land_surface` als Anteil der Bildhöhe (Standard 0,4 –
  passt zu Tims Kommode).
- **Stifte (Bump):** 18 × 18 (Raster 12 × 12, 1,5 Referenz-px je Pixel),
  5 versetzte Reihen zwischen 25 % und 80 % der Höhe, Abstand nach
  Bühnenbreite; sichtbar ab dem ersten `!bump` einer Runde bis zum Reset.
  **Dezent:** Deckkraft 0,4 – sie sollen den Stream nicht dominieren.
- **Bump-Figur:** ohne Gleiter, taumelt (dreht sich) beim Fallen je nach
  Seitwärtsbewegung, steht nach der Landung gerade.
- **Landefläche und Todeszone** sind nur während einer Runde sichtbar: Sie
  blenden mit dem ersten `!jump`/`!bump` ein (400 ms) und mit dem Reset
  wieder aus. Ohne Runde ist das Overlay komplett leer.
- **Highscores:** oben rechts, 16 px vom Rand, rechtsbündig, Top 5 als
  `1. NAME 98,96 %` – Rang und Prozent weiß, Name in Spielerfarbe, alles in
  8 px Pixel-Schrift mit Kontur, ohne Panel. Sichtbar nur während einer
  Runde und nur mit Einträgen.
- **Tote** sinken bei Wasser/Lava bis zur Mitte der Zone, bei `custom` bis
  `death_surface` (Anteil der Bildhöhe, Standard 0,8 – passt zu Tims
  Schwertwall), und liegen hinter der Landefläche.
- **Nach der Landung** wird der Gleiter abgenommen: Die Figur steht gerade
  auf der Fläche.

- **Größenverhältnis (Tim, 2026-11-09):** Landefläche und Todeszone sind
  1,5-mal so groß wie die Figuren-Maßstäbe (entspricht `scale=1,5` nur für
  den Boden); `scale` vergrößert weiterhin alles gemeinsam.

## Elevation & Depth

Keine Schatten auf UI-Ebene. Tiefe entsteht nur in den Grafiken selbst:
Zielscheibe als flache Ellipse mit sichtbarer Kante, Wellen bzw. Krusten in
zwei Tönen. Reihenfolge von hinten nach vorn: Todeszone, Landefläche,
Figuren, Texte.

## Shapes

Pixel-Grafik mit `shape-rendering: crispEdges` bzw. `image-rendering:
pixelated`, harte Kanten, 1 Pixel dunkle Kontur um Figur und Gleiter.
Gleiter als Delta-Flügel in Seitenansicht (Nase in Flugrichtung),
Zielscheibe als gerasterte Ellipse mit fünf Ringen und sichtbarer Kante,
Wasser und Lava als kachelbare Pixel-Muster.

## Components

- **figure:** 16 × 22-Pixel-Raster, schaut nach rechts (Brillenglanz und
  Stiefelspitzen vorn), Helm mit Brille, schattierter Anzug in
  Spielerfarbe, Gürtel, Handschuhe, Stiefel. Hängt mit beiden Armen an der
  Stange des Gleiters.
- **glider:** Delta-Flügel in Seitenansicht, Nase vorn, helle Oberseite,
  Schattenseite, Signalstreifen an der Vorderkante, Steuerbügel.
- **Flugpose:** Figur und Gleiter neigen sich in Flugrichtung (je schneller
  seitwärts, desto stärker, höchstens 8°) und werden gespiegelt, wenn die
  Flugrichtung wechselt (Abprallen an der Wand). Senkrecht fallend: gerade,
  Blickrichtung bleibt. Name und Prozentzahl drehen nie mit.
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

## Config-Seite (`config.html`)

Werkzeug für den Streamer, nicht Overlay: Hier gelten die normalen Regeln für
Bedienoberflächen (WCAG 2.2 AA). Der Look zitiert das Spiel, ohne die
Lesbarkeit zu opfern.

- **Farben:** Seite dunkel (#14161c), Panels (#1f222c) mit 1 px Rahmen
  (#4a5060, dekorativ), Text hell (#eef1f5), Hilfetexte gedämpft (#b4bccb),
  Fehler/Hinweise (#ff8a80). Titel in Signal-Orange (#ff5a36), Gruppen-
  Überschriften in Glut-Gelb (#ffc23d), Ergebnis-URL in Wasser-Hell
  (#5fb3ff) auf Schwarz. Primärknopf Zielscheiben-Rot (#d7263d) mit weißer
  Schrift. Alle Textpaare stehen als Komponenten im Kopf und werden vom
  Linter auf Kontrast geprüft.
- **Typografie:** Titel (24 px) und Gruppen-Überschriften (12 px) in Press
  Start 2P, Versalien. Alles andere – Labels (15 px, 600), Felder und
  Fließtext (16 px), Hilfetexte – in `system-ui`; die URL in
  `ui-monospace` (14 px).
- **Layout:** ab 1100 px zwei Spalten – links das Formular, rechts mitlaufend
  (sticky) Vorschau (16:9) und Ergebnis; darunter einspaltig. Abstände 16 px
  im Panel, 24 px zwischen Gruppen, maximale Breite 1400 px.
- **Formen:** eckig wie Pixel-Grafik (keine Rundungen), Felder schwarz mit
  1 px Rahmen; Fokus immer als 3 px Glut-Gelb-Umrandung mit 2 px Abstand.
- **Do:** Jedes Feld mit sichtbarem Label, Hilfetext darunter.
- **Don't:** Keine Pixel-Schrift für Labels, Hilfetexte oder Eingaben.
