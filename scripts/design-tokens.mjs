// Erzeugt src/generated/design-tokens.ts aus dem YAML-Kopf der DESIGN.md.
// DESIGN.md bleibt die einzige Quelle; mit --check schlaegt das Skript fehl,
// wenn die erzeugte Datei veraltet ist (laeuft in `pnpm lint`).
import { readFileSync, writeFileSync } from 'node:fs'
import { format, resolveConfig } from 'prettier'
import { parse } from 'yaml'

const SOURCE = 'DESIGN.md'
const TARGET = 'src/generated/design-tokens.ts'

const frontmatter = readFileSync(SOURCE, 'utf8').split(/^---$/m)[1]
const tokens = parse(frontmatter)

const resolve = (value) => {
  if (typeof value !== 'string') return value
  const ref = /^\{(.+)\}$/.exec(value)
  if (ref) return resolve(ref[1].split('.').reduce((node, key) => node?.[key], tokens))
  const px = /^(-?[\d.]+)px$/.exec(value)
  return px ? Number(px[1]) : value
}

const resolveAll = (group) =>
  Object.fromEntries(
    Object.entries(group ?? {}).map(([key, value]) => [
      key,
      typeof value === 'object' && value !== null ? resolveAll(value) : resolve(value),
    ]),
  )

const raw = `// Automatisch erzeugt aus ${SOURCE} – nicht von Hand aendern (pnpm design:tokens).
export const colors = ${JSON.stringify(tokens.colors, null, 2)} as const

export const typography = ${JSON.stringify(resolveAll(tokens.typography), null, 2)} as const

export const spacing = ${JSON.stringify(resolveAll(tokens.spacing), null, 2)} as const

export const components = ${JSON.stringify(resolveAll(tokens.components), null, 2)} as const
`

const output = await format(raw, { ...(await resolveConfig(TARGET)), filepath: TARGET })

if (process.argv.includes('--check')) {
  let current = ''
  try {
    current = readFileSync(TARGET, 'utf8')
  } catch {
    // fehlt → veraltet
  }
  if (current !== output) {
    console.error(`${TARGET} ist veraltet – pnpm design:tokens ausfuehren.`)
    process.exit(1)
  }
} else {
  writeFileSync(TARGET, output)
}
