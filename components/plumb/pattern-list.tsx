"use client"

import { useState } from "react"
import { Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getPatternExplanation } from "@/src/core/pattern-explanations"
import type {
  ArchitectureStyle,
  DetectedPattern,
  PatternId,
  TechEvidence,
} from "@/src/core/types"
import { PatternDetailDialog } from "./pattern-detail-dialog"
import { TechIcon } from "./tech-icon"

export function PatternList({
  patterns,
  style,
  stack,
  selectedPatternId,
  onSelectPattern,
}: {
  patterns: DetectedPattern[]
  style: ArchitectureStyle
  stack: TechEvidence[]
  selectedPatternId: string | null
  onSelectPattern: (patternId: string) => void
}) {
  const [openPatternId, setOpenPatternId] = useState<PatternId | null>(null)
  const openPattern =
    patterns.find((pattern) => pattern.id === openPatternId) ?? null

  return (
    <div className="flex flex-col gap-3" data-testid="pattern-list">
      <Card size="sm" data-testid="style-verdict">
        <CardHeader>
          <CardTitle>{style.label}</CardTitle>
          <CardDescription>Architecture style</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
            {style.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
            {style.not.map((reason) => (
              <li key={`not-${reason}`}>{reason}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card size="sm">
        <CardHeader>
          <CardTitle>Stack</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {stack.map((item) => (
            <span
              key={item.id}
              className="flex items-center gap-1 rounded-md border px-1.5 py-1 text-xs"
            >
              <TechIcon tech={item.id} />
              {item.id}
            </span>
          ))}
        </CardContent>
      </Card>
      <Card size="sm">
        <CardHeader>
          <CardTitle>Patterns</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {patterns.map((pattern) => (
            <PatternCard
              key={pattern.id}
              pattern={pattern}
              selected={selectedPatternId === pattern.id}
              onOpen={() => {
                onSelectPattern(pattern.id)
                setOpenPatternId(pattern.id)
              }}
            />
          ))}
        </CardContent>
      </Card>
      <PatternDetailDialog
        pattern={openPattern}
        open={openPatternId !== null}
        onOpenChange={(next) => {
          if (!next) setOpenPatternId(null)
        }}
      />
    </div>
  )
}

function PatternCard({
  pattern,
  selected,
  onOpen,
}: {
  pattern: DetectedPattern
  selected: boolean
  onOpen: () => void
}) {
  const explanation = getPatternExplanation(pattern.id)
  return (
    <Tooltip>
      <TooltipTrigger
        delay={150}
        data-testid={`pattern-${pattern.id}`}
        onClick={onOpen}
        className={`group w-full cursor-pointer rounded-xl border p-2 text-left text-xs transition-colors hover:border-foreground/20 hover:bg-muted ${
          selected ? "ring-2 ring-primary" : ""
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="font-medium">{pattern.label}</div>
          <Info
            aria-hidden
            className="mt-0.5 size-3.5 shrink-0 text-muted-foreground opacity-80 group-hover:text-foreground"
          />
        </div>
        <div className="mt-1 text-muted-foreground">
          {pattern.nodeIds.length} nodes
        </div>
        <div className="mt-1 flex flex-col gap-0.5 font-mono text-[10px] text-muted-foreground">
          {pattern.evidence.slice(0, 4).map((path) => (
            <span key={path}>{path}</span>
          ))}
        </div>
        {selected ? (
          <Badge variant="outline" className="mt-1">
            focused
          </Badge>
        ) : null}
      </TooltipTrigger>
      <TooltipContent side="left" data-testid="pattern-hint">
        {explanation.hint}
      </TooltipContent>
    </Tooltip>
  )
}
