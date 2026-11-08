// Automatisch erzeugt aus DESIGN.md – nicht von Hand aendern (pnpm design:tokens).
export const colors = {
  primary: '#ffffff',
  outline: '#0e0e10',
  skin: '#f1c27d',
  helmet: '#3a3f4b',
  goggles: '#7fd3ff',
  boots: '#2a2a2a',
  glider: '#eef1f5',
  gliderStripe: '#ff5a36',
  gliderShade: '#b9c0cc',
  targetRed: '#d7263d',
  targetWhite: '#f5f5f5',
  targetRim: '#8c1c2b',
  water: '#1e6fd9',
  waterLight: '#5fb3ff',
  lava: '#ff5a1f',
  lavaGlow: '#ffc23d',
  lavaCrust: '#5a1a0b',
} as const

export const typography = {
  name: {
    fontFamily: 'system-ui',
    fontSize: 26,
    fontWeight: 900,
    lineHeight: 1,
    letterSpacing: '0.04em',
  },
  score: {
    fontFamily: 'system-ui',
    fontSize: 24,
    fontWeight: 900,
    lineHeight: 1,
  },
} as const

export const spacing = {
  labelGap: 4,
  outlineWidth: 5,
} as const

export const components = {
  scoreLabel: {
    textColor: '#ffffff',
    backgroundColor: '#0e0e10',
    typography: {
      fontFamily: 'system-ui',
      fontSize: '24px',
      fontWeight: 900,
      lineHeight: 1,
    },
  },
  nameLabel: {
    backgroundColor: '#0e0e10',
    typography: {
      fontFamily: 'system-ui',
      fontSize: '26px',
      fontWeight: 900,
      lineHeight: 1,
      letterSpacing: '0.04em',
    },
  },
  figure: {
    backgroundColor: '#f1c27d',
    width: 48,
    height: 72,
  },
  figureHelmet: {
    backgroundColor: '#3a3f4b',
  },
  figureGoggles: {
    backgroundColor: '#7fd3ff',
  },
  figureBoots: {
    backgroundColor: '#2a2a2a',
  },
  glider: {
    backgroundColor: '#eef1f5',
    width: 144,
    height: 52,
  },
  gliderStripe: {
    backgroundColor: '#ff5a36',
  },
  gliderShade: {
    backgroundColor: '#b9c0cc',
  },
  emote: {
    height: 72,
  },
  targetPad: {
    backgroundColor: '#d7263d',
    width: 260,
    height: 60,
  },
  targetPadRing: {
    backgroundColor: '#f5f5f5',
  },
  targetPadRim: {
    backgroundColor: '#8c1c2b',
  },
  waterZone: {
    backgroundColor: '#1e6fd9',
    height: 80,
  },
  waterZoneCrest: {
    backgroundColor: '#5fb3ff',
  },
  lavaZone: {
    backgroundColor: '#ff5a1f',
    height: 80,
  },
  lavaZoneGlow: {
    backgroundColor: '#ffc23d',
  },
  lavaZoneCrust: {
    backgroundColor: '#5a1a0b',
  },
  customPad: {
    height: 100,
  },
  customZone: {
    height: 88,
  },
} as const
