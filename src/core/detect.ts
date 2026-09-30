import type {
  ArchNode,
  ArchitectureModel,
  DetectReport,
  DetectedNode,
  NodeEvidence,
} from "./types"
import { matches } from "./match"
import { normalize } from "./paths"

export function detectFromFiles(
  model: ArchitectureModel,
  files: string[],
): DetectReport {
  const normalizedFiles = files.map(normalize)
  const nodes = model.nodes.map((node) => detectNode(node, normalizedFiles))
  return { version: 2, nodes }
}

export function evidenceByNode(report: DetectReport): Record<string, NodeEvidence> {
  return Object.fromEntries(
    report.nodes.map((node) => [
      node.id,
      {
        nodeId: node.id,
        fileCount: node.fileCount,
        detected: node.detected,
        missingAnchors: node.missingAnchors,
      },
    ]),
  )
}

function detectNode(node: ArchNode, files: string[]): DetectedNode {
  if (node.anchors.length === 0) {
    return {
      id: node.id,
      source: "declared",
      fileCount: 0,
      detected: false,
      missingAnchors: [],
    }
  }
  const matching = files.filter((file) =>
    node.anchors.some((anchor) => matches(anchor, file)),
  )
  const missingAnchors = node.anchors.filter(
    (anchor) => !files.some((file) => matches(anchor, file)),
  )
  const detected = matching.length > 0
  return {
    id: node.id,
    source: detected ? "detected" : "declared",
    fileCount: matching.length,
    detected,
    missingAnchors,
  }
}
