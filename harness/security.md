# Security-Richtlinie

> Wird aus `AGENTS.md` per Lazy Loading geladen bei sicherheitsrelevanten
> Änderungen.

## Baseline (alle Stacks)

- **Input validieren, Output escapen.** Nie ungefiltert vertrauen.
- **Keine Secrets im Code.** API-Keys/Passwörter über Config/Env, nicht hartcodiert.
- **Least Privilege:** Berechtigungen so eng wie möglich.
- **Prepared Statements** für jeden DB-Zugriff mit Nutzereingaben.

## Secrets & Repo-Hygiene

- **Niemals Keys, Tokens oder Passwörter ins Repo** – auch nicht "kurz zum
  Testen", auch nicht in Tests, Fixtures, Beispiel-Configs oder Kommentaren.
- **`.env` wird nie committet.** `.env`, `.env.local`, `.env.*.local` gehören
  in die `.gitignore`, **bevor** die erste `.env` entsteht. Committet wird nur
  eine **`.env.example`** mit Platzhaltern (`DB_PASSWORD=changeme`) als Doku,
  welche Variablen das Projekt braucht.
- **Einmal gepusht = kompromittiert.** Ein Secret in der Git-Historie ist
  verbrannt, auch wenn der Commit "gelöscht" wird: sofort **rotieren**, nicht
  nur entfernen.
- **Secrets nie in:** Logs, Fehlermeldungen, URLs/Query-Strings, Client-Bundles
  (siehe `VITE_`-Regel unten), CI-Logs (maskierte GitHub-Secrets verwenden).
