// Automatisch erzeugt aus DESIGN.md – nicht von Hand aendern (pnpm design:tokens).
export const colors = {
  primary: '#ffffff',
  outline: '#0e0e10',
  skin: '#f1c27d',
  skinShadow: '#c98f52',
  helmet: '#3a3f4b',
  helmetLight: '#626b80',
  helmetShadow: '#22252d',
  goggles: '#3fa9f5',
  gogglesGlint: '#d9f4ff',
  gloves: '#f2efe6',
  belt: '#1b1b1f',
  boots: '#2a2a2a',
  bootsLight: '#55555c',
  glider: '#eef1f5',
  gliderStripe: '#ff5a36',
  gliderShade: '#b9c0cc',
  targetRed: '#d7263d',
  targetWhite: '#f5f5f5',
  targetRim: '#8c1c2b',
  water: '#1e6fd9',
  waterLight: '#5fb3ff',
  waterDeep: '#14519f',
  lava: '#ff5a1f',
  lavaDeep: '#c7360d',
  lavaGlow: '#ffc23d',
  lavaCrust: '#5a1a0b',
} as const

export const typography = {
  name: {
    fontFamily: 'Press Start 2P',
    fontSize: 16,
    fontWeight: 400,
    lineHeight: 1,
    letterSpacing: 0,
  },
  score: {
    fontFamily: 'Press Start 2P',
    fontSize: 16,
    fontWeight: 400,
    lineHeight: 1,
  },
} as const

export const spacing = {
  labelGap: 4,
  outlineWidth: 4,
} as const

export const components = {
  scoreLabel: {
    textColor: '#ffffff',
    backgroundColor: '#0e0e10',
    typography: {
      fontFamily: 'Press Start 2P',
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: 1,
    },
  },
  nameLabel: {
    backgroundColor: '#0e0e10',
    typography: {
      fontFamily: 'Press Start 2P',
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: 1,
      letterSpacing: '0px',
    },
  },
  figure: {
    backgroundColor: '#f1c27d',
    width: 54,
    height: 72,
  },
  figureSkinShadow: {
    backgroundColor: '#c98f52',
  },
  figureHelmet: {
    backgroundColor: '#3a3f4b',
  },
  figureHelmetLight: {
    backgroundColor: '#626b80',
  },
  figureHelmetShadow: {
    backgroundColor: '#22252d',
  },
  figureGoggles: {
    backgroundColor: '#3fa9f5',
  },
  figureGogglesGlint: {
    backgroundColor: '#d9f4ff',
  },
  figureGloves: {
    backgroundColor: '#f2efe6',
  },
  figureBelt: {
    backgroundColor: '#1b1b1f',
  },
  figureBoots: {
    backgroundColor: '#2a2a2a',
  },
  figureBootsLight: {
    backgroundColor: '#55555c',
  },
  glider: {
    backgroundColor: '#eef1f5',
    width: 150,
    height: 54,
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
    width: 268,
    height: 68,
  },
  targetPadSurface: {
    height: 26,
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
  waterZoneDeep: {
    backgroundColor: '#14519f',
  },
  lavaZone: {
    backgroundColor: '#ff5a1f',
    height: 80,
  },
  lavaZoneDeep: {
    backgroundColor: '#c7360d',
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
