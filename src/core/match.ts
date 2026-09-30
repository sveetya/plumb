import picomatch from "picomatch"
import { normalize } from "./paths"

export function matches(pattern: string, file: string): boolean {
  const normalizedPattern = normalize(pattern)
  const normalizedFile = normalize(file)
  const escaped = escapeGlobSyntax(normalizedPattern)
  if (escaped.includes("*")) {
    return globMatches(escaped, normalizedFile)
  }
  if (normalizedPattern.endsWith("/")) {
    return isPrefixMatch(normalizedPattern, normalizedFile)
  }
  return normalizedFile === normalizedPattern
}

function globMatches(pattern: string, file: string): boolean {
  if (picomatch(pattern)(file)) {
    return true
  }
  if (!pattern.includes("**/")) {
    return false
  }
  const withoutGlobstar = pattern.replaceAll("**/", "")
  return withoutGlobstar !== pattern && picomatch(withoutGlobstar)(file)
}

function escapeGlobSyntax(pattern: string): string {
  return pattern.replaceAll(/[()[\]]/g, "\\$&")
}

function isPrefixMatch(pattern: string, file: string): boolean {
  const withoutSlash = pattern.slice(0, -1)
  return file === withoutSlash || file.startsWith(pattern)
}
