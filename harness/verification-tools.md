# Verifikations-Tools

> Deterministische, statische Analyse statt zweitem (nicht-deterministischem)
> Agenten. Wird aus `AGENTS.md` nach jeder Code-Änderung ausgeführt.
>
> David Tielkes .NET-Setup: ReSharper (Code) + NDepend (Architektur). Unser
> Web-Stack-Äquivalent unten.

## Mapping je Stack

| Zweck            | PHP / REDAXO                         | JS/TS / Vue                  | WordPress             |
| ---------------- | ------------------------------------ | ---------------------------- | --------------------- |
| Code-Stil        | PHP-CS-Fixer (`@Symfony`, PSR-12)    | Prettier                     | PHPCS (WPCS)          |
| Statik/Typen     | PHPStan (hohes Level)                | ESLint, `tsc --noEmit`       | PHPStan + WP-Stubs    |
| Architektur      | Deptrac (Domain ⊥ rex_*)             | dependency-cruiser           | Deptrac               |
| Security         | Psalm (taint), Composer audit        | `npm audit`, eslint-security | WPScan-Regeln         |
| Secrets          | **gitleaks** (alle Stacks, Repo + Staging)                                                          |||
| Design           | **`@google/design.md lint`** (alle Stacks mit UI: Tokens, Referenzen, Kontrast)                     |||
| Barrierefreiheit | pa11y-ci / Lighthouse (gerenderte Seiten) | eslint-plugin-vuejs-accessibility, axe-core (vitest/Playwright), pa11y-ci | pa11y-ci / Lighthouse |
| Datenschutz      | Externe-Hosts-Scan, PII-Log-Scan     | Externe-Hosts-Scan im Bundle | Externe-Hosts-Scan    |
| Tests (TDD)      | PHPUnit                              | Vitest / Playwright          | PHPUnit + WP-Test-Lib |

## Kopierfertige Configs

Vorlagen für alle Tools liegen unter [`../configs/`](../configs/) (PHP, JS, WordPress)
– in den Repo-Root kopieren und Pfade/Namespaces anpassen. Siehe
[`../configs/README.md`](../configs/README.md).

## Konkrete Aufrufe (pro Projekt füllen/verifizieren)

### PHP / REDAXO
```bash
# TODO: an Projekt anpassen
vendor/bin/phpunit                                   # Tests zuerst (TDD)
vendor/bin/php-cs-fixer fix --dry-run --diff         # Stil (@Symfony-Ruleset)
vendor/bin/phpstan analyse --memory-limit=512M       # Statik/Typen
vendor/bin/deptrac analyse                           # Architektur-Schichten
composer audit                                       # bekannte CVEs
```

- **PHP-CS-Fixer:** `.php-cs-fixer.dist.php` mit `@Symfony` + `@PSR12`.
- **PHPStan:** Level schrittweise anheben; Ziel möglichst hoch.
  - **In REDAXO-Addons idiomatisch über `rexstan`** statt rohem `phpstan.neon`:
    `php redaxo/bin/console rexstan:analyze`. rexstan bringt REDAXO-Stubs mit und
    verwaltet die Baseline. Die generische `phpstan.neon.dist` nur für Nicht-REDAXO-
    PHP nutzen.
- **Deptrac:** Regel erzwingt, dass `Domain` **nicht** von der Redaxo-/rex_*-Schicht
  abhängt (siehe [`architecture.md`](architecture.md)).

### JS / TS / Vue
```bash
# TODO: an Projekt anpassen
pnpm test                 # Vitest (TDD)
pnpm eslint .
pnpm prettier --check .
pnpm tsc --noEmit
pnpm depcruise src
npm audit
```

### WordPress
```bash
# TODO: an Projekt anpassen
vendor/bin/phpunit
vendor/bin/phpcs --standard=WordPress
vendor/bin/phpstan analyse   # mit szepeviktor/phpstan-wordpress
```

### Barrierefreiheit (alle Stacks mit UI)
```bash
# TODO: URLs/Setup an Projekt anpassen (lokale Instanz muss laufen)
pnpm exec puppeteer browsers install chrome   # siehe Chrome-in-CI-Hinweis unten
pnpm pa11y-ci                # gegen gerenderte Seiten, WCAG 2.2 AA (.pa11yci)
npx @lhci/cli autorun        # Accessibility-/SEO-Score als Gate (lighthouserc.json)
```

