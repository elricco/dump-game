import { PARAMS, type Config } from './config'

const same = (a: unknown, b: unknown) =>
  Array.isArray(a) && Array.isArray(b) ? a.join(',') === b.join(',') : a === b

/** Config → Query-String mit dem Kanal und nur den Werten, die vom Standard abweichen. */
export function serializeConfig(config: Config): string {
  const params = new URLSearchParams()
  for (const param of PARAMS) {
    const value = config[param.key]
    if (param.kind === 'channel') params.set(param.name, String(value))
    else if (param.kind === 'url') {
      if (value !== null) params.set(param.name, String(value))
    } else if (param.kind === 'flag') {
      if (value !== param.fallback) params.set(param.name, value ? '1' : '0')
    } else if (!same(value, param.fallback)) {
      params.set(param.name, Array.isArray(value) ? value.join(',') : String(value))
    }
  }
  return params.toString()
}

/** Parameter aus eingefügtem Text: ganze URL (Host egal) oder nur Query, mit/ohne „?". */
export function paramsFromText(text: string): URLSearchParams {
  const trimmed = text.trim()
  const url = URL.parse(trimmed)
  if (url) return url.searchParams
  return new URLSearchParams(trimmed.replace(/^\?/, ''))
}
