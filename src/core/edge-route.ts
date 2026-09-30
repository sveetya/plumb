import type { ArchitectureModel, ArchEdge, Position } from "./types"

export const MAP_NODE_WIDTH = 176
export const MAP_NODE_HEIGHT = 64

export type EdgeHandles = {
  sourceHandle: "s-left" | "s-right" | "s-top" | "s-bottom"
  targetHandle: "t-left" | "t-right" | "t-top" | "t-bottom"
}

export function nodeWorldPosition(
  nodeId: string,
  model: ArchitectureModel,
): Position {
  const node = model.nodes.find((item) => item.id === nodeId)
  if (!node) {
    return { x: 0, y: 0 }
  }
  if (!node.group) {
    return { x: node.position.x, y: node.position.y }
  }
  const group = model.groups.find((item) => item.id === node.group)
  if (!group) {
    return { x: node.position.x, y: node.position.y }
  }
  return {
    x: group.position.x + node.position.x,
    y: group.position.y + node.position.y,
  }
}

export function routeEdge(
  fromId: string,
  toId: string,
  model: ArchitectureModel,
): EdgeHandles {
  const from = nodeCenter(fromId, model)
  const to = nodeCenter(toId, model)
  const dx = to.x - from.x
  const dy = to.y - from.y
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0
      ? { sourceHandle: "s-right", targetHandle: "t-left" }
      : { sourceHandle: "s-left", targetHandle: "t-right" }
  }
  return dy >= 0
    ? { sourceHandle: "s-bottom", targetHandle: "t-top" }
    : { sourceHandle: "s-top", targetHandle: "t-bottom" }
}

export function mapEdgeLabel(
  edge: ArchEdge,
  isIncident: boolean,
): string | undefined {
  if (!isIncident) {
    return undefined
  }
  return edge.label
}

function nodeCenter(nodeId: string, model: ArchitectureModel): Position {
  const position = nodeWorldPosition(nodeId, model)
  return {
    x: position.x + MAP_NODE_WIDTH / 2,
    y: position.y + MAP_NODE_HEIGHT / 2,
  }
}
