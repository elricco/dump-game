# Test-Richtlinie

> Wird aus `AGENTS.md` per Lazy Loading geladen, bevor Tests geschrieben werden.
> **TDD ist Pflicht.**

## Test-Driven Development

Der Zyklus ist die kleinste Arbeitseinheit:

1. **Red** – Schreibe einen Test, der das gewünschte Verhalten beschreibt und
   **fehlschlägt**. Ableitung aus den Akzeptanzkriterien der Spec.
2. **Green** – Schreibe das **Minimum** an Produktivcode, damit der Test grün wird.
3. **Refactor** – Räume auf, ohne Verhalten zu ändern. Tests bleiben grün.

Regeln:

- **Kein Produktivcode ohne vorher fehlschlagenden Test.**
- Jedes Akzeptanzkriterium einer Spec hat mindestens einen Test.
- Tests sind Spezifikation in ausführbarer Form – sie beschreiben *Verhalten*,
  nicht Implementierungsdetails.
- Ein Test = eine Aussage. Klarer Name (`brutto_rundet_kaufmaennisch`).

## Grenzen von In-Process-Tests

Zwei Lektionen aus einem abgeschlossenen Symfony-Rebuild-Projekt (2026-09):
eine vollständig grüne Testsuite (79 Tests) verdeckte zwei
produktionsblockierende Bugs, die erst eine abschließende Whole-Branch-Review
mit echten HTTP-Requests gegen eine laufende Instanz aufdeckte.

- **Jede nach außen wirkende Fähigkeit (Mailversand, externe API,
  Zahlungsanbieter) braucht mindestens einen Test, der den echten Service
  aus dem DI-Container/Service-Locator auflöst** – gegen einen Null-/Test-
  Transport, nicht gemockt. Grund: wenn *jeder* Test das Interface mockt
  (z. B. `MailerInterface`), validiert keiner die tatsächliche
  Service-Verdrahtung. Im konkreten Fall lief der Mailversand durch eine
  falsch konfigurierte Transport-Kette (Nachrichten-Warteschlange ohne
  laufenden Consumer) – jeder gemockte Test blieb grün, jede echte
  Formular-Einreichung hätte einen Serverfehler zurückgegeben.
- **Definition-of-Done für jede neue Route/jeden neuen Endpunkt: ein echter
  HTTP-Smoke-Test gegen eine laufende Instanz** (z. B. `curl`), zusätzlich
  zum In-Process-Test-Client des Frameworks (`WebTestCase`-artige Clients
  umgehen den echten Webserver und können daher Routing-/Rewrite-
  Konfigurationsfehler – fehlende `.htaccess`, falscher Docroot – nicht
  erkennen). Ein lokales Docker-Setup (siehe
  [`../configs/docker/`](../configs/docker/)) macht diesen Smoke-Test
  günstig genug, um ihn regelmäßig zu wiederholen, nicht nur einmal am Ende.

## PHPUnit-Stolpersteine (PHPUnit 12/13)

Gelernt in bav-streak (2026-10), jeweils beim ersten Lauf:

- **Doc-Comment-Annotationen sind weg.** `@dataProvider` & Co. werden ab
  PHPUnit 12 ignoriert, der Test bekommt dann zu wenige Argumente. Attribute
  verwenden: `#[DataProvider('name')]` mit
  `use PHPUnit\Framework\Attributes\DataProvider;`. Provider sind `static`.
- **Hilfsmethoden nicht `fail()` nennen.** `Assert::fail()` ist `final`, ein
  eigener Helfer gleichen Namens ist ein Fatal Error beim Laden der Klasse
  (der Test ist dann "rot" aus dem falschen Grund). Besser sprechende Namen
  (`recordFailures()`).
- **RED immer auf den Grund lesen.** "Class not found" ist der gewollte
  Fehlschlag, ein Fatal Error im Test selbst nicht.
- **Installierte Major-Versionen pruefen** (PHPUnit 13, PHPStan 2, Deptrac 4,
  CS-Fixer 3.95 im Oktober 2026), bevor Configs aus dem Template kopiert werden.

## Zeit- und Ratenlogik adversarial testen

Gelernt in bav-streak (2026-10): Ein Video-Nachweis (Heartbeats gegen
Echtzeit) hatte 23 gruene Tests und trotzdem eine Umgehung, die ein 600-s-Video
bei **0 s Echtzeit** als gesehen wertete. Ursache: Eine Toleranz (Jitter), die
nur ueber die *Annahme* eines Ereignisses entscheiden sollte, wurde bei jedem
Schritt erneut *gutgeschrieben*. Die ehrlichen Tests deckten das nicht ab.

