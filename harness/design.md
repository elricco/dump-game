# Design-Richtlinie (DESIGN.md)

> Wird aus `AGENTS.md` per Lazy Loading geladen bei UI-Gestaltung (Layout,
> Farben, Typografie, Komponenten-Look).
>
> Grundsatz: **Design-Vorgaben sind Spezifikationen.** Ob sie von uns kommen,
> vom Kunden geliefert oder von einem Design-Tool generiert wurden – sie werden
> als `DESIGN.md` im Repo-Root festgehalten und gelten wie jede andere Spec.

## Das Format

`DESIGN.md` ist ein offener Standard von Google Labs (aus dem Design-Tool
**Stitch** heraus entwickelt, am 21.04.2026 open-sourced, Apache 2.0,
Status: **alpha**). Spec: https://github.com/google-labs-code/design.md

Aufbau – zwei Schichten in einer Datei:

1. **YAML-Frontmatter** = maschinenlesbare **Design-Tokens** mit exakten
   Werten: `colors` (CSS-valide, auch `oklch()`), `typography` (fontFamily,
   fontSize, fontWeight, lineHeight, …), `spacing`, `rounded`, `components`
   (benannte Gruppen, die Tokens auf Komponenten mappen).
   Querverweise per `{path.to.token}`. Kompatibel zum W3C Design Token
   Format (DTCG).
2. **Markdown-Prosa** = das **Warum** und die Anwendung. Kanonische
   Sektionsreihenfolge: Overview, Colors, Typography, Layout,
   Elevation & Depth, Shapes, Components, Do's and Don'ts.

Herkunft ist egal: von Hand geschrieben, aus Stitch generiert, vom Kunden
geliefert oder Community-Vorlage – sobald sie im Repo liegt, ist sie die
Wahrheit für alles Visuelle.

## Regeln für den Agenten

- **Tokens sind verbindlich.** Farben, Abstände, Radien, Schriften kommen aus
  der `DESIGN.md` – niemals frei erfinden oder "ungefähr passende" Werte
  hartcodieren. Die Prosa entscheidet, *welches* Token wofür gedacht ist.
- **Keine UI ohne Design-Spec.** Fehlt eine `DESIGN.md`, nicht drauflos
  gestalten (Lektion aus dem hero-backgrounds-Pilot: ohne Design-Vorgabe wird
  die Übersichtsseite beliebig). Stattdessen: minimale `DESIGN.md` anlegen
  (aus vorhandenen Vorgaben ableiten oder beim Nutzer erfragen) und bestätigen
  lassen – dann erst bauen.
- **Spec-Sync gilt auch hier:** Design-Änderung → zuerst `DESIGN.md`
  aktualisieren, dann Code (siehe [`spec-driven.md`](spec-driven.md)).
- **Nicht duplizieren, exportieren:** `tokens.json` (DTCG) oder
  Tailwind-Config per CLI aus der `DESIGN.md` generieren – Tokens nie von Hand
  in CSS/Config nachbauen (ein Ort der Wahrheit).
- **WCAG schlägt DESIGN.md:** Verstößt ein geliefertes Design gegen die
  Kontrastgrenzen aus [`accessibility.md`](accessibility.md), den Konflikt
  melden statt blind umsetzen.

## Deterministische Prüfung

Das CLI (`@google/design.md`, npm) macht Design-Vorgaben prüfbar – passt
exakt in unsere Verifikations-Schicht:

```bash
npx @google/design.md lint DESIGN.md    # Struktur, kaputte {token}-Referenzen,
                                        # verwaiste Tokens, KONTRAST-Checks
npx @google/design.md diff a.md b.md    # Token-Änderungen zwischen Versionen
npx @google/design.md export --tailwind # Tailwind-Config / DTCG-tokens.json
```

- `lint` läuft nach jeder Änderung an `DESIGN.md` (siehe
  [`verification-tools.md`](verification-tools.md)).
- **Alpha-Status beachten:** CLI-Version exakt pinnen (Lektion
  "lokal grün, CI rot"); Breaking Changes der Spec einkalkulieren.

## Vom gelieferten Design zur Umsetzung (Prozess)

Gelernt bei der ersten Umsetzung eines Claude-Design-Exports in ein
Astro-Projekt (tim-filler-astro, 2026-10). Gilt sinngemäß für jedes
Design-Tool, das HTML-Mockups plus Token-Tabelle liefert.

### 1. Export sichten, bevor gebaut wird

