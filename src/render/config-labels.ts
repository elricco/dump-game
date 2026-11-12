/** Deutsche Beschriftungen der Config-Seite. Werte, Bereiche und Standards kommen aus PARAMS. */

export const GROUPS = [
  'Kanal',
  'Spiel & Regeln',
  'Aussehen',
  'Flugbahn',
  'Sounds',
  'Befehle',
  'Entwicklung',
] as const

export type Group = (typeof GROUPS)[number]

export interface Label {
  label: string
  help: string
  group: Group
  /** Anzeigenamen für Auswahl- und Listenwerte */
  options?: Record<string, string>
  /** nur aktiv bei theme=custom */
  customOnly?: boolean
}

const ROLES = { mod: 'Mods', vip: 'VIPs', sub: 'Subs', all: 'Alle' }

export const LABELS: Record<string, Label> = {
  channel: {
    label: 'Twitch-Kanal',
    help: 'Login-Name des Kanals, z. B. elricco1978. Pflichtfeld.',
    group: 'Kanal',
  },
  modes: {
    label: 'Aktive Spiele',
    help: 'Welche Befehle ein Spiel starten.',
    group: 'Spiel & Regeln',
    options: { jump: 'Jump (Gleiter)', bump: 'Bump (Pachinko)' },
  },
  perm: {
    label: 'Wer darf spielen?',
    help: 'Der Broadcaster darf immer.',
    group: 'Spiel & Regeln',
    options: ROLES,
  },
  reset_perm: {
    label: 'Wer darf die Runde zurücksetzen?',
    help: 'Gilt für den Reset-Befehl. Der Broadcaster darf immer.',
    group: 'Spiel & Regeln',
    options: ROLES,
  },
  reset_after: {
    label: 'Auto-Reset nach Ruhe (Sekunden)',
    help: 'So lange ohne neuen Sprung, dann wird das Feld geleert. 0 = nie.',
    group: 'Spiel & Regeln',
  },
  difficulty: {
    label: 'Schwierigkeit (%)',
    help: 'Ab diesem Wert zählt eine Landung als 100 %. 100 = nur exakt mittig.',
    group: 'Spiel & Regeln',
  },
  highscore: {
    label: 'Highscores',
    help: 'Top 5 oben rechts während einer Runde – und wie lange sie gelten.',
    group: 'Spiel & Regeln',
    options: {
      off: 'Aus',
      stream: 'Bis zum Neuladen',
      day: 'Heute',
      week: 'Diese Woche',
      forever: 'Für immer',
    },
  },
  highscore_size: {
    label: 'Größe der Highscores',
    help: 'Vergrößert die Liste oben rechts – zusätzlich zu „Größe". 1 = Standard.',
    group: 'Aussehen',
    options: { '1': '1× (Standard)', '1.5': '1,5×', '2': '2×', '2.5': '2,5×', '3': '3×' },
  },
  theme: {
    label: 'Theme',
    help: 'Landefläche und Todeszone.',
    group: 'Aussehen',
    options: {
      target: 'Zielscheibe + Wasser',
      lava: 'Zielscheibe + Lava',
      custom: 'Eigene Bilder',
    },
  },
  land: {
    label: 'Bild der Landefläche (https)',
    help: 'Nur bei „Eigene Bilder". PNG mit transparentem Hintergrund.',
    group: 'Aussehen',
    customOnly: true,
  },
  land_surface: {
    label: 'Standhöhe auf der Landefläche',
    help: 'Anteil der Bildhöhe von oben, auf dem Gelandete stehen (0,4 passt zur Kommode).',
    group: 'Aussehen',
    customOnly: true,
  },
  death: {
    label: 'Bild der Todeszone (https)',
    help: 'Nur bei „Eigene Bilder". Wird waagerecht gekachelt.',
    group: 'Aussehen',
    customOnly: true,
  },
  death_surface: {
    label: 'Einsinktiefe in der Todeszone',
    help: 'Anteil der Bildhöhe von oben, bis zu dem Tote einsinken (0,8 passt zum Schwertwall).',
    group: 'Aussehen',
    customOnly: true,
  },
  scale: {
    label: 'Größe',
    help: 'Vergrößert Figuren, Landefläche und Todeszone. 1 = Standard.',
    group: 'Aussehen',
  },
  move: {
    label: 'Landefläche bewegt sich',
    help: 'Pendelt hin und her; aus = steht in der Mitte.',
    group: 'Aussehen',
  },
  drift_min: {
    label: 'Seitwärts – Minimum',
    help: 'Pixel pro Bild bei 60 fps (1080p). Höher = schneller zur Seite.',
    group: 'Flugbahn',
  },
  drift_max: { label: 'Seitwärts – Maximum', help: 'Obergrenze für seitwärts.', group: 'Flugbahn' },
  sink_min: {
    label: 'Sinken – Minimum',
    help: 'Pixel pro Bild bei 60 fps (1080p). Höher = schneller unten.',
    group: 'Flugbahn',
  },
  sink_max: { label: 'Sinken – Maximum', help: 'Obergrenze fürs Sinken.', group: 'Flugbahn' },
  straight: {
    label: 'Chance „fällt gerade"',
    help: '0 bis 1 – Anteil der Gleiter, die senkrecht fallen.',
    group: 'Flugbahn',
  },
  wallslide: {
    label: 'Chance „rutscht an der Wand"',
    help: '0 bis 1 – Anteil der Gleiter, die an der Wand hängen bleiben.',
    group: 'Flugbahn',
  },
  vol: { label: 'Lautstärke', help: '0 = stumm, 1 = voll.', group: 'Sounds' },
  snd_jump: {
    label: 'Sound beim Start (https)',
    help: 'Leer = eingebauter 16-Bit-Klang.',
    group: 'Sounds',
  },
  snd_hit: {
    label: 'Sound bei Landung (https)',
    help: 'Leer = eingebaute Fanfare.',
    group: 'Sounds',
  },
  snd_miss: {
    label: 'Sound bei Tod (https)',
    help: 'Leer = eingebautes Wah-wah.',
    group: 'Sounds',
  },
  cmd_jump: { label: 'Befehl Jump', help: 'Ohne „!", z. B. jump.', group: 'Befehle' },
  cmd_bump: { label: 'Befehl Bump', help: 'Ohne „!", z. B. bump.', group: 'Befehle' },
  cmd_reset: { label: 'Befehl Runde zurücksetzen', help: 'Ohne „!".', group: 'Befehle' },
  cmd_resetscores: {
    label: 'Befehl Highscores leeren',
    help: 'Ohne „!". Nur der Broadcaster darf.',
    group: 'Befehle',
  },
  debug: {
    label: 'Debug-Anzeige',
    help: 'Zeigt Chat-Status, Ereignisse und Config im Overlay – nur zum Testen.',
    group: 'Entwicklung',
  },
}
