"use client"

import { ArrowUpRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getPatternExplanation } from "@/src/core/pattern-explanations"
import type { DetectedPattern } from "@/src/core/types"

export function PatternDetailDialog({
  pattern,
  open,
  onOpenChange,
}: {
  pattern: DetectedPattern | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const explanation = pattern ? getPatternExplanation(pattern.id) : null
  return (
    <Dialog open={open && pattern !== null} onOpenChange={onOpenChange}>
      {pattern && explanation ? (
        <DialogContent
          data-testid="pattern-detail"
          className="sm:max-w-lg"
        >
          <DialogHeader>
            <p className="text-xs text-muted-foreground">{explanation.hint}</p>
            <DialogTitle>{pattern.label}</DialogTitle>
            <DialogDescription>{explanation.summary}</DialogDescription>
          </DialogHeader>
          {pattern.evidence.length > 0 ? (
            <div>
              <div className="mb-1.5 text-xs font-medium">Where we saw it</div>
              <ul className="flex flex-col gap-1 font-mono text-xs text-muted-foreground">
                {pattern.evidence.slice(0, 8).map((path) => (
                  <li key={path}>{path}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {explanation.learnMore ? (
            <a
              data-testid="pattern-learn-more"
              href={explanation.learnMore.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              {explanation.learnMore.label}
              <ArrowUpRight aria-hidden className="size-3.5" />
            </a>
          ) : null}
        </DialogContent>
      ) : null}
    </Dialog>
  )
}
