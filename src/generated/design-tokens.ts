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
  peg: '#aeb6c4',
  pegLight: '#f4f6fa',
  pegShadow: '#6b7383',
  pageBg: '#14161c',
  surface: '#1f222c',
  text: '#eef1f5',
  muted: '#b4bccb',
  danger: '#ff8a80',
  border: '#4a5060',
} as const

export const typography = {
  name: {
    fontFamily: 'Press Start 2P',
    fontSize: 8,
    fontWeight: 400,
    lineHeight: 1,
    letterSpacing: 0,
  },
  score: {
    fontFamily: 'Press Start 2P',
    fontSize: 8,
    fontWeight: 400,
    lineHeight: 1,
  },
  configTitle: {
    fontFamily: 'Press Start 2P',
    fontSize: 24,
    fontWeight: 400,
    lineHeight: 1.4,
  },
  configHeading: {
    fontFamily: 'Press Start 2P',
    fontSize: 12,
    fontWeight: 400,
    lineHeight: 1.6,
  },
  configBody: {
    fontFamily: 'system-ui',
    fontSize: 16,
    fontWeight: 400,
    lineHeight: 1.5,
  },
  configLabel: {
    fontFamily: 'system-ui',
    fontSize: 15,
    fontWeight: 600,
    lineHeight: 1.4,
  },
  configCode: {
    fontFamily: 'ui-monospace',
    fontSize: 14,
    fontWeight: 400,
    lineHeight: 1.5,
  },
} as const

export const spacing = {
  labelGap: 2,
  outlineWidth: 2,
  scoreboardInset: 16,
  configGap: 16,
  configSection: 24,
  configFocus: 3,
} as const

export const components = {
  scoreLabel: {
    textColor: '#ffffff',
    backgroundColor: '#0e0e10',
    typography: {
      fontFamily: 'Press Start 2P',
      fontSize: '8px',
      fontWeight: 400,
      lineHeight: 1,
    },
  },
  nameLabel: {
    backgroundColor: '#0e0e10',
    typography: {
      fontFamily: 'Press Start 2P',
      fontSize: '8px',
      fontWeight: 400,
      lineHeight: 1,
      letterSpacing: '0px',
    },
  },
  figure: {
    backgroundColor: '#f1c27d',
    width: 27,
    height: 36,
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
    width: 75,
    height: 27,
  },
  gliderStripe: {
    backgroundColor: '#ff5a36',
  },
  gliderShade: {
    backgroundColor: '#b9c0cc',
  },
  emote: {
    height: 36,
  },
  targetPad: {
    backgroundColor: '#d7263d',
    width: 134,
    height: 34,
  },
  targetPadSurface: {
    height: 13,
  },
  targetPadRing: {
    backgroundColor: '#f5f5f5',
  },
  targetPadRim: {
    backgroundColor: '#8c1c2b',
  },
  waterZone: {
    backgroundColor: '#1e6fd9',
    height: 40,
  },
  waterZoneCrest: {
    backgroundColor: '#5fb3ff',
  },
  waterZoneDeep: {
    backgroundColor: '#14519f',
  },
  lavaZone: {
    backgroundColor: '#ff5a1f',
    height: 40,
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
    height: 50,
  },
  customZone: {
    height: 44,
  },
  peg: {
    backgroundColor: '#aeb6c4',
    width: 18,
    height: 18,
  },
  pegLight: {
    backgroundColor: '#f4f6fa',
  },
  pegShadow: {
    backgroundColor: '#6b7383',
  },
  configPage: {
    backgroundColor: '#14161c',
    textColor: '#eef1f5',
    typography: {
      fontFamily: 'system-ui',
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: 1.5,
    },
  },
  configPanel: {
    backgroundColor: '#1f222c',
    textColor: '#eef1f5',
  },
  configHelp: {
    backgroundColor: '#1f222c',
    textColor: '#b4bccb',
  },
  configError: {
    backgroundColor: '#1f222c',
    textColor: '#ff8a80',
  },
  configField: {
    backgroundColor: '#0e0e10',
    textColor: '#eef1f5',
  },
  configButton: {
    backgroundColor: '#d7263d',
    textColor: '#ffffff',
    typography: {
      fontFamily: 'system-ui',
      fontSize: '15px',
      fontWeight: 600,
      lineHeight: 1.4,
    },
  },
  configTitle: {
    backgroundColor: '#14161c',
    textColor: '#ff5a36',
    typography: {
      fontFamily: 'Press Start 2P',
      fontSize: '24px',
      fontWeight: 400,
      lineHeight: 1.4,
    },
  },
  configHeading: {
    backgroundColor: '#1f222c',
    textColor: '#ffc23d',
    typography: {
      fontFamily: 'Press Start 2P',
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: 1.6,
    },
  },
  configCode: {
    backgroundColor: '#0e0e10',
    textColor: '#5fb3ff',
    typography: {
      fontFamily: 'ui-monospace',
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: 1.5,
    },
  },
  configFocus: {
    backgroundColor: '#ffc23d',
  },
  configBorder: {
    backgroundColor: '#4a5060',
  },
} as const
