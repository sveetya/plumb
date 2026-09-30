import path from "node:path"
import { normalize } from "../core/paths"
import { joinRoot, listDir } from "./repo-fs"

const SKIP_DIRS = new Set(["node_modules", ".git", ".next", "dist", ".turbo"])

export function walkFiles(root: string): string[] {
  return walkDir(root, root)
}

function walkDir(root: string, current: string): string[] {
  const entries = listDir(current)
  return entries.flatMap((entry) => {
    if (SKIP_DIRS.has(entry.name)) {
      return []
    }
    const fullPath = joinRoot(current, entry.name)
    if (entry.isDirectory()) {
      return walkDir(root, fullPath)
    }
    if (!entry.isFile()) {
      return []
    }
    return [normalize(path.relative(root, fullPath))]
  })
}
