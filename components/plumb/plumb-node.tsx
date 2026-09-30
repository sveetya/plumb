"use client"

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react"
import { cn } from "@/lib/utils"
import type { NodeKind, NodeStatus, TechId } from "@/src/core/types"
import { statusLabel, statusRingClass } from "./status"
import { TechIcon } from "./tech-icon"

export type PlumbNodeData = {
  label: string
  kind: NodeKind
  tech: TechId[]
  fileCount: number
  focused: boolean
  status: NodeStatus
  dimmed: boolean
}

export type PlumbFlowNode = Node<PlumbNodeData, "plumb">

const HANDLE_CLASS = "!h-2 !w-2 !border-0 !bg-transparent"

export function PlumbNode({ id, data }: NodeProps<PlumbFlowNode>) {
  const status = data.status
  const intentActive = status !== "idle"
  return (
    <div
      data-testid={`plumb-node-${id}`}
      data-status={status}
      data-focused={data.focused ? "true" : "false"}
      className={cn(
        "min-w-[176px] rounded-xl bg-card px-3 py-2 shadow-sm transition-opacity",
        intentActive ? statusRingClass(status) : "ring-1 ring-border",
        data.focused && !intentActive && "ring-2 ring-primary",
        data.dimmed && "opacity-30",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="t-left"
        className={HANDLE_CLASS}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="t-right"
        className={HANDLE_CLASS}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="t-top"
        className={HANDLE_CLASS}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="t-bottom"
        className={HANDLE_CLASS}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="s-left"
        className={HANDLE_CLASS}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="s-right"
        className={HANDLE_CLASS}
      />
      <Handle
        type="source"
        position={Position.Top}
        id="s-top"
        className={HANDLE_CLASS}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="s-bottom"
        className={HANDLE_CLASS}
      />
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm font-medium leading-tight">{data.label}</div>
        <div className="flex shrink-0 items-center gap-0.5">
          {data.tech.slice(0, 3).map((tech) => (
            <TechIcon key={tech} tech={tech} />
          ))}
        </div>
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <span className="rounded-md bg-muted px-1.5 py-0.5 font-medium uppercase tracking-wide">
          {data.kind}
        </span>
        <span>{data.fileCount} files</span>
        {intentActive ? <span>{statusLabel(status)}</span> : null}
      </div>
    </div>
  )
}
