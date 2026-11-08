/** Größte Schräglage in Grad. */
export const MAX_TILT = 8
const TILT_FACTOR = 0.3

export type Facing = 1 | -1

export interface Pose {
  /** 1 = schaut nach rechts, −1 = gespiegelt nach links. */
  facing: Facing
  /** Drehung in Grad, positiv = im Uhrzeigersinn (neigt sich nach rechts). */
  tilt: number
}

/** Blickrichtung und Schräglage aus der Fluggeschwindigkeit; senkrecht → letzte Richtung, gerade. */
export function poseFor(velocity: { x: number; y: number }, previous: Facing): Pose {
  if (velocity.x === 0) return { facing: previous, tilt: 0 }
  const facing: Facing = velocity.x > 0 ? 1 : -1
  const angle = (Math.atan2(Math.abs(velocity.x), Math.max(velocity.y, 0)) * 180) / Math.PI
  return { facing, tilt: facing * Math.min(MAX_TILT, angle * TILT_FACTOR) }
}
