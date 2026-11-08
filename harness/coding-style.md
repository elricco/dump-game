# Coding-Richtlinie

> Wird aus `AGENTS.md` per Lazy Loading geladen, bevor Code geschrieben/geändert
> wird.

## Grundhaltung (alle Stacks)

- **KISS:** Schreibe Code für Menschen. Klar > clever. Wenn eine Zeile erklärt
  werden muss, ist meist die Zeile das Problem.
- **YAGNI:** Der beste Code ist der, der nicht geschrieben werden musste. Keine
  Features, Parameter oder Abstraktionen "auf Vorrat".
- **Sprechende Namen:** Funktionen/Variablen benennen nach *was* sie tun/sind,
  nicht *wie*.
- **Kleine Einheiten:** Eine Funktion, ein Zweck. Frühe Returns statt tiefer
  Verschachtelung.
- **Kommentare erklären das Warum**, nicht das Was (das steht im Code).
- **Keine toten Pfade:** kein auskommentierter Code, keine ungenutzten Parameter.

## PHP / REDAXO

- **PSR-12** als Basis, durchgesetzt via PHP-CS-Fixer mit **`@Symfony`**-Ruleset.
- **`declare(strict_types=1);`** in jeder Datei. Vollständige Typdeklarationen
  (Parameter, Rückgabe, Properties).
- **Namespaces Pflicht** (PSR-4, siehe [`architecture.md`](architecture.md)). Kein
  neuer `rex_*`-Dateiname-Autoloader-Code.
- **Core-First:** erst `rex_sql`, `rex_config`, `rex_extension`, `rex_fragment`,
  `rex_i18n`, `rex::getTable()` usw. prüfen, bevor Eigenes entsteht.
- **Kein Raw-SQL** – immer `rex_sql` mit Prepared Statements (siehe
  [`security.md`](security.md)).
- **Symfony-Komponenten** nutzen, wo REDAXO sie mitbringt (Console, VarDumper).
- Statische Analyse: **PHPStan** (hohes Level anstreben) muss sauber sein.

```php
<?php

declare(strict_types=1);

namespace Elricco\MeinAddon\Domain;

final class Preisrechner
{
    public function brutto(int $nettoCent, float $satz): int
    {
        return (int) round($nettoCent * (1 + $satz));
    }
}
```

## JS / TS / Vue

**TypeScript**

- **Strict mode** (`"strict": true`), kein implizites `any`. Fehler sind Compile-,
  nicht Laufzeitfehler.
- **Typinferenz nutzen** – nicht überall redundant annotieren. Typen dort, wo sie
  Verträge klären (Funktionssignaturen, öffentliche APIs).
- **Discriminated Unions** statt boolescher Flags-Kombinationen; `unknown` statt
  `any`, wenn der Typ offen ist.
- Keine Typ-Casts (`as`), um den Compiler zu übergehen – lieber den Typ richtig
  modellieren.

**Vue 3 (offizieller Style Guide)**

- **`<script setup>` + Composition API** als Standard.
- **`defineProps<T>()` / `defineEmits<T>()`** typisiert; keine untypisierten Props.
- **Komponentennamen mehrwortig & PascalCase** (`UserCard`, nicht `Card`).
- Logik gehört in **Composables** (`useXxx`), nicht in die Komponente. Composables
  geben reine, testbare Funktionen zurück (TDD, siehe [`testing.md`](testing.md)).
- **Kein komplexer Ausdruck im Template** – ausgelagerte `computed`/Funktion.
- **State:** Pinia mit typisierten Stores; kein Prop-Drilling über mehrere Ebenen.
- **Styling:** Tailwind + shadcn-vue (bestehende Bausteine vor Eigenbau – Core-First-Analogie).

**Stil & Statik**

- **ESLint (flat config) + Prettier** entscheiden über Stil – nie per Hand
  formatieren. Plugins: `eslint-plugin-vue`, `@typescript-eslint`,
  `eslint-plugin-vuejs-accessibility` (siehe [`accessibility.md`](accessibility.md)).
- **YAGNI:** keine Framework-Magie, wo eine einfache Funktion reicht.

```vue
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ nettoCent: number; satz: number }>()

const bruttoCent = computed(() => Math.round(props.nettoCent * (1 + props.satz)))
</script>

<template>
  <span>{{ (bruttoCent / 100).toFixed(2) }} €</span>
</template>
```

## WordPress

**Struktur & Modernität**

- **PSR-4 + Namespaces + Composer-Autoload** für Plugin-Klassen (gleiche Linie wie
  REDAXO: zukunftssicher, testbar). Nur die Bootstrap-Datei bleibt prozedural.
- **Eindeutiger Präfix/Namespace** für alle globalen Funktionen, Hooks, Options,
  Post-Types (Kollisionsschutz).
- **`declare(strict_types=1);`** wo WP es zulässt; volle Typdeklarationen in
  eigenen Klassen.

**Core-First (WP-Analogie)**

- Erst WP-Core-APIs nutzen, bevor Eigenes entsteht:
  `WP_Query`, Options API, Settings API, Transients (Cache), REST API,
  `$wpdb->prepare()`.
- **Hooks statt Core-Modifikation** – Verhalten über `add_action`/`add_filter`
  erweitern, nie Core-Dateien anfassen.

**Stil**

- **WordPress Coding Standards (WPCS)** via PHPCS-Ruleset erzwungen.
- Pflicht: `sanitize_*` beim Input, `esc_*` beim Output, `wp_nonce` bei Aktionen
  (siehe [`security.md`](security.md)).

## Prüfung

Nach Code-Änderungen die Code-Analyse aus [`verification-tools.md`](verification-tools.md)
ausführen (nur geänderte Dateien, wenn möglich).
