/** Referenz-px pro Sekunde, mit denen die Landefläche pendelt. */
export const PAD_SPEED = 120

/** Landefläche am Boden: pendelt zwischen den Rändern oder steht mittig. Koordinaten = Mitte. */
export class Pad {
  center: number
  private direction = 1

  constructor(
    private worldWidth: number,
    readonly size: { width: number; height: number },
    private readonly move: boolean,
  ) {
    this.center = worldWidth / 2
  }

  private get min(): number {
    return Math.min(this.size.width / 2, this.worldWidth / 2)
  }

  private get max(): number {
    return Math.max(this.worldWidth - this.size.width / 2, this.worldWidth / 2)
  }

  step(dt: number): void {
    if (!this.move || this.max === this.min) return
    let next = this.center + this.direction * PAD_SPEED * dt
    while (next > this.max || next < this.min) {
      if (next > this.max) next = 2 * this.max - next
      else next = 2 * this.min - next
      this.direction *= -1
    }
    this.center = next
  }

  resize(worldWidth: number): void {
    this.worldWidth = worldWidth
    this.center = this.move ? Math.min(this.max, Math.max(this.min, this.center)) : worldWidth / 2
  }
}
