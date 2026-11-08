/** Prozentzahl im deutschen Format, höchstens zwei Nachkommastellen: 98,96 % */
export function formatScore(score: number): string {
  return `${score.toLocaleString('de-DE', { maximumFractionDigits: 2 })} %`
}
