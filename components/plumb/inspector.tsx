"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { RepoSnapshot } from "@/src/core/types"
import { NodeDetails } from "./node-details"
import { PatternList } from "./pattern-list"
import type { FocusController, InspectorTab } from "./use-focus"

export function Inspector({
  snapshot,
  focus,
}: {
  snapshot: RepoSnapshot
  focus: FocusController
}) {
  const nodeId = focus.selectedNodeId ?? focus.focus.nodeIds[0] ?? null
  const node = snapshot.model.nodes.find((item) => item.id === nodeId) ?? null
  const incoming = node
    ? snapshot.model.edges.filter((edge) => edge.to === node.id)
    : []
  const outgoing = node
    ? snapshot.model.edges.filter((edge) => edge.from === node.id)
    : []
  const patterns = node
    ? snapshot.patterns.filter((pattern) => pattern.nodeIds.includes(node.id))
    : []

  return (
    <aside
      data-testid="inspector"
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border bg-card"
    >
      <Tabs
        value={focus.selectedTab}
        onValueChange={(value) =>
          focus.setSelectedTab(parseTab(value))
        }
        className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden"
      >
        <div className="border-b px-2 py-2">
          <TabsList className="w-full">
            <TabsTrigger value="node" className="flex-1">
              Node
            </TabsTrigger>
            <TabsTrigger value="patterns" className="flex-1">
              Patterns
            </TabsTrigger>
          </TabsList>
        </div>
        <div className="min-h-0 flex-1">
          <ScrollArea className="h-full">
            <div className="p-3">
              <TabsContent value="node">
                <NodeDetails
                  node={node}
                  evidence={node ? snapshot.evidence[node.id] : undefined}
                  incoming={incoming}
                  outgoing={outgoing}
                  patterns={patterns}
                  unmodeled={focus.focus.unmodeled}
                  selectedPath={focus.selectedPath}
                />
              </TabsContent>
              <TabsContent value="patterns">
                <PatternList
                  patterns={snapshot.patterns}
                  style={snapshot.style}
                  stack={snapshot.stack}
                  selectedPatternId={focus.selectedPatternId}
                  onSelectPattern={focus.selectPattern}
                />
              </TabsContent>
            </div>
          </ScrollArea>
        </div>
      </Tabs>
    </aside>
  )
}

function parseTab(value: string): InspectorTab {
  if (value === "patterns") return value
  return "node"
}
