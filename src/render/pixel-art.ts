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