- **Was ist Quelle, was Beiwerk?** Ein Claude-Design-Export enthält die
  Seiten-Mockups (`*.dc.html`, Inline-Styles plus etwas Render-Logik), eine
  Token-CSS (`css/site.css`), eine Token-Tabelle (`Design-Tokens.md`),
  Assets, Fonts, Screenshots – und unter Umständen einen `_ds/`-Ordner mit
  einem **älteren, abweichenden Design-System** (im Pilot: andere Farben,
  andere Schriften, andere Ansprache). Maßgeblich ist, was die Mockups
  tatsächlich einbinden; den Rest gegenprüfen statt blind übernehmen.
- **Export-Ordner nicht versionieren und aus den Tools nehmen:** in die
  `.gitignore` **und** aus `tsconfig.json` (`exclude`), ESLint (`ignores`)
  und `.prettierignore`. Sonst prüft `astro check` das Export-JS mit – im
  Pilot gab das einen `Duplicate identifier`, weil ein Export-Skript dieselbe
  Klasse global deklarierte wie der Port.
- **Platzhalter-Inhalte erkennen:** Mockups enthalten plausible, aber
  erfundene Texte (Projekte, Kennzahlen, Adressen, Verfügbarkeiten). Beim
  Übernehmen sofort eine Livegang-Liste anlegen und die Seite bis dahin auf
  `noindex` stellen.

### 2. Tokens in die DESIGN.md überführen

- **Zwei Farbmodi, ein Token-Name.** Das Format kennt keine Modi. Bewährt:
  der primäre Modus trägt die fixierten Namen (`colors.bg`), der zweite
  denselben Namen mit Suffix (`colors.bgLight`). Im CSS gibt es pro Rolle
  **eine** Custom Property (`--colors-bg`), deren Wert je Modus aus dem einen
  oder anderen Token kommt – die Komponenten referenzieren nie den Suffix.
- **Kontrast in beiden Modi prüfbar machen:** Der Linter prüft nur
  Komponenten-Paare (`backgroundColor` + `textColor`). Deshalb jedes
  Text-Paar doppelt anlegen (`page`/`pageLight`, `link`/`linkLight`, …).
- **Dekorative Farben nicht als Textpaar führen.** Der Linter misst jede
  `textColor` gegen 4.5:1 – Trennlinien, Feldrahmen (3:1 reicht), Logo-Gold
  erzeugen sonst Fehlwarnungen. Lässt man sie ganz weg, meldet er sie als
  „verwaist". Lösung: als Komponente **nur mit `backgroundColor`** (plus
  `width`/`height`/`size`) referenzieren, z. B. `divider`, `fieldOutline`,
  `signet`. Die Prosa erklärt, warum hier kein Textkontrast gilt.
- Ziel: `lint` mit **0 Fehlern und 0 Warnungen**, damit neue Warnungen später
  auffallen.

### 3. Mockup-Code in Projekt-Code übersetzen

- **Inline-`style`-Attribute in Klassen übersetzen.** Eine strikte CSP
  (`style-src 'self'`, siehe [`security.md`](security.md)) blockiert
  `style="…"` im Markup. Setzen per JavaScript über das CSSOM
  (`el.style.x = …`) ist davon nicht betroffen.
- **Breakpoint-Logik aus JS in Media Queries:** Mockups schalten Layouts oft
  per `window.innerWidth` um. Im Projekt per CSS lösen; Interaktion
  (Menü, Filter, Theme-Toggle) als Progressive Enhancement – ohne JS bleibt
  alles sichtbar und bedienbar (`.js`-Klasse am `<html>`, gesetzt von einem
  kleinen blockierenden Skript im `<head>`).
- **Fremdbilder ersetzen** (Unsplash & Co. sind externe Requests): lokale,
  als Platzhalter erkennbare Flächen mit `role="img"` und Beschreibung.
- **Fonts als woff2-Subset:** Exporte liefern oft volle TTF-Variablefonts.
  `pyftsubset … --flavor=woff2 --layout-features='*'` mit Latin-Bereich
  (im Pilot 2 MB → 126 KB), lokal ausliefern, `font-display: swap`.
- **Animationen:** nur Opacity/Transform, Startzustand nur mit JS **und**
  `prefers-reduced-motion: no-preference` verstecken – sonst bleibt Inhalt
  bei reduzierter Bewegung oder ohne JS unsichtbar.

### 4. Gegen das Mockup prüfen

- Nach dem Bau jede Seite im Browser mit dem Mockup vergleichen – beide
  Farbmodi, mindestens Desktop und Mobil. Wie man Layout dabei **misst**
  statt nur ansieht: [`verification-tools.md`](verification-tools.md),
  „UI-Verifikation im Browser".
