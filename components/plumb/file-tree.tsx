"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { TreeEntry } from "@/src/core/types"
import { FileTreeRow, isDir } from "./file-tree-row"

const DEFAULT_OPEN = ["", ".", "src", "src/app", "src/queries"]
const FOCUS_PATH_CAP = 200

export function FileTree({
  tree,
  unmodeled,
  selectedPath,
  focusPaths,
  onSelectPath,
}: {
  tree: TreeEntry
  unmodeled: string[]
  selectedPath: string | null
  focusPaths: string[]
  onSelectPath: (path: string) => void
}) {
  const [query, setQuery] = useState("")
  const [unmodeledOnly, setUnmodeledOnly] = useState(false)
  const [openPaths, setOpenPaths] = useState(() => new Set(DEFAULT_OPEN))
  const unmodeledSet = useMemo(() => new Set(unmodeled), [unmodeled])
  const focusedPaths = useMemo(
    () => new Set(focusPaths.slice(0, FOCUS_PATH_CAP)),
    [focusPaths],
  )

  const visible = useMemo(
    () => filterTree(tree, query, unmodeledOnly, unmodeledSet),
    [query, tree, unmodeledOnly, unmodeledSet],
  )

  useEffect(() => {
    setOpenPaths((current) => {
      const next = new Set(current)
      for (const path of DEFAULT_OPEN) next.add(path)
      next.add(tree.path)
      for (const path of focusPaths.slice(0, FOCUS_PATH_CAP)) {
        for (const ancestor of ancestorsOf(path)) {
          next.add(ancestor)
        }
      }
      if (query.trim().length > 0 && visible) {
        for (const path of dirPaths(visible)) next.add(path)
      }
      return next
    })
  }, [focusPaths, query, tree.path, visible])

  const onOpenChange = (path: string, nextOpen: boolean) => {
    setOpenPaths((current) => {
      const next = new Set(current)
      if (nextOpen) next.add(path)
      else next.delete(path)
      return next
    })
  }

  const rows = visible
    ? isDir(visible) && (visible.path === "" || visible.path === ".")
      ? (visible.children ?? [])
      : [visible]
    : []

  return (
    <aside
      data-testid="file-tree"
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border bg-card"
    >
      <div className="flex flex-col gap-2 border-b p-3">
        <Input
          data-testid="file-tree-filter"
          placeholder="Filter files…"
          value={query}
          onValueChange={setQuery}
          onChange={(event) => setQuery(event.currentTarget.value)}
        />
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            data-testid="unmodeled-filter"
            checked={unmodeledOnly}
            onChange={(event) => setUnmodeledOnly(event.target.checked)}
          />
          Unmodeled only
        </label>
      </div>
      <div className="min-h-0 flex-1">
        <ScrollArea className="h-full">
          <div className="p-1 pb-3">
            {rows.map((entry) => (
              <FileTreeRow
                key={entry.path || entry.name}
                entry={entry}
                depth={0}
                openPaths={openPaths}
                selectedPath={selectedPath}
                focusedPaths={focusedPaths}
                onOpenChange={onOpenChange}
                onSelect={onSelectPath}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    </aside>
  )
}

function filterTree(
  entry: TreeEntry,
  query: string,
  unmodeledOnly: boolean,
  unmodeled: ReadonlySet<string>,
): TreeEntry | null {
  const q = query.trim().toLowerCase()
  if (q.length === 0 && !unmodeledOnly) {
    return entry
  }
  const childMatches = (entry.children ?? [])
    .map((child) => filterTree(child, query, unmodeledOnly, unmodeled))
    .filter((child): child is TreeEntry => child !== null)
  const nameHit =
    q.length === 0 ||
    entry.path.toLowerCase().includes(q) ||
    entry.name.toLowerCase().includes(q)
  const selfUnmodeled = !entry.ownerId || unmodeled.has(entry.path)
  if (unmodeledOnly && !selfUnmodeled && childMatches.length === 0) {
    return null
  }
  if (q.length > 0 && !nameHit && childMatches.length === 0) {
    return null
  }
  if (!isDir(entry)) {
    return entry
  }
  return { ...entry, children: childMatches }
}

function ancestorsOf(path: string): string[] {
  const parts = path.split("/").filter((part) => part.length > 0)
  const out = [""]
  for (let i = 1; i < parts.length; i += 1) {
    out.push(parts.slice(0, i).join("/"))
  }
  return out
}

function dirPaths(entry: TreeEntry): string[] {
  if (!isDir(entry)) return []
  return [
    entry.path,
    ...(entry.children ?? []).flatMap((child) => dirPaths(child)),
  ]
}
