export function svgWithClass(svg: string, className: string): string {
  const trimmed = svg.trim()
  if (!trimmed.startsWith("<svg")) {
    return trimmed
  }
  const safeClass = className.replaceAll(/["<>]/g, "")
  if (/\bclass=/.test(trimmed)) {
    return trimmed.replace(
      /class=(["'])([^"']*)\1/,
      (_match, quote: string, existing: string) =>
        `class=${quote}${existing} ${safeClass}${quote}`,
    )
  }
  return trimmed.replace("<svg", `<svg class="${safeClass}"`)
}
