# Workflow

> Der verbindliche Entwicklungsablauf. Wird aus `AGENTS.md` referenziert.

## Ablauf (Test-Driven)

1. **Spec** – Anforderung als Spec festhalten/lesen (siehe [`spec-driven.md`](spec-driven.md)).
   Keine Implementierung ohne Akzeptanzkriterien.
2. **Test zuerst** – Aus den Akzeptanzkriterien einen **fehlschlagenden** Test
   ableiten (Red). Siehe [`testing.md`](testing.md).
3. **Code** – Das Minimum schreiben, damit der Test grün wird (Green). Vorher
   [`coding-style.md`](coding-style.md) und bei Strukturentscheidungen
   [`architecture.md`](architecture.md) lesen.
4. **Refactor** – Aufräumen, ohne Verhalten zu ändern; Tests bleiben grün.
5. **Verifikation** – Statische Analysen aus [`verification-tools.md`](verification-tools.md)
   ausführen, Befunde beheben.
6. **Spec-Sync** – Spec-Status und -Inhalt synchron zum Code halten.

## Regeln

- **Red → Green → Refactor** ist die kleinste Einheit. Kein Produktivcode ohne
  vorher fehlschlagenden Test.
- **YAGNI:** Nur bauen, was die aktuelle Spec verlangt. Der beste Code ist der,
  der nicht geschrieben werden musste.
- **KISS:** Die einfachste Lösung, die die Tests grün macht, gewinnt.
- Lieber kleine, fokussierte Sessions als stundenlange Mammut-Sessions.
- Kein "fertig" ohne bestandene Verifikation **und** grüne Tests.

## Git

- Ein logischer Schritt = ein Commit (aussagekräftige Nachricht).
- Kein Push, bevor Tests grün sind und die statische Analyse sauber ist.

<!-- TODO: Projektspezifische Branch-/PR-Konventionen ergänzen. -->

## CI/CD-Actions & Node-Version aktuell halten

Gepinnte GitHub-Action-Versionen und Node-LTS-Stände sind Momentaufnahmen –
sie veralten, ohne dass der Code sich ändert, und GitHub deprecatet
Runner-Node-Versionen mit Vorlauf, aber verbindlich (Beispiel:
[Node 20 Deprecation-Ankündigung](https://github.blog/changelog/2025-09-19-deprecation-of-node-20-on-github-actions-runners/)).
Vor dem ersten produktiven CI-Setup (und danach in größeren Abständen) gegen
die tatsächlichen Marketplace-/Release-Seiten prüfen, nicht aus dem
Gedächtnis oder von einem älteren Projekt kopieren – Stand beim Schreiben
dieser Zeile (2026-08, siehe astro-site-template-Praxistest):
`actions/checkout@v7`, `actions/setup-node@v7`, `actions/upload-artifact@v7`,
`pnpm/action-setup@v6` (eigene, niedrigere Versionszählung, anderer
Maintainer), Node **24** als aktuelle Active-LTS (22 nur noch Maintenance).
Diese Zahlen selbst werden veralten – die Prüfpflicht bleibt.
