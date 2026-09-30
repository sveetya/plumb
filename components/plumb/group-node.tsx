"use client"

import type { Node, NodeProps } from "@xyflow/react"
import { TechIcon } from "./tech-icon"

export type GroupNodeData = {
  label: string
}

export type GroupFlowNode = Node<GroupNodeData, "group">

export function GroupNode({ data }: NodeProps<GroupFlowNode>) {
  return (
    <div
      data-testid="plumb-group-next-app"
      className="h-full w-full rounded-2xl border-2 border-dashed border-muted-foreground/25 bg-muted/25"
    >
      <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground">
        <TechIcon tech="nextjs" />
        <span>{data.label}</span>
      </div>
    </div>
  )
}
