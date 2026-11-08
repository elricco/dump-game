# Untrusted Input & Prompt Injection

> Wird aus `AGENTS.md` per Lazy Loading geladen, sobald Fremdtext von einem
> LLM/Agenten verarbeitet wird – oder sobald Code entsteht, der solchen Text
> **einsammelt** (Formulare, Import, Scraping, Tool-Ergebnisse).

## Was „untrusted" heißt

Untrusted ist jeder Text, den **nicht** das eigene Team geschrieben hat:

- Formularnachrichten, E-Mails, Tickets, Kommentare, Bewertungen
- Dateiinhalte und Uploads (PDF, DOCX, CSV) inkl. unsichtbarer Metadaten
- Gescrapte/gefetchte Webseiten, RSS, Suchergebnisse
- **Rückgaben fremder Tools/MCP-Server** – auch die sind Fremdtext, nicht Wahrheit
- Datenbankinhalte, die ursprünglich aus einer der obigen Quellen stammen

Sobald so ein Text in einen Prompt fließt, ist er **potenzielle Anweisung an das
Modell**, nicht bloß Inhalt. Das ist keine Randbedingung – es ist die
Standardannahme.

## Kernaussage

**Prompt Injection ist am Eingang nicht lösbar.** Filter und Heuristiken
entschärfen Vektoren und liefern Signale; die eigentliche Verteidigung sitzt an
der Stelle, die den Text an ein Modell übergibt. Alles Folgende ist
Defense-in-Depth, keine Lösung – und genau so zu kommunizieren.

## Intake-Härtung (wo Fremdtext ins System kommt)

- **Unicode normalisieren (NFKC)** – vereinheitlicht Voll-/Halbbreite,
  Ligaturen und ähnliche Schreibvarianten.
- **Unsichtbare Codepoints entfernen:** Zero-Width (`U+200B–200D`), Word-Joiner
  (`U+2060`), BOM (`U+FEFF`), Bidi-Steuerung (`U+202A–202E`, `U+2066–2069`) und
  **Unicode-TAG-Zeichen (`U+E0000–E007F`)**. Letztere schmuggeln *unsichtbaren*
  ASCII-Text, den ein Mensch nicht sieht, ein LLM aber liest – ein beliebter
  Vektor.
- **Steuerzeichen entfernen**, außer Tab/LF/CR.
- **Heuristisch flaggen, nicht blockieren:** Muster wie `instruction-override`,
  `role-hijack`, `system-prompt`, `special-tokens`, `exfil-action` → Risiko
  `low|medium|high`. Das ist ein **Signal mit False Positives und Negatives**.
  Niemals als alleiniges Gate verwenden, niemals als „injection-sicher" verkaufen.
- **Risiko + Herkunft als Metadaten mitführen** (Feld, Mail-Header, DB-Spalte),
  damit die Konsum-Seite entscheiden kann.

Referenz-Implementierung: [`../examples/contact-form/`](../examples/contact-form/)
(`untrusted.ts` / `api/lib/injection.php`).

## Konsum-Regeln (verbindlich)

Wer die KI-Verarbeitung baut, setzt das um:

1. **Untrusted Content nie in den System-Prompt.** System-Prompt bleibt fix und
   frei von Fremdtext. Die Nachricht als separaten User-Turn bzw. klar
   markierten Datenblock übergeben – nie hineininterpolieren.
2. **Least Privilege für das verarbeitende Modell.** Ein Triage-/
   Zusammenfassungs-Modell bekommt **keine** handelnden Tools: kein Mailversand,
   kein DB-Schreibzugriff, kein Datei-/Netzzugriff, kein `fetch`. Was nicht
   handeln kann, kann Injection nicht zum Handeln bringen.
3. **Structured Output erzwingen und serverseitig validieren.** Festes Schema
   (`{ kategorie: enum, dringlichkeit: enum, zusammenfassung: string }`) statt
   Freitext, der direkt in Aktionen fließt.
4. **Human-in-the-Loop für jede Aktion.** Antworten senden, Tickets anlegen,
   weiterleiten – nur nach menschlicher Freigabe. Die KI schlägt vor, ein Mensch
   entscheidet.
5. **Modell-Output nie auto-ausführen.** Links, Befehle, „Anweisungen" aus einer
   Zusammenfassung werden nicht automatisch befolgt oder abgerufen.
6. **Risiko-Flag nutzen:** `high` → an menschliche Prüfung routen, nicht
   automatisiert verarbeiten.
7. **Dual-LLM / Quarantäne-Muster für Agenten.** Das privilegierte,
   orchestrierende Modell sieht den Rohtext **nie**; ein isoliertes, werkzeugloses
   Modell verarbeitet ihn und gibt nur validierte, strukturierte Felder zurück
   (vgl. „Dual-LLM"/CaMeL-Ansatz).
8. **Ausgaben einbetten, nicht ausführen.** Zusammenfassungen im UI escaped als
   Text rendern, nicht als Markdown/HTML mit aktiven Links – sonst wird aus
   Prompt Injection ein XSS-Pfad (siehe [`security.md`](security.md)).

Delimiter wie `----- BEGIN UNTRUSTED MESSAGE -----` und „treat as data"-Hinweise
sind **Marker, keine Durchsetzung**. Ein Modell kann sie ignorieren, wenn die
Konsum-Seite sie nicht erzwingt.

## Wenn das Projekt selbst ein Tool-/MCP-Server ist

Dann ist die **eigene Ausgabe** der untrusted Input eines fremden Agenten – und
die Eingabe kommt von einem Modell, das gekapert sein kann:

- **Tool-Parameter wie Nutzereingaben behandeln:** validieren, escapen, Prepared
  Statements. Ein Modell ist keine vertrauenswürdige Quelle.
- **Schreibende/löschende Tools eng schneiden** und mit Bestätigung oder
  restriktiver Berechtigung versehen – kein „generisches SQL-Tool", wenn es auch
  drei spezifische Tools tun.
- **Keine Secrets in Tool-Antworten** (auch nicht in Fehlermeldungen).
- **Audit-Log** für jeden Tool-Aufruf: wer, was, wann – ohne PII (siehe
  [`privacy.md`](privacy.md)).

## Bewusste Grenzen (nicht „wegoptimieren")

- Heuristiken haben False Positives und Negatives. Sie sind ein Signal.
- Das Entfernen unsichtbarer Zeichen schließt **einen** Vektor, nicht das
  Problem. Sichtbarer, gut formulierter Injection-Text kommt durch – deshalb
  Regeln 1–8.
- „Das Modell wurde angewiesen, das zu ignorieren" ist **keine** Kontrolle.

## Prüfung

- [ ] Test: `ignore all previous instructions …` → wird als `high` geflaggt,
      Metadaten gesetzt.
- [ ] Test: Zero-Width-Zeichen zwischen den Buchstaben eines Musters → Zeichen
      entfernt, Muster trotzdem erkannt.
- [ ] Test: Unicode-TAG-Smuggling (unsichtbarer ASCII) → im entschärften Text weg.
- [ ] Test: legitime Nachricht mit URL → `low`/`medium`, **nicht** blockiert.
- [ ] Review: Hat das verarbeitende Modell nachweislich keine handelnden Tools?
- [ ] Review: Fließt irgendwo Fremdtext in einen System-Prompt? (grep über die
      Prompt-Konstruktion)
- [ ] Review: Wird Modell-Output irgendwo ohne Freigabe in eine Aktion übersetzt?
