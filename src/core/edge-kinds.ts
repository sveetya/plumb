import type { EdgeKind } from "./types"

export type EdgeKindStyle = {
  color: string
  label: string
  dash: "solid" | "dashed"
  strokeDasharray?: string
  optionalOpacity: number
}

export const EDGE_KINDS: Record<EdgeKind, EdgeKindStyle> = {
  http: {
    color: "#3b82f6",
    label: "HTTP",
    dash: "solid",
    optionalOpacity: 0.55,
  },
  sql: {
    color: "#10b981",
    label: "SQL",
    dash: "solid",
    optionalOpacity: 0.55,
  },
  writes: {
    color: "#f59e0b",
    label: "writes",
    dash: "solid",
    optionalOpacity: 0.55,
  },
  event: {
    color: "#8b5cf6",
    label: "event",
    dash: "dashed",
    strokeDasharray: "6 4",
    optionalOpacity: 0.55,
  },
  imports: {
    color: "#71717a",
    label: "imports",
    dash: "dashed",
    strokeDasharray: "6 4",
    optionalOpacity: 0.55,
  },
}
