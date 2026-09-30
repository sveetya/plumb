import type {
  ArchNode,
  ArchitectureModel,
  CheckResult,
  FileStatus,
  FileVerdict,
  Intent,
  NodeStatus,
} from "./types"
import { matches } from "./match"
import { normalize } from "./paths"
import { resolveFileToNode } from "./resolve"

const STATUS_RANK: Record<NodeStatus, number> = {
  idle: 0,
  allowed: 1,
  unscoped: 2,
  denied: 3,
}

export function checkFiles(input: {
  model: ArchitectureModel
  intent: Intent
  files: string[]
}): CheckResult {
  const files = input.files.map((file) =>
    classifyFile(file, input.intent, input.model.nodes),
  )
  const nodeStatus = rollupNodeStatus(input.model, files)
  const counts = {
    allowed: files.filter((item) => item.status === "allowed").length,
    denied: files.filter((item) => item.status === "denied").length,
    unscoped: files.filter((item) => item.status === "unscoped").length,
  }
  const pass = counts.denied === 0 && !(input.intent.strict && counts.unscoped > 0)
  return { pass, files, nodeStatus, counts }
}

function classifyFile(
  file: string,
  intent: Intent,
  nodes: ArchNode[],
): FileVerdict {
  const normalized = normalize(file)
  const nodeId = resolveFileToNode(normalized, nodes)?.id
  if (intent.deny.some((pattern) => matches(pattern, normalized))) {
    return { file: normalized, status: "denied", nodeId, rule: "deny" }
  }
  if (intent.allow.some((pattern) => matches(pattern, normalized))) {
    return { file: normalized, status: "allowed", nodeId, rule: "allow" }
  }
  return { file: normalized, status: "unscoped", nodeId }
}

function rollupNodeStatus(
  model: ArchitectureModel,
  files: FileVerdict[],
): Record<string, NodeStatus> {
  const idle = Object.fromEntries([
    ...model.nodes.map((node) => [node.id, "idle" as NodeStatus]),
    ...model.groups.map((group) => [group.id, "idle" as NodeStatus]),
  ])
  const withLeaves = files.reduce(
    (status, verdict) => applyFileStatus(status, verdict),
    idle,
  )
  return model.groups.reduce((status, group) => {
    const childStatuses = model.nodes
      .filter((node) => node.group === group.id)
      .map((child) => status[child.id] ?? "idle")
    return {
      ...status,
      [group.id]: childStatuses.reduce(worseStatus, "idle"),
    }
  }, withLeaves)
}

function applyFileStatus(
  status: Record<string, NodeStatus>,
  verdict: FileVerdict,
): Record<string, NodeStatus> {
  if (!verdict.nodeId) {
    return status
  }
  return {
    ...status,
    [verdict.nodeId]: worseStatus(status[verdict.nodeId] ?? "idle", verdict.status),
  }
}

function worseStatus(current: NodeStatus, next: NodeStatus | FileStatus): NodeStatus {
  return STATUS_RANK[next] > STATUS_RANK[current] ? next : current
}
