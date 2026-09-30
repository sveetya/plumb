"use client"

import { useEffect, useMemo, useState } from "react"
import { X } from "lucide-react"
import { useTheme } from "next-themes"
import {
  Background,
  Controls,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { Button } from "@/components/ui/button"
import { EDGE_KINDS } from "@/src/core/edge-kinds"
import { mapEdgeLabel, routeEdge } from "@/src/core/edge-route"
import { edgeId } from "@/src/core/focus"
import type { Focus, NodeStatus, RepoSnapshot } from "@/src/core/types"
import { EdgeLegend } from "./edge-legend"
import { GroupNode } from "./group-node"
import { PlumbNode, type PlumbFlowNode } from "./plumb-node"

const nodeTypes = { plumb: PlumbNode, group: GroupNode }

const IDLE_NODE_STATUS = {}

export function MapCanvas({
  snapshot,
  focus,
  nodeStatus = IDLE_NODE_STATUS,
  hasSelection = false,
  onSelectNode,
  onClearFocus,
}: {
  snapshot: RepoSnapshot
  focus: Focus
  nodeStatus?: Record<string, NodeStatus>
  hasSelection?: boolean
  onSelectNode: (nodeId: string) => void
  onClearFocus?: () => void
}) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  const colorMode = mounted && resolvedTheme === "dark" ? "dark" : "light"

  const nodes = useMemo(
    () => toFlowNodes(snapshot, focus, nodeStatus),
    [focus, nodeStatus, snapshot],
  )
  const edges = useMemo(
    () => toFlowEdges(snapshot, focus),
    [focus, snapshot],
  )
  const focusKey = `${focus.kind}:${focus.key}:${focus.nodeIds.join("|")}`

  return (
    <ReactFlowProvider>
      <div
        className="relative h-full min-h-0 w-full overflow-hidden rounded-xl border bg-muted/20"
        data-testid="map-canvas"
      >
        <ReactFlow
          className="h-full w-full"
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable
          fitView
          minZoom={0.2}
          maxZoom={1.5}
          colorMode={colorMode}
          defaultEdgeOptions={{ type: "smoothstep" }}
          proOptions={{ hideAttribution: true }}
          onNodeClick={(_event, node) => {
            if (node.type === "group") return
            onSelectNode(node.id)
          }}
        >
          <FitOnFocus focusKey={focusKey} nodeIds={focus.nodeIds} />
          <Background />
          <Controls showInteractive={false} className="border-border bg-card shadow-none" />
        </ReactFlow>
        {hasSelection ? (
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            data-testid="clear-focus"
            aria-label="Clear selection"
            className="absolute top-3 right-3 z-10 bg-card shadow-sm"
            onClick={onClearFocus}
          >
            <X />
          </Button>
        ) : null}
        <EdgeLegend />
      </div>
    </ReactFlowProvider>
  )
}

function FitOnFocus({
  focusKey,
  nodeIds,
}: {
  focusKey: string
  nodeIds: string[]
}) {
  const { fitView } = useReactFlow()
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      void fitView({
        padding: 0.28,
        duration: 220,
        ...(nodeIds.length > 0
          ? { nodes: nodeIds.map((id) => ({ id })) }
          : {}),
      })
    })
    return () => cancelAnimationFrame(frame)
  }, [fitView, focusKey, nodeIds])
  return null
}

function toFlowNodes(
  snapshot: RepoSnapshot,
  focus: Focus,
  nodeStatus: Record<string, NodeStatus>,
): Node[] {
  const active = focus.nodeIds.length > 0 || focus.unmodeled
  const focused = new Set(focus.nodeIds)
  const groupNodes: Node[] = snapshot.model.groups.map((group) => ({
    id: group.id,
    type: "group",
    position: group.position,
    style: {
      width: group.size.width,
      height: group.size.height,
      zIndex: -1,
    },
    data: { label: group.label },
    draggable: false,
    selectable: false,
    zIndex: -1,
  }))

  const plumbNodes: PlumbFlowNode[] = snapshot.model.nodes.map((node) => {
    const groupId = node.group
    const isFocused = focused.has(node.id)
    return {
      id: node.id,
      type: "plumb",
      position: node.position,
      ...(groupId ? { parentId: groupId, extent: "parent" as const } : {}),
      data: {
        label: node.label,
        kind: node.kind,
        tech: node.tech,
        fileCount: snapshot.evidence[node.id]?.fileCount ?? 0,
        focused: isFocused,
        status: nodeStatus[node.id] ?? "idle",
        dimmed: active && !isFocused,
      },
      draggable: false,
    }
  })

  return [...groupNodes, ...plumbNodes]
}

function toFlowEdges(snapshot: RepoSnapshot, focus: Focus): Edge[] {
  const active = focus.nodeIds.length > 0 || focus.unmodeled
  const incident = new Set(focus.edgeIds)
  return snapshot.model.edges.map((edge) => {
    const id = edgeId(edge.from, edge.to, edge.kind)
    const style = EDGE_KINDS[edge.kind]
    const isIncident = incident.has(id)
    const optional = edge.optional === true
    const dashed = style.dash === "dashed" || optional
    const baseOpacity = optional ? style.optionalOpacity : 1
    const opacity = !active ? baseOpacity : isIncident ? 1 : 0.15
    const handles = routeEdge(edge.from, edge.to, snapshot.model)
    return {
      id,
      type: "smoothstep",
      source: edge.from,
      target: edge.to,
      sourceHandle: handles.sourceHandle,
      targetHandle: handles.targetHandle,
      label: mapEdgeLabel(edge, isIncident),
      animated: isIncident,
      pathOptions: { borderRadius: 16 },
      style: {
        stroke: style.color,
        strokeWidth: isIncident ? 2.5 : 1.5,
        opacity,
        strokeDasharray: dashed ? (style.strokeDasharray ?? "6 4") : undefined,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: style.color,
        width: 16,
        height: 16,
      },
    }
  })
}
