# Datenschutz-Richtlinie (DSGVO)

> Wird aus `AGENTS.md` per Lazy Loading geladen, sobald personenbezogene Daten,
> Formulare, Tracking, Cookies/Storage oder externe Dienste im Spiel sind.
>
> Ziel: **Privacy by Design & Default** (Art. 25 DSGVO) technisch umsetzen.
> Diese Richtlinie ersetzt keine Rechtsberatung – sie stellt sicher, dass der
> Code keine vermeidbaren Verstöße einbaut.

## Grundprinzipien

- **Datenminimierung (Art. 5):** Die besten personenbezogenen Daten sind die,
  die nie erhoben wurden (YAGNI-Analogie). Jedes Feld, jeder Log-Eintrag, jedes
  Cookie braucht einen Zweck – sonst weg damit.
- **Privacy by Default:** Die datenschutzfreundlichste Einstellung ist die
  Voreinstellung. Opt-in statt Opt-out, nichts vorangekreuzt.
- **Zweckbindung & Speicherbegrenzung:** Daten nur für den erhobenen Zweck
  nutzen; Aufbewahrung befristen (Löschkonzept, siehe unten).

## Externe Ressourcen & Dienste (häufigste Abmahnfalle)

- **Keine externen Requests ohne Rechtsgrundlage.** Beim Seitenaufruf darf ohne
  Einwilligung keine IP an Dritte fließen:
  - **Fonts lokal hosten** (Google-Fonts-Urteil LG München) – nie vom
    Google-/Adobe-CDN laden.
  - **JS/CSS-Libraries lokal bundeln**, nicht von public CDNs (unpkg, jsDelivr,
    cdnjs) einbinden.
  - **Karten/Videos/Embeds** (Maps, YouTube, Vimeo, Social) nur per
    **Zwei-Klick-/Facade-Lösung**: erst Platzhalter, Laden erst nach Klick =
    Einwilligung.
- **Consent vor Tracking:** Analytics, Pixel, Tag Manager, Session-Recording
  werden erst nach aktiver Einwilligung geladen (Consent-Management ist die
  Gate-Funktion, kein nachträglicher Filter). Gilt auch für **nicht-essentielle
  Cookies und localStorage/sessionStorage** (§ 25 TDDDG).
- **Neue Drittdienste** (API, Newsletter, CDN, Hosting-Feature) nur einbauen,
  wenn geklärt: Auftragsverarbeitungsvertrag (AVV) vorhanden? Drittlandtransfer?
  Eintrag für die Datenschutzerklärung? Im Zweifel: nachfragen statt einbauen.

## Code-Regeln (alle Stacks)

- **Keine personenbezogenen Daten in:** Logs, Fehlermeldungen, URLs/Query-Strings,
  Kommentaren, Test-Fixtures, Git-Historie. IP-Adressen sind personenbezogen –
  wenn Logging nötig, anonymisieren/kürzen.
- **TLS überall;** Formulare posten nie an `http://`.
- **Formulare:** nur die Felder, die der Zweck verlangt; so wenige Pflichtfelder
  wie möglich; Checkbox zur Datenschutzerklärung nicht vorangekreuzt;
  **Double-Opt-In** für Newsletter.