- Fuer jede Logik, die Zeit, Raten oder Guthaben bewertet, gehoeren
  **Angreifer-Tests** neben die ehrlichen: Nullzeit-Schleife (700 Aufrufe mit
  identischem Zeitstempel), Pause und danach Burst, Zustand abwechselnd
  verlassen und wieder betreten, Wiederherstellung aus dem gespeicherten Zustand.
- Toleranzen duerfen **annehmen oder ablehnen, nie gutschreiben.** Gutgeschrieben
  wird nur, was nachweislich vergangen ist (`min(Behauptung, Echtzeit)`).
- Ein frischer Reviewer mit dem Auftrag "versuche zu betrügen" hat das gefunden,
  die eigene Testsuite nicht. Fuer sicherheitsrelevante Domainlogik einplanen.

## Testbarkeit durch Schnitt

Damit TDD in REDAXO überhaupt schnell geht: Geschäftslogik gehört in die
**Domain-Schicht ohne rex_*-Abhängigkeit** (siehe [`architecture.md`](architecture.md)).
Diese Klassen sind reine PHP-Units → in Millisekunden testbar, kein REDAXO-Boot nötig.

Was REDAXO-Runtime braucht (DB, Config, Extension Points), wird über schmale
Adapter in der Redaxo-Schicht gekapselt und, wenn nötig, im Test durch Fakes/Stubs
ersetzt.

## Werkzeuge je Stack

| Stack        | Framework                    | Ausführung                          |
| ------------ | ---------------------------- | ----------------------------------- |
| PHP / REDAXO | **PHPUnit**                  | `vendor/bin/phpunit`                |
| JS / TS / Vue| **Vitest** (+ Vue Test Utils)| `pnpm test`                         |
| E2E (optional)| **Playwright**              | `pnpm e2e`                          |
| WordPress    | PHPUnit + WP-Test-Suite      | `vendor/bin/phpunit`                |

## Erwartungen

- Neue Domänenlogik: **immer** per TDD, hohe Abdeckung.
- Integrationsschicht (rex_sql etc.): gezielte Integrationstests für die
  kritischen Pfade – nicht jede Zeile, aber jeden Vertrag.
- Bugfix = zuerst ein Test, der den Bug reproduziert (Red), dann Fix (Green).
- Coverage ist Mittel, nicht Ziel: lieber wenige aussagekräftige Tests als viele
  triviale.

## PHPUnit-Skelett (REDAXO-Addon)

```
tests/
└── Domain/
    └── PreisrechnerTest.php
phpunit.xml.dist
```

```php
<?php

declare(strict_types=1);

namespace Elricco\MeinAddon\Tests\Domain;

use Elricco\MeinAddon\Domain\Preisrechner;
use PHPUnit\Framework\TestCase;

final class PreisrechnerTest extends TestCase
{
    public function test_brutto_rundet_kaufmaennisch(): void
    {
        $rechner = new Preisrechner();
        self::assertSame(119, $rechner->brutto(100, 0.19));
    }
}
```

## JS / TS / Vue

- **Vitest** für Units: Domain-Funktionen (`src/domain/`), Composables, Pinia-Stores
  – ohne Component-Mount, deshalb schnell.
- **Vue Test Utils / Testing Library** für Komponenten: **Verhalten** testen
  (was der Nutzer sieht/auslöst), nicht interne Implementierung.
- **Playwright** für die wenigen kritischen End-to-End-Flows.
- TDD: bei neuer Logik zuerst den Composable-/Funktions-Test schreiben.

```ts
// src/domain/preis.ts
export const bruttoCent = (nettoCent: number, satz: number): number =>
  Math.round(nettoCent * (1 + satz))

// src/domain/preis.test.ts
import { describe, it, expect } from 'vitest'
import { bruttoCent } from './preis'

describe('bruttoCent', () => {
  it('rundet kaufmännisch', () => {
    expect(bruttoCent(100, 0.19)).toBe(119)
  })
})
```

## WordPress

- **Reine Domain-Klassen** (`src/Domain/`) per PHPUnit als echte Units testen –
  keine WP-Abhängigkeit nötig.
- **WP-Integration** (`src/Wp/`): Unit-Tests mit **Brain Monkey** / **WP_Mock**
  (WP-Funktionen mocken) oder Integrationstests mit der **WP-Test-Suite**
  (`WP_UnitTestCase`) für DB-nahe Pfade.
- Bugfix = zuerst reproduzierender Test (Red), dann Fix (Green).