- **Secrets im Deploy aus der CI erzeugen, nicht von Hand auf den Server
  legen** (wo die CI ohnehin deployt): Config-Dateien wie `config.php` aus
  maskierten CI-Secrets generieren. Regeln dafür:
  - Werte **mit der Sprache selbst escapen** (`var_export` in PHP,
    `json.dumps` o. ä.), nie per String-Bau – ein `'`, `\` oder `$` im
    Passwort darf die Datei weder zerbrechen noch Code einschleusen.
  - Fehlende/ungültige Werte **vor** dem Kontakt zum Server abfangen; die
    Fehlermeldung nennt nur **Namen**, nie Werte (landet im CI-Log).
  - Datei mit `0600` hochladen, **außerhalb** des Document Root, und auf dem
    Runner im `always()`-Schritt löschen.
  - Generator mit Tests absichern (Sonderzeichen, fehlende Werte) und die
    Tests in der CI laufen lassen.
  Referenz: `api-php/tools/build-config.php` im astro-site-template.
- **Deterministische Prüfung:** **gitleaks** scannt Repo und Staging auf
  Secret-Muster (siehe [`verification-tools.md`](verification-tools.md));
  zusätzlich GitHub **Push Protection / Secret Scanning** im Remote aktivieren.

## Angriffsklassen strukturell ausschließen (by design)

Ziel ist nicht, Angriffe einzeln abzuwehren, sondern **die ganze Klasse
unmöglich zu machen** – dann gibt es keinen Einzelfall, der vergessen werden
kann:

| Angriffsklasse       | Ausschluss-Regel                                                                 |
| -------------------- | -------------------------------------------------------------------------------- |
| SQL-Injection        | **Ausschließlich** Prepared Statements (`rex_sql`, `$wpdb->prepare`). String-Konkatenation in Queries ist verboten – nicht "vorsichtig benutzen", sondern gar nicht. |
| XSS                  | Jede Ausgabe ist **escaped by default** (`rex_escape`, `esc_*`, Vue-Interpolation). Roh-HTML (`v-html`, `innerHTML`, `echo` ohne Escape) nur mit Sanitizer (DOMPurify/`wp_kses`) **und** Begründung im Code. |
| Command Injection    | Keine Shell-Strings aus Variablen (`exec("cmd $var")` verboten). Prozesse über **Symfony Process mit Array-Argumenten** + Whitelist erlaubter Kommandos. |
| Path Traversal       | Pfade nie aus Nutzereingaben zusammensetzen. Basis-Pfade über `rex_path`/Konstanten; vor Zugriff `realpath()`-Check gegen das erlaubte Basisverzeichnis. |
| Unsichere Deserialisierung | Kein `unserialize()` auf Fremddaten – **JSON** (`json_decode`) verwenden. |
| CSRF                 | Jede zustandsändernde Aktion braucht ein Token (`rex_csrf_token`, `wp_nonce`) **und** eine Berechtigungsprüfung – ohne Ausnahme. |
| Schadhafte Uploads   | Whitelist erlaubter Typen/Endungen (nie Blacklist), Ablage außerhalb des Webroots oder ohne Ausführungsrechte, Dateinamen neu vergeben. |
| Mail-Header-Injection | `\r\n` aus **jedem** Wert strippen, der in einen Mail-Header wandert (`Reply-To`, `Subject`, `From`). Mails als reiner Text versenden, nicht als HTML. |
| Offener Mail-Relay    | Absender-Adresse aus Nutzereingabe wird **nie** `From`, sondern nur `Reply-To`; `From` ist immer das eigene Postfach (SPF/DKIM). Endpunkt akzeptiert nur POSTs der eigenen Origin. |
| Prompt Injection      | Fremdtext nie in den System-Prompt; verarbeitendes Modell ohne handelnde Tools. Details: [`untrusted-input.md`](untrusted-input.md). |
| Ungeschützte Admin-/CMS-UI in Produktion | Git-basierte CMS mit lokalem/keinem eigenen Auth-Modus (z. B. Keystatic `local`-Storage, Decap ohne OAuth-Backend) dürfen nie in einen Produktions-Build gelangen – strukturell ausschließen (Integration nur im Dev-Build laden), nicht per Hosting-Firewall hoffen. |

Was strukturell ausgeschlossen ist, wird per Statik erzwungen (PHPStan-Regeln,
ESLint, Review) – nicht per Erinnerung.

## Öffentliche Endpunkte / Formulare (unauthentifiziert)

Ein unauthentifizierter Endpunkt (Kontaktformular, Newsletter, Upload,
Webhook) ist die am leichtesten erreichbare Angriffsfläche. Regeln:

- **Schichten in dieser Reihenfolge**, damit teure Schritte (Mailversand,
  DB-Schreiben, API-Calls) nur bei sauberen Requests laufen:
  1. Methode + **Origin** prüfen (kein offener Relay; `Referer`-Fallback nur,
     wenn der Client kein `fetch` ist)
  2. **Rate-Limit** pro IP
  3. **Honeypot** – ausgefüllt = Bot
  4. **Signiertes Zeit-Token** (HMAC über Timestamp): prüft Echtheit *und* Alter
  5. **Validierung + Längenlimits** auf jedem Feld
  6. **Kontext-Escaping** vor dem Ziel (Mail-Header, SQL, HTML)
  7. Aktion ausführen
- **Bot-Abwehr gibt Fake-Erfolg zurück** (200), keinen Fehler – sonst lernt der
  Bot, welche Schicht ihn erwischt hat.
- **Geheimnis-Vergleiche in Konstantzeit** (`hash_equals`, `crypto.timingSafeEqual`
  bzw. XOR-Schleife). Ein `===` auf HMACs ist über Antwortzeiten angreifbar.
- **Fehlerdetails nur ins Log, nie an den Client.** Der Client bekommt eine
  generische Meldung; Stacktraces/SMTP-Fehler bleiben serverseitig.
- **Secrets nie im Frontend.** Alles, was der Browser sieht, ist öffentlich –
  Keys/Passwörter nur in env bzw. in einer Config **über** dem Webroot.
- **Fail-open vs. fail-closed bewusst entscheiden und im Code begründen.**
  Beispiel: ein nicht schreibbarer Rate-Limit-Store darf durchlassen (andere
  Schichten greifen weiter) – das ist eine Verfügbarkeits-Entscheidung, kein
  Versehen, und gehört kommentiert.
- **Obfuskation ist keine Sicherheitsgrenze.** Versteckte Endungen, unübliche
  Pfade, entfernte `X-Powered-By`-Header reduzieren Fingerprint und Bot-Rauschen –
  sie ersetzen keine Prüfung und werden nie als Schutz dargestellt.

Lauffähige Referenz mit allen Schichten:
[`../examples/contact-form/`](../examples/contact-form/).

## PHP / REDAXO

- **SQL:** ausschließlich `rex_sql` mit gebundenen Parametern – **nie**
  String-Konkatenation.

  ```php
  $sql = rex_sql::factory();
  $sql->setQuery(
      'SELECT * FROM ' . rex::getTable('meine_tabelle') . ' WHERE id = :id',
      ['id' => $id]
  );
  ```

- **Tabellen immer über `rex::getTable()`** (Präfix, Multi-Instance).
- **Output-Escaping:** `rex_escape($wert)` (bzw. `rex_escape($wert, 'html_attr')`
  in Attributen) für alles, was aus Daten/Eingaben in HTML landet.
- **CSRF:** Backend-Formulare/Aktionen mit `rex_csrf_token` absichern.
- **API-Funktionen:** `rex_api_function` nur mit gesetztem `$published`-Flag für
  Frontend-Zugriff; Berechtigungen prüfen.
- **Backend-Seiten:** `perm:` in `package.yml` deklarieren – sonst offen für jeden
  Backend-User.
- **Config statt Hardcoding:** Keys/Tokens über `rex_config`.
- **Logging:** Fehler via `rex_logger::logException()`, keine Secrets ins Log.

## WordPress

- **Input je Typ sanitisieren:** `sanitize_text_field()`, `absint()`,
  `sanitize_email()`, `wp_kses()` (erlaubte HTML-Whitelist).
- **Output je Kontext escapen:** `esc_html()`, `esc_attr()`, `esc_url()`,
  `esc_js()`, `wp_kses_post()` – **spät escapen**, direkt bei der Ausgabe.
- **DB:** `$wpdb->prepare()` **immer**; nie String-Konkatenation in Queries.
- **Aktionen absichern:** `wp_verify_nonce()` / `check_admin_referer()` +
  `current_user_can()` (Capability), nicht nur Rollen prüfen.
- **REST API:** jeder Endpunkt braucht einen `permission_callback` (nie
  `__return_true` für schreibende Routen) und `args`-Validierung/-Sanitisierung.
- **Dateien/Uploads:** `wp_handle_upload()`, erlaubte MIME-Types prüfen.
- **Secrets** über `wp-config.php`/Env, nicht im Code oder in der DB im Klartext.

## JS / TS / Vue

- **XSS:** Kein `v-html` mit ungeprüften Daten; kein `innerHTML` aus
  Nutzereingaben. Muss HTML gerendert werden → mit **DOMPurify** säubern.
- **Env/Secrets:** Alles mit `VITE_`-Präfix landet **im öffentlichen Bundle** –
  dort niemals Secrets. Tokens/Keys bleiben serverseitig.
- **Dependencies:** `npm audit` sauber halten; `eslint-plugin-security` beachten.
- **API-Aufrufe:** Antworten nicht blind vertrauen; Eingaben clientseitig
  validieren, aber Autorität liegt beim Server.
- **CSP:** Content-Security-Policy setzen; keine Inline-Skripte. Strikte
  `style-src 'self'` blockiert auch `style="…"`-Attribute im Markup – das
  betrifft vor allem übernommene Design-Mockups (siehe
  [`design.md`](design.md)).

## Astro

- **Server-seitige Secrets: `process.env`, nicht `import.meta.env`.** Vite
  ersetzt `import.meta.env.*` nur **zur Build-Zeit**. Unter Adaptern, die
  eine Route **zur Laufzeit** ausführen (`prerender = false`, z. B.
  `@astrojs/node`), liefert `import.meta.env.FORM_SECRET` & Co. zur Laufzeit
  `undefined` – der Endpunkt lehnt dann jede Anfrage stumm ab (oder, schlimmer,
  ein Vergleich gegen `undefined` lässt eine Prüfung fälschlich bestehen).
  `process.env` wird selbst nicht automatisch aus einer `.env` befüllt – dafür
  `dotenv/config` als Seiteneffekt-Import laden. Lektion aus einem echten
  Einsatz (astro-site-template-Projekt, 2026-08): siehe
  [`../examples/contact-form/serverless/README.md`](../examples/contact-form/serverless/README.md#umgebungsvariablen-processenv-nicht-importmetaenv).
  **Cloudflare Workers hat kein `process.env`** – dort andere, adapterspezifische
  Doku prüfen (`context.locals.runtime.env`), nicht blind übernehmen.
- **CSP vs. Astros Standard-Inlining.** Astro schreibt kleine Stylesheets
  (`<style>`) und hoisted `<script>`-Tags unter ~4 KB standardmäßig direkt
  inline in die Seite – das bricht ein striktes `style-src`/`script-src 'self'`
  ohne Hashes/Nonces. Gegenmittel: `build.inlineStylesheets: "never"` UND
  `vite.build.assetsInlineLimit: 0` (Achtung: `assetsInlineLimit` ist KEINE
  Astro-`build`-Option, sondern eine reine Vite-Option – unter Astros `build`-Key
  gesetzt wird sie vom Config-Schema stillschweigend ignoriert). Bei
  produktionsrelevanten CSP-Änderungen den tatsächlichen Build-Output
  gegenprüfen (Hashes neu berechnen), nicht nur die Config lesen.
- **CSP gehört dorthin, wo der Server sie liest.** `public/_headers` ist das
  Netlify-/Cloudflare-Format – **Apache ignoriert es**. Auf Shared Hosting
  muss die Policy in die Webroot-`.htaccess` (`Header set
  Content-Security-Policy …`). Im Pilot stand die CSP nur in `_headers` und
  wäre live nie aktiv gewesen. Bei mehreren Zielen beide Quellen pflegen.
- **Inline-Hashes per Build-Check absichern.** Hashes für Inline-Blöcke
  (z. B. JSON-LD) hängen vom Inhalt ab (Seitenname, Domain) und veralten
  still, sobald sich dieser ändert – der Browser blockiert dann ohne
  sichtbaren Fehler. Ein Skript nach dem Build (`pnpm csp:check`) hasht alle
  Inline-Blöcke aus `dist/` und prüft sie gegen jede CSP-Quelle; in der CI
  bricht es den Build. Referenz: `scripts/check-csp.mjs` im
  astro-site-template.
- **Fremd-Requests im Client-Bundle** genauso behandeln wie bei jedem
  JS/TS-Projekt (siehe oben, `VITE_`-Regel).

## Deployment (Shared Hosting per rsync/SSH)

Gelernt beim ersten echten Deploy-Setup (tim-filler-astro, 2026-10):

- **Projektordner über dem Document Root.** `config.php`, Rate-Limit-Ordner
  und `vendor/` liegen eine Ebene über dem Ordner, auf den die Domain zeigt
  (z. B. `<projekt>/dist/`). Per URL unerreichbar.
- **`--delete` nur im Document Root.** rsync synchronisiert ausschließlich
  `<projekt>/dist/`, nie den Projektordner – sonst löscht jeder Deploy
  Config und Laufzeitdaten, die nicht im Repo liegen.
- **Ein Paket, ein Sync.** Alles, was in den Document Root gehört (statischer
  Build, API-Ordner, `.htaccess`, Fehlerseiten), vorher zu **einem** Paket
  zusammenstellen. Zwei getrennte Syncs mit `--delete` löschen sich
  gegenseitig.
- **Abhängigkeiten in der CI bauen** (`composer install --no-dev` nach
  `composer.lock`) und hochladen – kein Composer auf dem Server, kein
  Handupload. `composer validate --strict` und `composer audit --locked` in
  der CI.
- **Keine Fremd-Action mit dem privaten Schlüssel.** `rsync`/`ssh` sind auf
  dem Runner vorhanden; eine Marketplace-Action bekäme sonst den Deploy-Key.
  Eigener Deploy-Key pro Projekt.
- **Host-Key prüfen:** `known_hosts` als Secret (`ssh-keyscan -H <host>`,
  Fingerprint einmal manuell prüfen) – nie `StrictHostKeyChecking=no`.
- **Per Variable aktivieren** (`vars.DEPLOY_ENABLED == 'true'`), damit Pushes
  vor dem Setup nicht an fehlenden Secrets scheitern.
- **Portable Optionen:** `--chmod=u=rw,go=` statt `--chmod=F600` (alte
  rsync-Versionen, z. B. macOS 2.6.9, kennen die Kurzform nicht).

Lauffähige Vorlage: `.github/workflows/ci.yml` und `api-php/README.md`
(„Deployment") im astro-site-template.

## Prüfung

Security-Checks aus [`verification-tools.md`](verification-tools.md) ausführen
(Composer audit / npm audit / Psalm-Taint). Bei sicherheitskritischen Änderungen
gezielt einen Test für den Angriffsfall schreiben (TDD, siehe
[`testing.md`](testing.md)).
