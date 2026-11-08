# Spec-Driven Development

> Wird aus `AGENTS.md` per Lazy Loading geladen beim Umgang mit Anforderungen.

## Ablage

Specs liegen in `specs/` (Unterordner erlaubt). Eine Spec = eine Story.

Bei größeren Vorhaben hat sich eine **zweistufige Hierarchie** bewährt
(hero-backgrounds-Pilot): ein übergeordnetes **Gesamtdesign-Dokument**
(Entscheidungen, Architektur, Arbeitspakete) + daraus abgeleitete
**Story-Specs** pro Arbeitspaket. Beide nutzen dasselbe Frontmatter.

**Visuelle Vorgaben** (Farben, Typo, Layout) gehören nicht in Story-Specs,
sondern in die `DESIGN.md` im Repo-Root – auch Design ist eine Spec, mit
eigenem Format und eigener Prüfung (siehe [`design.md`](design.md)).

## Spec-Format

```markdown
---
status: new        # new | edited | implemented
id: <eindeutig>
---

# <Titel>

## User Story
Als <Rolle> möchte ich <Ziel>, um <Nutzen>.

## Beschreibung
<Kontext>

## Akzeptanzkriterien
- [ ] ...
- [ ] ...
```

## Status-Workflow

- Neue Spec → `status: new`.
- Spec geändert → der Agent setzt `status: edited`.
- Nach Implementierung + bestandener Verifikation → `status: implemented`.
- Sammelbefehl: "Implementiere alle Specs mit `status: edited`".

## Synchronität

> "Die Wahrheit liegt in der Spezifikation." Nach jeder Code-Änderung Spec und
> Code synchron halten.
