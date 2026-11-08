/** Die Standardfarben, die Twitch Nutzern ohne eigene Farbe gibt. */
export const DEFAULT_COLORS = [
  '#ff0000',
  '#0000ff',
  '#008000',
  '#b22222',
  '#ff7f50',
  '#9acd32',
  '#ff4500',
  '#2e8b57',
  '#daa520',
  '#d2691e',
  '#5f9ea0',
  '#1e90ff',
  '#ff69b4',
  '#8a2be2',
  '#00ff7f',
] as const

/** Chatfarbe oder – wie bei Twitch – eine feste Palettenfarbe je Login. */
export function playerColor(login: string, chatColor: string | null): string {
  if (chatColor) return chatColor
  let hash = 0
  for (const char of login) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return DEFAULT_COLORS[hash % DEFAULT_COLORS.length] ?? DEFAULT_COLORS[0]
}