- **pa11y-ci** prüft gerenderte Seiten – funktioniert für REDAXO, WordPress und
  SPAs gleich. Config-Vorlage: [`../configs/a11y/.pa11yci`](../configs/a11y/.pa11yci).
- **Lighthouse CI**: Config-Vorlage
  [`../configs/a11y/lighthouserc.json`](../configs/a11y/lighthouserc.json).
- **Chrome in CI:** beide Tools brauchen ein echtes Chrome – "Could not find
  Chrome" (Puppeteer-Download übersprungen) und "No usable sandbox!" (GitHub-
  Actions-Runner ohne unprivilegierte User-Namespaces) sind reale, in einer
  echten CI aufgetretene Fallstricke, keine Theorie. Details und Fix in
  [`../configs/README.md`](../configs/README.md#barrierefreiheit-a11y--stack-übergreifend).
- **axe-core** läuft zusätzlich in Komponenten-/E2E-Tests (`vitest-axe`,
  `@axe-core/playwright`) – damit ist A11y Teil des normalen TDD-Laufs.
- Automatisierte Checks finden nur ~30–50 % der Verstöße → manuelle Kurzprüfung
  aus [`accessibility.md`](accessibility.md) bleibt Pflicht.

### Datenschutz (alle Stacks)
```bash
# Externe-Hosts-Scan: ungewollte Dritt-Requests im Quelltext/Build finden.
# TODO: Pfade anpassen; Treffer sind nur ok, wenn consent-gated (privacy.md).
grep -rniE 'fonts\.(googleapis|gstatic)|unpkg\.com|jsdelivr|cdnjs|youtube\.com/embed|maps\.googleapis|google-analytics|googletagmanager|connect\.facebook' \
  src/ lib/ templates/ --include='*.{php,js,ts,vue,html,twig}'

# PII-Log-Scan: E-Mail-Adressen/IPs in Log-Aufrufen aufspüren.
grep -rniE '(logger|rex_logger|error_log|console\.(log|error)).*(\$email|\$ip|e-?mail)' src/ lib/
```

### Design (alle Stacks mit UI)
```bash
npx @google/design.md lint DESIGN.md    # nach jeder Aenderung an DESIGN.md
```

- Prüft Struktur, kaputte `{token}`-Referenzen, verwaiste Tokens und
  Kontrast-Verhältnisse (siehe [`design.md`](design.md)). CLI-Version pinnen
  (Spec ist alpha).

### Secrets (alle Stacks)
```bash
gitleaks git .                  # kompletter Repo-Scan inkl. Historie
gitleaks protect --staged       # vor jedem Commit: nur gestagte Änderungen
```

- **Installation:** `brew install gitleaks` (macOS) bzw. GitHub Action
  `gitleaks/gitleaks-action` in der CI.
- Fund im Repo = Secret **rotieren**, nicht nur entfernen (Historie, siehe
  [`security.md`](security.md)).
- Zusätzlich im GitHub-Repo **Push Protection / Secret Scanning** aktivieren
  (Settings → Code security).
- **Ohne lokale Installation** (Docker, gepinnte Version statt `latest`):
  `docker run --rm -v "$PWD:/repo" ghcr.io/gitleaks/gitleaks:<version> detect --source /repo --redact --no-banner`.
- **Fehlalarme in Test-Fixtures** (z. B. `SECRET = '0123456789abcdef…'`) nicht
  ignorieren, sondern in `.gitleaks.toml` eng ausnehmen. Achtung: In einem
  `[allowlist]` werden `paths` und `regexes` mit **ODER** verknuepft, ein
  `paths`-Eintrag nimmt die ganze Datei aus dem Scan. Besser nur `regexes`
  (oder `[[allowlists]]` mit `condition = "AND"`).
- **Erkennung beweisen:** Nach jeder Allowlist-Aenderung einen Wegwerf-Ordner mit
  realistischen Mustern scannen (Stripe `sk_live_…`, GitHub `ghp_…`, RSA-Block).
  Offensichtlich erfundene Werte (`…EXAMPLE…`) erkennt gitleaks absichtlich
  nicht, ein Negativtest damit sagt nichts.
- Hilfsskripte mit `git add -A` committen auch Caches (`.deptrac.cache`):
  vorher `.gitignore` pruefen.

## UI-Verifikation im Browser (Agent)

Statische Analysen und pa11y sagen nichts darüber, ob ein Layout seinen
**Zweck** erfüllt. Gelernt in tim-filler-astro (2026-10), wo eine
Footer-Änderung als „erledigt" gemeldet wurde, obwohl sie das eigentliche
Ziel verfehlte:

- **Gegen das Ziel messen, nicht gegen die Position.** „Unter den Links"
  war erfüllt, „schließt die Lücke neben dem Newsletter" nicht. Das Ziel der
  Anfrage in eine messbare Bedingung übersetzen (z. B. Unterkante Element ==
  Unterkante Nachbarspalte, Breite == Breite der Spalten darüber) und per
  `getBoundingClientRect()` prüfen.
- **Mehrere Breiten, nicht eine.** Das Agent-Browserfenster lässt sich nicht
  immer verkleinern und ist oft breiter als typische Screens. Stattdessen
  same-origin-`<iframe>`s mit fester Breite (z. B. 700/950/1180/1440/1680 px)
  in die Seite hängen und darin messen. Cross-Origin-iframes (anderer Port)
  liefern `contentDocument === null` – von einer Seite derselben Origin aus
  messen.
- **Hintergrund-Tabs sind gedrosselt.** Automatisierte Tabs laufen oft mit
  `document.visibilityState === "hidden"`: Animationen, Transitions und
  IntersectionObserver pausieren. Folge: halb eingeblendete Inhalte,
  „hängende" Farbübergänge, leere oder gekachelte Screenshots – **kein Bug
  der Seite**. Vor einer Fehlersuche `visibilityState` prüfen; Zustände per
  JS auslesen; Screenshots erst nach einem echten Scroll.
- **Verdacht per A/B isolieren.** Beispiel CSP: dieselbe Build-Ausgabe einmal
  mit, einmal ohne Header ausliefern (kleiner lokaler Server) und vergleichen,
  statt aus einem Symptom auf die Ursache zu schließen.
- **pa11y prüft nur, was es sieht – und nur einen Farbmodus.** Ohne
  festen Modus entscheidet das OS (lokal dunkel, CI hell). Per Animation
  ausgeblendete Inhalte (`opacity: 0`) werden übersprungen. Beides per
  Chrome-Flag festlegen statt per Theme-Toggle-Klick (der misst mitten in
  Transitions) – Details und Flags: [`../configs/README.md`](../configs/README.md).
  Transparente Header über Hero-Bildern meldet pa11y als Kontrastfehler,
  weil es das Bild dahinter nicht sieht – im Browser nachsehen, dann per
  `hideElements` mit Begründung ausnehmen statt die Farben zu „reparieren".
- **Bei CI-Befunden erst die Belege holen, dann fixen.** Logs nennen oft
  nur die fehlgeschlagene Prüfung, nicht das betroffene Element. Bericht/
  Artefakt herunterladen und das konkrete Element nachlesen, statt es aus
  Seitenstruktur oder Code abzuleiten – eine plausible Vermutung, die lokal
  nicht nachstellbar ist, ist kein Beleg.
- **Vor lokalen Prüfläufen Ports freimachen.** Ein noch laufender
  Preview-Server eines anderen Projekts wird von `start-server-and-test`
  stillschweigend mitbenutzt – geprüft wird dann die falsche Seite.

## Regeln

- **Tests laufen zuerst** (grün), dann Stil/Statik/Architektur.
- Nur **geänderte** Dateien prüfen, wenn möglich (schneller).
- Befunde beheben, bevor eine Aufgabe als erledigt gilt.
- **Aufrufe als Package-Scripts kapseln** (`pnpm test`/`pnpm lint`/`pnpm a11y`
  bzw. `composer test`): ein kanonischer Einstieg für Agent, CI und Mensch –
  bewährt im hero-backgrounds-Pilot.
- Config-Dateien dürfen statt im Repo-Root auch gesammelt in `configs/` liegen,
  wenn die Scripts sie explizit referenzieren (`--config configs/…`) – hält
  den Root schlank.
