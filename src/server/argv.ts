export function parseFlag(argv: string[], name: string): string | undefined {
  const index = argv.indexOf(`--${name}`)
  if (index === -1) {
    return undefined
  }
  const value = argv[index + 1]
  if (!value || value.startsWith("--")) {
    return undefined
  }
  return value
}
