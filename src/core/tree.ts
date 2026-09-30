import type { ArchNode, ArchitectureModel, TreeEntry } from "./types"
import { normalize } from "./paths"
import { resolveFileToNode } from "./resolve"

export function buildTree(files: string[], model: ArchitectureModel): TreeEntry {
  const root: TreeEntry = {
    name: "",
    path: "",
    kind: "dir",
    ownerCounts: {},
    children: [],
  }
  return files.map(normalize).reduce((tree, file) => {
    const ownerId = resolveFileToNode(file, model.nodes)?.id
    return insertPath(tree, file.split("/").filter(Boolean), ownerId)
  }, root)
}

export function listUnmodeledFolders(files: string[], nodes: ArchNode[]): string[] {
  const srcFiles = files
    .map(normalize)
    .filter((file) => file === "src" || file.startsWith("src/"))
  const unowned = srcFiles.filter((file) => !resolveFileToNode(file, nodes))
  const candidates = unique(
    unowned.flatMap((file) => ancestorDirs(file)).filter((dir) => dir !== "src/"),
  )
  const unmodeled = candidates.filter((dir) => {
    const under = srcFiles.filter((file) => file.startsWith(dir))
    return under.length > 0 && under.every((file) => !resolveFileToNode(file, nodes))
  })
  return unmodeled
    .filter(
      (dir) =>
        !unmodeled.some(
          (other) => other !== dir && dir.startsWith(other),
        ),
    )
    .sort()
}

function insertPath(
  node: TreeEntry,
  parts: string[],
  ownerId: string | undefined,
): TreeEntry {
  if (parts.length === 0) {
    return node
  }
  const [head, ...rest] = parts
  const isLeaf = rest.length === 0
  const childPath = node.path ? `${node.path}/${head}` : head
  const existing = node.children.find((child) => child.name === head)
  const baseChild: TreeEntry = existing ?? {
    name: head,
    path: childPath,
    kind: isLeaf ? "file" : "dir",
    ownerCounts: {},
    children: [],
  }
  const withDescendants = isLeaf
    ? withOwner(baseChild, ownerId)
    : insertPath(baseChild, rest, ownerId)
  const nextChildren = upsertChild(node.children, withDescendants)
  const ownerCounts = nextChildren.reduce(
    (acc, child) => mergeCounts(acc, child.ownerCounts),
    {} as Record<string, number>,
  )
  return {
    ...node,
    ownerCounts,
    ownerId: uniqueOwner(ownerCounts),
    children: sortEntries(nextChildren),
  }
}

function withOwner(entry: TreeEntry, ownerId: string | undefined): TreeEntry {
  if (!ownerId) {
    return { ...entry, ownerCounts: {}, ownerId: undefined }
  }
  return {
    ...entry,
    ownerId,
    ownerCounts: { [ownerId]: 1 },
  }
}

function upsertChild(children: TreeEntry[], next: TreeEntry): TreeEntry[] {
  const index = children.findIndex((child) => child.name === next.name)
  if (index === -1) {
    return [...children, next]
  }
  return children.map((child, i) => (i === index ? next : child))
}

function mergeCounts(
  left: Record<string, number>,
  right: Record<string, number>,
): Record<string, number> {
  return Object.keys(right).reduce(
    (acc, key) => ({ ...acc, [key]: (acc[key] ?? 0) + right[key] }),
    left,
  )
}

function uniqueOwner(counts: Record<string, number>): string | undefined {
  const keys = Object.keys(counts)
  return keys.length === 1 ? keys[0] : undefined
}

function sortEntries(entries: TreeEntry[]): TreeEntry[] {
  return [...entries].sort((left, right) => {
    if (left.kind !== right.kind) {
      return left.kind === "dir" ? -1 : 1
    }
    return left.name.localeCompare(right.name)
  })
}

function ancestorDirs(file: string): string[] {
  const parts = file.split("/")
  return parts.slice(0, -1).map((_, index) => `${parts.slice(0, index + 1).join("/")}/`)
}

function unique(values: string[]): string[] {
  return [...new Set(values)]
}
