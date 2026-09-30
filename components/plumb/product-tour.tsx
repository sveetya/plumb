"use client"

import { useEffect, useRef, useState, type KeyboardEvent } from "react"
import { CircleQuestionMark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { TourStepView } from "./tour-step-view"
import {
  TOUR_STEPS,
  isLastStep,
  nextStepIndex,
  prevStepIndex,
} from "./tour-steps"

export function ProductTour() {
  const [open, setOpen] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const nextRef = useRef<HTMLButtonElement>(null)
  const step = TOUR_STEPS[stepIndex]
  const last = isLastStep(stepIndex, TOUR_STEPS.length)

  useEffect(() => {
    if (!open) return
    nextRef.current?.focus()
  }, [open, stepIndex])

  function openTour() {
    setStepIndex(0)
    setOpen(true)
  }

  function goNext() {
    if (last) {
      setOpen(false)
      return
    }
    setStepIndex((index) => nextStepIndex(index, TOUR_STEPS.length))
  }

  function goBack() {
    setStepIndex((index) => prevStepIndex(index))
  }

  function onKeyDown(event: KeyboardEvent) {
    if (isTypingTarget(event.target)) return
    if (event.key === "ArrowRight" && !last) {
      event.preventDefault()
      goNext()
    }
    if (event.key === "ArrowLeft" && stepIndex > 0) {
      event.preventDefault()
      goBack()
    }
  }

  if (!step) return null

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        data-testid="tour-trigger"
        className="text-muted-foreground hover:text-foreground"
        onClick={openTour}
      >
        <CircleQuestionMark data-icon="inline-start" />
        Wondering what this is?
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          data-testid="tour-dialog"
          className="gap-5 sm:max-w-md"
          onKeyDown={onKeyDown}
        >
          <TourStepView step={step} />
          <div className="flex items-center justify-between gap-3">
            <TourProgress index={stepIndex} total={TOUR_STEPS.length} />
            <div className="flex items-center gap-2">
              {stepIndex > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  data-testid="tour-back"
                  onClick={goBack}
                >
                  Back
                </Button>
              ) : null}
              <Button
                type="button"
                ref={nextRef}
                autoFocus
                data-testid="tour-next"
                onClick={goNext}
              >
                {last ? "Show me the map" : "Next"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function TourProgress({ index, total }: { index: number; total: number }) {
  return (
    <div data-testid="tour-progress" className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, dot) => (
        <span
          key={dot}
          aria-hidden
          className={`rounded-full ${
            dot === index
              ? "size-2 bg-foreground"
              : "size-1.5 bg-muted-foreground/30"
          }`}
        />
      ))}
      <span className="sr-only">
        Step {index + 1} of {total}
      </span>
    </div>
  )
}

function isTypingTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    Boolean(target.closest("input, textarea, [contenteditable='true']"))
  )
}
