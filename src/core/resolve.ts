import type { ArchNode } from "./types"
import { matches } from "./match"
import { normalize } from "./paths"

export function resolveFileToNode(
  file: string,
  nodes: ArchNode[],
): ArchNode | undefined {
  return resolveMatchingNodes(file, nodes)[0]
}

export function resolveMatchingNodes(file: string, nodes: ArchNode[]): ArchNode[] {
  const normalized = normalize(file)
  return nodes
    .filter((node) => node.anchors.length > 0)
    .map((node) => ({ node, length: longestAnchorLength(node, normalized) }))
    .filter((item) => item.length >= 0)
    .sort((left, right) => right.length - left.length)
    .map((item) => item.node)
}

function longestAnchorLength(node: ArchNode, file: string): number {
  return node.anchors.reduce((max, anchor) => {
    if (!matches(anchor, file)) {
      return max
    }
    return Math.max(max, normalize(anchor).length)
  }, -1)
}
