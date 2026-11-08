export interface IrcLine {
  tags: Record<string, string>
  prefix: string | null
  command: string
  params: string[]
  trailing: string | null
}

const ESCAPES: Record<string, string> = { s: ' ', ':': ';', '\\': '\\', r: '\r', n: '\n' }

export function splitIrcFrame(frame: string): string[] {
  return frame.split('\r\n').filter((line) => line !== '')
}

function unescapeTagValue(value: string): string {
  return value.replace(/\\(.?)/g, (_, next: string) => ESCAPES[next] ?? next)
}

function parseTags(raw: string): Record<string, string> {
  const tags: Record<string, string> = {}
  for (const pair of raw.split(';')) {
    const separator = pair.indexOf('=')
    if (separator === -1) tags[pair] = ''
    else tags[pair.slice(0, separator)] = unescapeTagValue(pair.slice(separator + 1))
  }
  return tags
}

/** Zerlegt eine IRC-Zeile (IRCv3 mit Tags). Nur Struktur, keine Bedeutung. */
export function parseIrcLine(line: string): IrcLine | null {
  let rest = line
  if (rest === '') return null

  let tags: Record<string, string> = {}
  if (rest.startsWith('@')) {
    const end = rest.indexOf(' ')
    tags = parseTags(rest.slice(1, end))
    rest = rest.slice(end + 1)
  }

  let prefix: string | null = null
  if (rest.startsWith(':')) {
    const end = rest.indexOf(' ')
    prefix = rest.slice(1, end)
    rest = rest.slice(end + 1)
  }

  let trailing: string | null = null
  const trailingStart = rest.indexOf(' :')
  if (trailingStart !== -1) {
    trailing = rest.slice(trailingStart + 2)
    rest = rest.slice(0, trailingStart)
  }

  const [command = '', ...params] = rest.split(' ').filter((part) => part !== '')
  return { tags, prefix, command, params, trailing }
}
