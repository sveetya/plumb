import { existsSync, readdirSync, readFileSync, type Dirent } from "node:fs"
import path from "node:path"

export function joinRoot(root: string, ...segments: string[]): string {
  return path.join(/* turbopackIgnore: true */ root, ...segments)
}

export function fileExists(root: string, rel: string): boolean {
  return existsSync(joinRoot(root, rel))
}

export function readUtf8(root: string, rel: string): string {
  const filePath = joinRoot(root, rel)
  if (!existsSync(/* turbopackIgnore: true */ filePath)) {
    return ""
  }
  return readFileSync(/* turbopackIgnore: true */ filePath, "utf8")
}

export function readUtf8Required(root: string, rel: string): string {
  return readFileSync(/* turbopackIgnore: true */ joinRoot(root, rel), "utf8")
}

export function listDir(current: string): Dirent[] {
  return readdirSync(/* turbopackIgnore: true */ current, {
    withFileTypes: true,
  })
}
