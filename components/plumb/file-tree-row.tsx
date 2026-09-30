"use client"

import { ChevronRightIcon, FileIcon, FolderIcon } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { TreeEntry } from "@/src/core/types"

export function ownerColor(id: string): string {
  let hash = 0
  for (const char of id) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  }
  return `hsl(${hash % 360} 62% 46%)`
}

export function FileTreeRow({
  entry,
  depth,
  openPaths,
  selectedPath,
  focusedPaths,
  onOpenChange,
  onSelect,
}: {
  entry: TreeEntry
  depth: number
  openPaths: ReadonlySet<string>
  selectedPath: string | null
  focusedPaths: ReadonlySet<string>
  onOpenChange: (path: string, open: boolean) => void
  onSelect: (path: string) => void
}) {
  const dir = entry.kind === "dir"
  const open = openPaths.has(entry.path)
  const selected = selectedPath === entry.path
  const focused = focusedPaths.has(entry.path)
  const owners = ownerIds(entry)
  const children = dir && open ? entry.children : []
  const rowClass = cn(
    "flex w-full items-center gap-1 rounded-md pr-1 text-left text-xs hover:bg-muted/80",
    (selected || focused) && "bg-muted",
  )

  const row = (
    <div className={rowClass} style={{ paddingLeft: 6 + depth * 10 }}>
      {dir ? (
        <CollapsibleTrigger
          className="flex size-5 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
          aria-label={open ? "Collapse folder" : "Expand folder"}
        >
          <ChevronRightIcon
            className={cn("size-3.5 transition-transform", open && "rotate-90")}
          />
        </CollapsibleTrigger>
      ) : (
        <span className="size-5 shrink-0" />
      )}
      <button
        type="button"
        data-testid={`tree-${entry.path}`}
        data-path={entry.path}
        className="flex min-w-0 flex-1 items-center gap-1.5 py-0.5"
        onClick={() => onSelect(entry.path)}
      >
        {dir ? (
          <FolderIcon className="size-3.5 shrink-0 text-muted-foreground" />
        ) : (
          <FileIcon className="size-3.5 shrink-0 text-muted-foreground" />
        )}
        <span className="truncate">{entry.name || entry.path || "/"}</span>
      </button>
      <OwnerDots owners={owners} />
    </div>
  )

  if (!dir) {
    return row
  }

  return (
    <Collapsible
      open={open}
      onOpenChange={(nextOpen) => onOpenChange(entry.path, nextOpen)}
    >
      {row}
      <CollapsibleContent>
        {children.map((child) => (
          <FileTreeRow
            key={child.path}
            entry={child}
            depth={depth + 1}
            openPaths={openPaths}
            selectedPath={selectedPath}
            focusedPaths={focusedPaths}
            onOpenChange={onOpenChange}
            onSelect={onSelect}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}

function OwnerDots({ owners }: { owners: string[] }) {
  if (owners.length === 0) return null
  const shown = owners.slice(0, 4)
  return (
    <span className="flex shrink-0 items-center gap-0.5">
      {shown.map((owner) => (
        <Tooltip key={owner}>
          <TooltipTrigger className="inline-flex">
            <span
              aria-label={owner}
              className="inline-block size-1.5 rounded-full"
              style={{ backgroundColor: ownerColor(owner) }}
            />
          </TooltipTrigger>
          <TooltipContent>{owner}</TooltipContent>
        </Tooltip>
      ))}
      {owners.length > 4 ? (
        <span className="text-[10px] text-muted-foreground">
          +{owners.length - 4}
        </span>
      ) : null}
    </span>
  )
}

export function isDir(entry: TreeEntry): boolean {
  return entry.kind === "dir"
}

function ownerIds(entry: TreeEntry): string[] {
  if (entry.ownerId) return [entry.ownerId]
  return Object.keys(entry.ownerCounts).sort()
}
