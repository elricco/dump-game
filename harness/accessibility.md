# Barrierefreiheits-Richtlinie (WCAG)

> Wird aus `AGENTS.md` per Lazy Loading geladen bei jeder Arbeit an UI, Templates,
> Komponenten oder Frontend-Markup.
>
> **Verbindliches Ziel: WCAG 2.2, Konformitätsstufe AA.** In Deutschland ist das
> über das **BFSG** (Barrierefreiheitsstärkungsgesetz, in Kraft seit 28.06.2025)
> für viele B2C-Websites/Shops gesetzliche Pflicht (EN 301 549 verweist auf WCAG).
> Barrierefreiheit ist kein Feature, sondern Grundanforderung – wie Security.

## Grundregeln (alle Stacks)

- **Semantisches HTML zuerst** (Core-First-Analogie): natives Element vor
  ARIA-Konstrukt. `<button>` statt `<div onclick>`, `<nav>`, `<main>`, `<label>`.
  **"Kein ARIA ist besser als falsches ARIA"** – ARIA nur, wenn HTML nichts bietet.
- **Tastatur-Bedienbarkeit:** Alles Interaktive ist per Tab erreichbar und per
  Enter/Space bedienbar. Sinnvolle Fokus-Reihenfolge, **kein** `tabindex > 0`,
  keine Tastaturfallen.
- **Fokus sichtbar:** `:focus-visible`-Stil niemals entfernen ohne gleichwertigen
  Ersatz (Kontrast ≥ 3:1 zur Umgebung).
- **Kontrast:** Text ≥ 4,5:1 (großer Text ≥ 3:1), UI-Komponenten/Grafiken ≥ 3:1.
- **Keine Information nur über Farbe** (z. B. Fehler zusätzlich mit Text/Icon).
- **Alternativtexte:** Jedes informative Bild hat ein sprechendes `alt`;
  dekorative Bilder `alt=""`. Icons mit Funktion brauchen einen zugänglichen Namen.
- **Formulare:** Jedes Feld hat ein programmatisch verknüpftes `<label>`.
  Fehlermeldungen als Text beim Feld (`aria-describedby`), nicht nur farbig.
  Autocomplete-Attribute für persönliche Daten.
- **Struktur:** Genau eine `<h1>`, Überschriften-Hierarchie ohne Sprünge,
  aussagekräftiger `<title>` pro Seite, `lang`-Attribut am `<html>`.
- **Skip-Link** zum Hauptinhalt als erstes fokussierbares Element.
- **Zoom/Reflow:** Bei 200 % Zoom bzw. 320 px Breite bleibt alles nutzbar –
  kein horizontales Scrollen für Fließtext, keine festen Pixelhöhen für Text.
- **Zielgrößen** (WCAG 2.2): Klick-/Touchziele mindestens 24×24 px.
- **Bewegung:** Animationen respektieren `prefers-reduced-motion`; nichts blinkt
  häufiger als 3×/Sekunde; Auto-Play vermeiden bzw. pausierbar machen.
- **Sprechende Links:** Linktext beschreibt das Ziel ("Preisliste herunterladen",
  nicht "hier klicken").

## JS / TS / Vue

- **Linting:** `eslint-plugin-vuejs-accessibility` ist Teil der ESLint-Config –
  Verstöße sind Errors, keine Warnings.
- **Fokus-Management:** Bei Routenwechsel Fokus auf die neue Überschrift/den
  Hauptinhalt setzen; Modals fangen den Fokus (Focus Trap) und geben ihn beim
  Schließen an den Auslöser zurück (`<dialog>` bevorzugen – Core-First).
- **Dynamische Inhalte:** Statusmeldungen (Toast, Ladezustand, Validierung) über
  Live-Regions (`aria-live="polite"` bzw. `role="status"`/`role="alert"`)
  ankündigen.
- **shadcn-vue/Reka UI** bringen Tastatur- und ARIA-Verhalten mit – Bausteine
  nutzen statt eigene Dropdowns/Dialoge zu bauen (Core-First). Eigenbau nur mit
  vollständigem ARIA-Pattern (WAI-ARIA Authoring Practices).
- **TDD:** Komponenten-Tests prüfen Verhalten inkl. Zugänglichkeit – Queries aus
  Testing Library nach Rolle/Label (`getByRole`, `getByLabelText`) statt nach
  CSS-Klassen; so schlagen Tests fehl, wenn Semantik fehlt.

## PHP / REDAXO & WordPress (Templates)

- Templates/Fragmente (REDAXO) bzw. Themes (WP) liefern die semantische Struktur:
  Landmarks (`header/nav/main/footer`), Überschriften-Hierarchie, Skip-Link.
- **Alt-Texte sind Redaktionspflicht:** Medienfelder für Alternativtext anlegen
  (REDAXO: Metainfo am Medium; WP: Medien-Alt-Feld) und in der Ausgabe verwenden –
  Ausgabe ohne `alt`-Attribut gilt als Fehler.
- Formular-Generatoren (yform, CF7 etc.) so konfigurieren, dass Labels und
  Fehlerausgaben zugänglich sind – generierte Ausgabe einmal mit axe/pa11y prüfen.

## Prüfung (zweistufig)

**Automatisiert (deterministisch)** – findet erfahrungsgemäß nur ca. 30–50 % der
WCAG-Verstöße, ist aber Pflicht als Regressionsnetz:

- **axe-core** in Komponenten-/E2E-Tests (`vitest-axe`, `@axe-core/playwright`):
  keine Violations erlaubt.
- **pa11y-ci** gegen gerenderte Seiten (funktioniert für REDAXO, WP und SPAs
  gleichermaßen) – Config-Vorlage: [`../configs/a11y/.pa11yci`](../configs/a11y/.pa11yci).
- **Lighthouse** (Kategorie Accessibility) als Smoke-Check.
- **ESLint-A11y-Plugin** (Vue) im normalen Lint-Lauf.

Aufrufe in [`verification-tools.md`](verification-tools.md).

**Manuell (pro Feature vor "fertig")** – deckt ab, was Tools nicht sehen:

1. Komplette Bedienung **nur mit Tastatur** durchspielen (inkl. Fokus sichtbar?).
2. Kurzer **Screenreader-Smoke-Test** (macOS: VoiceOver, `Cmd+F5`) – werden
   Zweck und Zustand der Elemente vorgelesen?
3. Zoom auf 200 % – bleibt alles lesbar und bedienbar?
4. Kontraste neuer Farben gegen die Grenzwerte geprüft (z. B. WebAIM Contrast
   Checker)?

Ein Feature ist erst fertig, wenn automatisierte Checks grün sind **und** die
manuelle Kurzprüfung bestanden ist.
