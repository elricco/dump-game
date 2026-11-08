import type { Config } from '../core/config'
import type { GameSizes } from '../core/game'
import { components } from '../generated/design-tokens'

/** Fallback, falls das custom-Bild nicht lädt (Seitenverhältnis wie Tims Kommode). */
const CUSTOM_FALLBACK_RATIO = 256 / 100

async function imageRatio(url: string): Promise<number> {
  const image = new Image()
  image.src = url
  try {
    await image.decode()
    return image.naturalWidth / image.naturalHeight || CUSTOM_FALLBACK_RATIO
  } catch {
    return CUSTOM_FALLBACK_RATIO
  }
}

/** Größen für das Spiel aus DESIGN.md; bei custom nach dem Seitenverhältnis des Bildes. */
export async function themeSizes(config: Config): Promise<GameSizes> {
  // Breite = Gleiter, damit am Rand nichts abgeschnitten wird; Höhe = Figur.
  const figure = { width: components.glider.width, height: components.figure.height }
  if (config.theme === 'custom' && config.land) {
    const height = components.customPad.height
    return {
      figure,
      pad: {
        width: height * (await imageRatio(config.land)),
        height,
        surface: height * config.landSurface,
      },
      death: {
        height: components.customZone.height,
        surface: components.customZone.height * config.deathSurface,
      },
    }
  }
  return {
    figure,
    pad: {
      width: components.targetPad.width,
      height: components.targetPad.height,
      surface: components.targetPadSurface.height,
    },
    // Wasser/Lava: Tote sinken bis zur Mitte der Zone.
    death: { height: components.waterZone.height, surface: components.waterZone.height / 2 },
  }
}
