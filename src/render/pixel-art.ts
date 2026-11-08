const EMPTY = '.'
const OUTLINE = 'o'

/**
 * Legt einen 1-Pixel-Rand um ein Pixel-Raster und färbt jedes leere Feld,
 * das (waagerecht/senkrecht) an ein gefülltes grenzt, als Kontur.
 */
export function withOutline(rows: readonly string[]): string[] {
  const width = (rows[0]?.length ?? 0) + 2
  const padded = [
    EMPTY.repeat(width),
    ...rows.map((row) => `${EMPTY}${row}${EMPTY}`),
    EMPTY.repeat(width),
  ]
  const filled = (y: number, x: number) => {
    const cell = padded[y]?.[x]
    return cell !== undefined && cell !== EMPTY
  }
  return padded.map((row, y) =>
    [...row]
      .map((cell, x) => {
        if (cell !== EMPTY) return cell
        const touches = filled(y - 1, x) || filled(y + 1, x) || filled(y, x - 1) || filled(y, x + 1)
        return touches ? OUTLINE : EMPTY
      })
      .join(''),
  )
}

/** Raster aus einer Funktion, die je Pixel ein Zeichen liefert. */
export function rasterize(
  width: number,
  height: number,
  pixel: (x: number, y: number) => string,
): string[] {
  return Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => pixel(x, y)).join(''),
  )
}

export interface PixelRun {
  x: number
  y: number
  width: number
  fill: string
}

/** Gleichfarbige Nachbarn einer Zeile werden zu einem Rechteck – weniger DOM-Knoten. */
export function pixelRuns(rows: readonly string[], palette: Record<string, string>): PixelRun[] {
  const runs: PixelRun[] = []
  rows.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      const fill = palette[row[x] ?? '']
      let end = x + 1
      while (end < row.length && row[end] === row[x]) end++
      if (fill) runs.push({ x, y, width: end - x, fill })
      x = end
    }
  })
  return runs
}
