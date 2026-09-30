import { readdirSync } from "node:fs"
import path from "node:path"
import { normalize } from "../core/paths"

const SKIP_DIRS = new Set(["node_modules", ".git", ".next", "dist", ".turbo"])

export function walkFiles(root: string): string[] {
  return walkDir(root, root)
}

function walkDir(root: string, current: string): string[] {
  const entries = readdirSync(current, { withFileTypes: true })
  return entries.flatMap((entry) => {
    if (SKIP_DIRS.has(entry.name)) {
      return []
    }
    const fullPath = path.join(current, entry.name)
    if (entry.isDirectory()) {
      return walkDir(root, fullPath)
    }
    if (!entry.isFile()) {
      return []
    }
    return [normalize(path.relative(root, fullPath))]
  })
}