- **Spam-Schutz ohne Drittanbieter (Default):** reCAPTCHA/Turnstile & Co. senden
  bei *jedem* Seitenaufruf Daten an Dritte und sind damit einwilligungspflichtig.
  Die datenschutzfreundliche Baseline kommt ohne aus: **Honeypot-Feld +
  signiertes Zeit-Token + Rate-Limit** (siehe
  [`security.md`](security.md#öffentliche-endpunkte--formulare-unauthentifiziert),
  lauffähig in [`../examples/contact-form/`](../examples/contact-form/)).
  Erst wenn das Spam-Aufkommen es erzwingt, ein **selbst gehostetes**
  Proof-of-Work-Captcha (z. B. Altcha) nachrüsten – kein Drittanbieter-Transfer.
- **IP nur flüchtig:** Für Rate-Limits die IP nur im Arbeitsspeicher bzw. als
  gehashter Key mit kurzem TTL halten – nicht dauerhaft speichern, nicht loggen.
- **Mailversand ist Auftragsverarbeitung.** Ein API-Mailer (Resend, Mailgun,
  Postmark …) ist ein Drittdienst; bei US-Anbietern zusätzlich Drittlandtransfer.
  Das SMTP-Postfach des eigenen (EU-)Hosters vermeidet beides und ist deshalb die
  Default-Wahl für DSGVO-arme Projekte.
- **Datenmodell löschbar & exportierbar designen** (Betroffenenrechte Art. 17/20):
  personenbezogene Daten so speichern, dass sie pro Person auffindbar, löschbar
  und exportierbar sind – keine PII in unstrukturierten Blobs verstreuen.
- **Löschkonzept:** Bei jedem neuen personenbezogenen Feld die Aufbewahrungsdauer
  festlegen (in der Spec dokumentieren) und die Löschung technisch vorsehen
  (Cronjob/Command statt "machen wir später").
- **Secrets & Backups:** Zugangsdaten nie im Code (siehe
  [`security.md`](security.md)); Backups mit PII unterliegen denselben Regeln.

## PHP / REDAXO

- **Logging:** `rex_logger` ohne PII füttern; eigene Log-Tabellen mit
  Löschroutine (`rex_cronjob` bzw. Console-Command).
- **Formulare (yform & Co.):** Speicherdauer der Einträge definieren + Löschung
  einrichten; E-Mail-Versand ohne unnötige Datenweitergabe.
- **Medien/Uploads** mit PII (Bewerbungen etc.) nicht im öffentlich erreichbaren
  `media/`-Ordner ablegen.

## WordPress

- **Kommentare:** IP-Speicherung deaktivieren/anonymisieren.
- **Externe WP-Defaults abschalten:** Gravatar, oEmbeds, Emoji-CDN – laden extern
  und brauchen dieselbe Prüfung wie jeder Drittdienst.
- **Core-Werkzeuge nutzen (Core-First):** WordPress bringt Export-/Lösch-Tools
  für personenbezogene Daten mit (`Werkzeuge → Daten exportieren/löschen`) –
  eigene Plugin-Daten dort per `wp_privacy_personal_data_exporters`/`erasers`
  registrieren statt Parallellösungen zu bauen.
- **Plugins sind Drittcode:** Vor Einbau prüfen, wohin sie funken.

## JS / TS / Vue

- **Kein Storage vor Consent:** localStorage/Cookies für Nicht-Essentielles erst
  nach Einwilligung setzen (§ 25 TDDDG).
- **Fehler-/Analytics-SDKs** (Sentry & Co.): nur nach Consent initialisieren,
  PII-Scrubbing aktivieren (`sendDefaultPii: false` o. ä.).
- **Keine PII im Client-State persistieren**, der den Zweck überdauert
  (z. B. Formulardaten in localStorage "für später").

## Prüfung

**Automatisiert (deterministisch), Teil der Verifikation:**

- **Externe-Hosts-Scan:** Build/Quelltext nach externen URLs durchsuchen
  (fonts.googleapis, cdn., unpkg, jsdelivr, youtube.com/embed, maps.googleapis,
  google-analytics, googletagmanager …) – jeder Treffer muss begründet und
  consent-gated sein. Aufruf in [`verification-tools.md`](verification-tools.md).
- **PII-Log-Scan:** grep auf E-Mail-/IP-Muster in Log-Aufrufen.
- **Dependency-Audits** (`composer audit`, `npm audit`) – Datenlecks entstehen
  auch durch verwundbare Pakete.

**Checkliste vor Release (manuell):**

1. Seite mit offenem Netzwerk-Tab laden (ohne Consent): gehen Requests an Dritte?
2. Jedes neue Formular: nur nötige Felder? Verschlüsselt? Speicherdauer definiert?
3. Neue Drittdienste: AVV geklärt, Datenschutzerklärung ergänzt?
4. Neue personenbezogene Felder: löschbar, exportierbar, befristet?
