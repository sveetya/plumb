"use client"

import { EDGE_KINDS } from "@/src/core/edge-kinds"
import type { EdgeKind } from "@/src/core/types"

export { EDGE_KINDS }

const EDGE_ORDER: EdgeKind[] = ["http", "sql", "writes", "event", "imports"]

export function EdgeLegend() {
  return (
    <div
      data-testid="edge-legend"
      className="pointer-events-none absolute bottom-3 right-3 z-10 flex flex-wrap gap-2 rounded-xl border bg-card/95 px-2.5 py-2 text-[11px] shadow-sm"
    >
      {EDGE_ORDER.map((kind) => {
        const item = EDGE_KINDS[kind]
        return (
          <span key={kind} className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="inline-block w-6 border-t-2"
              style={{
                borderColor: item.color,
                borderStyle: item.dash === "dashed" ? "dashed" : "solid",
              }}
            />
            <span className="text-muted-foreground">{item.label}</span>
          </span>
        )
      })}
    </div>
  )
}
