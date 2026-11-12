# DUMP Game

Jump-&-Bump-Spiel für Twitch als OBS-Browser-Source im 16-Bit-Look:
Zuschauer tippen `!jump` oder `!bump` in den Chat, ihre Pixel-Figur – oder ihr
Emote (Twitch, 7TV, BTTV, FrankerFaceZ) – gleitet bzw. fällt ins Bild und soll
mittig auf der Landefläche landen.

- **`!jump`:** am Hängegleiter über den ganzen Bildschirm, Gleiter prallen
  voneinander ab.
- **`!bump`:** wie Pachinko durch ein Feld aus Stiften.
- Landung: 0 % (Rand) bis 100 % (Mitte); Todeszone: Wasser, Lava oder eigene
  Bilder. Optional Highscores oben rechts.

## Einrichten

1. **Config-Seite öffnen:** `config.html` (auf GitHub Pages:
   `https://<name>.github.io/dump-game/config.html`).
2. Twitch-Kanal eintragen, Einstellungen wählen – die Vorschau zeigt das
   Ergebnis sofort.
3. **URL kopieren** und in OBS als **Browser-Source** einfügen, Größe
   1920 × 1080 (oder 2560 × 1440). Der Hintergrund ist transparent.

Eine bestehende Overlay-URL lässt sich auf der Config-Seite einlesen und
nachjustieren. Zum Ausprobieren ohne Chat gibt es `demo.html` (mit Knöpfen zum
Anhören der Klänge).

**Datenschutz:** Das Overlay liest den Chat anonym (ohne Login/Token) und lädt
Emotes von Twitch, 7TV, BTTV und FrankerFaceZ sowie die selbst eingetragenen
Bild- und Sound-URLs. Highscores (falls aktiviert) liegen nur im Speicher der
Browser-Source.

## Chat-Befehle

| Befehl          | Wer (Standard)     | Wirkung                   |
| --------------- | ------------------ | ------------------------- |
| `!jump [Emote]` | Mods (einstellbar) | Gleiter-Figur bzw. Emote  |
| `!bump [Emote]` | Mods (einstellbar) | Pachinko-Figur bzw. Emote |
| `!resetgame`    | Mods (einstellbar) | Runde zurücksetzen        |
| `!resetscores`  | nur Broadcaster    | Highscores leeren         |

Jede Person spielt einmal pro Runde; nach 30 s ohne Sprung wird automatisch
zurückgesetzt. Befehlsnamen und Rechte sind auf der Config-Seite einstellbar.

Hat der Kanal ein Emote, das genau `!jump` heißt, fällt bei `!jump !jump` nur
dieses Emote – ohne Gleiter.

## Entwicklung

```bash
pnpm install
pnpm dev          # http://localhost:5173/config.html, /demo.html, /?channel=…
pnpm test         # Vitest
pnpm lint         # Design-Tokens aktuell? ESLint, Prettier, tsc
pnpm depcruise    # Schichten render → adapters → core
pnpm design:lint  # DESIGN.md prüfen
pnpm build        # dist/ für GitHub Pages
```

Visuelle Vorgaben: [`DESIGN.md`](DESIGN.md) (daraus erzeugt:
`src/generated/design-tokens.ts`, `pnpm design:tokens`). Arbeitsweise für
KI-Agenten: [`AGENTS.md`](AGENTS.md) (Harness v2.10.0).

Schrift: Press Start 2P (SIL Open Font License 1.1, siehe
`src/assets/fonts/PressStart2P-OFL.txt`).

## Planungsdokumente

Specs und Pläne liegen auf dem separaten Branch `planning`, der nie in `main`
gemergt wird. Lokal ist er als Ordner `planning/` eingebunden (von `main`
ignoriert):

```bash
git fetch origin planning:planning     # nach frischem Clone, falls gepusht
git worktree add planning planning     # als ./planning einbinden
```

Änderungen daran in `planning/` committen (`git push origin planning`).
