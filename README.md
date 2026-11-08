# dump-game

Jump-&-Bump-Spiel für Twitch als OBS-Browser-Source: Zuschauer tippen `!jump`
in den Chat, eine Figur oder ihr Emote (Twitch, 7TV, BTTV, FrankerFaceZ) fällt
ins Bild und soll das Ziel treffen.

Status: Arbeitspaket 1 (Grundgerüst und Config) in Arbeit.

## Planungsdokumente

Specs und Pläne liegen auf dem separaten Branch `planning`, der nie in `main`
gemergt wird. Lokal ist er als Ordner `planning/` eingebunden (von `main`
ignoriert):

```bash
git fetch origin planning:planning     # nach frischem Clone, falls gepusht
git worktree add planning planning     # als ./planning einbinden
```

Änderungen daran in `planning/` committen (`git push origin planning`).

Arbeitsweise für KI-Agenten: [`AGENTS.md`](AGENTS.md) (Harness v2.10.0).
