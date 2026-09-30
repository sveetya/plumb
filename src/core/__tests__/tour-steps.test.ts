import { describe, expect, it } from "vitest"
import {
  TOUR_STEPS,
  isLastStep,
  nextStepIndex,
  prevStepIndex,
} from "../../../components/plumb/tour-steps"

const ORDER = [
  "problem",
  "solution",
  "map",
  "inspect",
  "patterns",
] as const

function wordCount(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length
}

function sentenceCount(value: string) {
  return value.match(/[^.!?]+[.!?]+/g)?.length ?? 0
}

describe("TOUR_STEPS", () => {
  it("walks problem, solution, then the product surfaces", () => {
    expect(TOUR_STEPS.map((step) => step.id)).toEqual([...ORDER])
    expect(new Set(TOUR_STEPS.map((step) => step.id)).size).toBe(
      TOUR_STEPS.length,
    )
  })

  it("keeps each step short, plain, and free of emoji", () => {
    for (const step of TOUR_STEPS) {
      expect(wordCount(step.title)).toBeLessThanOrEqual(8)
      expect(wordCount(step.kicker)).toBeGreaterThan(0)
      expect(sentenceCount(step.body)).toBe(2)
      expect(step.body).not.toMatch(/\p{Extended_Pictographic}/u)
      expect(step.title).not.toMatch(/\p{Extended_Pictographic}/u)
    }
  })
})

describe("tour step navigation", () => {
  const total = TOUR_STEPS.length

  it("clamps next and previous at the ends", () => {
    expect(nextStepIndex(0, total)).toBe(1)
    expect(nextStepIndex(total - 1, total)).toBe(total - 1)
    expect(prevStepIndex(0)).toBe(0)
    expect(prevStepIndex(2)).toBe(1)
  })

  it("marks only the final step as last", () => {
    expect(isLastStep(0, total)).toBe(false)
    expect(isLastStep(total - 1, total)).toBe(true)
  })
})
