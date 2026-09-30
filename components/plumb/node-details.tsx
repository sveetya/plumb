"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ArchEdge, ArchNode, DetectedPattern, NodeEvidence } from "@/src/core/types"
import { TechIcon } from "./tech-icon"

export function NodeDetails({
  node,
  evidence,
  incoming,
  outgoing,
  patterns,
  unmodeled,
  selectedPath,
}: {
  node: ArchNode | null
  evidence: NodeEvidence | undefined
  incoming: ArchEdge[]
  outgoing: ArchEdge[]
  patterns: DetectedPattern[]
  unmodeled: boolean
  selectedPath: string | null
}) {
  if (unmodeled) {
    return (
      <Card size="sm" data-testid="node-details">
        <CardHeader>
          <CardTitle>Not modelled</CardTitle>
          <CardDescription>
            {selectedPath ?? "This path has no owner in the architecture model."}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }
  if (!node) {
    return (
      <Card size="sm" data-testid="node-details">
        <CardHeader>
          <CardTitle>Node</CardTitle>
          <CardDescription>Select a file or node to inspect it.</CardDescription>
        </CardHeader>
      </Card>
    )
  }
  const missing = evidence?.missingAnchors ?? []
  return (
    <div className="flex flex-col gap-3" data-testid="node-details">
      <Card size="sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>{node.label}</span>
            <Badge variant="outline">{node.kind}</Badge>
          </CardTitle>
          <CardDescription>
            {node.runtime ? `Runtime: ${node.runtime}` : node.id}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-xs">
          <div className="flex flex-wrap gap-1">
            {node.tech.map((tech) => (
              <span key={tech} className="flex items-center gap-1 rounded-md border px-1.5 py-0.5">
                <TechIcon tech={tech} />
                {tech}
              </span>
            ))}
          </div>
          <div>
            Files: {evidence?.fileCount ?? 0}
            {evidence?.detected === false ? (
              <span className="text-amber-700"> · not detected</span>
            ) : null}
          </div>
          <AnchorList title="Anchors" items={node.anchors} />
          {missing.length > 0 ? (
            <AnchorList title="Missing anchors" items={missing} />
          ) : null}
        </CardContent>
      </Card>
      {patterns.length > 0 ? (
        <Card size="sm">
          <CardHeader>
            <CardTitle>Patterns</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-xs">
            {patterns.map((pattern) => (
              <div key={pattern.id}>{pattern.label}</div>
            ))}
          </CardContent>
        </Card>
      ) : null}
      <EdgeList title="In" edges={incoming} endpoint="from" />
      <EdgeList title="Out" edges={outgoing} endpoint="to" />
    </div>
  )
}

function AnchorList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null
  return (
    <div>
      <div className="mb-1 font-medium">{title}</div>
      <ScrollArea className="max-h-28 rounded-md border p-2">
        <ul className="flex flex-col gap-1 font-mono text-[11px] text-muted-foreground">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  )
}

function EdgeList({
  title,
  edges,
  endpoint,
}: {
  title: string
  edges: ArchEdge[]
  endpoint: "from" | "to"
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>
          {title} ({edges.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 text-xs">
        {edges.length === 0 ? (
          <p className="text-muted-foreground">None</p>
        ) : (
          edges.map((edge) => (
            <div key={`${edge.from}-${edge.to}-${edge.kind}`}>
              <Badge variant="outline">{edge.kind}</Badge>{" "}
              {endpoint === "from" ? edge.from : edge.to}
              {edge.label ? (
                <span className="text-muted-foreground"> · {edge.label}</span>
              ) : null}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
