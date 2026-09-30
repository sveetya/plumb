import type {
  ArchitectureModel,
  DetectedPattern,
  Focus,
} from "./types"
import { matches } from "./match"
import { normalize } from "./paths"
import { resolveFileToNode, resolveMatchingNodes } from "./resolve"

const FOCUS_PATH_CAP = 200

export function focusForPath(
  path: string,
  model: ArchitectureModel,
  files: string[],
): Focus {
  const normalized = normalize(path)
  const scopedFiles = filesUnder(normalized, files)
  const primary = resolveFileToNode(normalized, model.nodes)
  const matching = uniqueIds([
    ...(primary ? [primary.id] : []),
    ...resolveMatchingNodes(normalized, model.nodes).map((node) => node.id),
    ...ownersFromFiles(scopedFiles, model),
  ])
  const unmodeled = matching.length === 0
  return {
    kind: "path",
    key: normalized,
    nodeIds: matching,
    edgeIds: incidentEdgeIds(model, matching),
    paths: capPaths(scopedFiles.length > 0 ? scopedFiles : [normalized]),
    unmodeled,
  }
}

export function focusForNode(
  nodeId: string,
  model: ArchitectureModel,
  files: string[],
): Focus {
  const node = model.nodes.find((item) => item.id === nodeId)
  const paths = node
    ? files
        .map(normalize)
        .filter((file) => node.anchors.some((anchor) => matches(anchor, file)))
    : []
  const nodeIds = node ? [node.id] : []
  return {
    kind: "node",
    key: nodeId,
    nodeIds,
    edgeIds: incidentEdgeIds(model, nodeIds),
    paths: capPaths(paths),
    unmodeled: !node,
  }
}

export function focusForPattern(
  patternId: string,
  model: ArchitectureModel,
  files: string[],
  patterns: DetectedPattern[],
): Focus {
  const pattern = patterns.find((item) => item.id === patternId)
  const nodeIds = pattern?.nodeIds ?? []
  const paths = nodeIds.flatMap((id) => focusForNode(id, model, files).paths)
  return {
    kind: "pattern",
    key: patternId,
    nodeIds,
    edgeIds: incidentEdgeIds(model, nodeIds),
    paths: capPaths(unique(paths)),
    unmodeled: !pattern,
  }
}

export function edgeId(from: string, to: string, kind?: string): string {
  return kind ? `${from}-${to}-${kind}` : `${from}-${to}`
}

function incidentEdgeIds(model: ArchitectureModel, nodeIds: string[]): string[] {
  const idSet = new Set(nodeIds)
  return model.edges
    .filter((edge) => idSet.has(edge.from) || idSet.has(edge.to))
    .map((edge) => edgeId(edge.from, edge.to, edge.kind))
}

function ownersFromFiles(files: string[], model: ArchitectureModel): string[] {
  return files.flatMap((file) => {
    const owner = resolveFileToNode(file, model.nodes)
    return owner ? [owner.id] : []
  })
}

function filesUnder(path: string, files: string[]): string[] {
  const normalized = normalize(path)
  const prefix = normalized.endsWith("/") ? normalized : `${normalized}/`
  const exact = files.map(normalize).filter((file) => file === normalized)
  if (exact.length > 0 && looksLikeFile(normalized)) {
    return exact
  }
  const nested = files
    .map(normalize)
    .filter((file) => file === normalized || file.startsWith(prefix))
  return nested.length > 0 ? nested : exact
}

function looksLikeFile(path: string): boolean {
  const last = path.split("/").at(-1) ?? ""
  return last.includes(".")
}

function capPaths(paths: string[]): string[] {
  return paths.slice(0, FOCUS_PATH_CAP)
}

function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids)]
}

function unique(values: string[]): string[] {
  return [...new Set(values)]
}
