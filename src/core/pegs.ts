import { STAGE_HEIGHT } from './stage'

export interface Peg {
  x: number
  y: number
}

const ROWS = 5
const TOP = 0.25
const BOTTOM = 0.8
const COLUMNS = 11

/** Versetztes Stift-Raster: Reihen mit 10 und 11 Stiften, gleichmäßig über die Breite. */
export function pegLayout(worldWidth: number): Peg[] {
  const spacing = worldWidth / COLUMNS
  const rowStep = ((BOTTOM - TOP) * STAGE_HEIGHT) / (ROWS - 1)
  const pegs: Peg[] = []
  for (let row = 0; row < ROWS; row++) {
    const y = TOP * STAGE_HEIGHT + row * rowStep
    const offset = row % 2 === 0
    const count = offset ? COLUMNS - 1 : COLUMNS
    for (let column = 0; column < count; column++) {
      pegs.push({ x: (column + (offset ? 1 : 0.5)) * spacing, y })
    }
  }
  return pegs
}

export interface Ball {
  x: number
  y: number
  vx: number
  vy: number
  r: number
}

/**
 * Kreis prallt an einem Stift ab: Reflexion an der Normalen (gedämpft mit
 * `restitution`), seitlicher `nudge`, herausgeschoben bis zur Berührung.
 * Ohne Berührung: null.
 */
export function bounceOffPeg(
  ball: Ball,
  peg: Peg & { r: number },
  restitution: number,
  nudge: number,
): Omit<Ball, 'r'> | null {
  const dx = ball.x - peg.x
  const dy = ball.y - peg.y
  const distance = Math.hypot(dx, dy)
  const contact = ball.r + peg.r
  if (distance >= contact) return null

  const [nx, ny] = distance === 0 ? [0, -1] : [dx / distance, dy / distance]
  const into = ball.vx * nx + ball.vy * ny
  const [vx, vy] =
    into < 0
      ? [ball.vx - (1 + restitution) * into * nx, ball.vy - (1 + restitution) * into * ny]
      : [ball.vx, ball.vy]
  return { x: peg.x + nx * contact, y: peg.y + ny * contact, vx: vx + nudge, vy }
}
