import { describe, expect, it } from "vitest"
import { PATTERN_CATALOG } from "../patterns"
import {
  PATTERN_EXPLANATIONS,
  getPatternExplanation,
} from "../pattern-explanations"
import type { PatternId } from "../types"

const ALLOWED_HOSTS = new Set(["refactoring.guru", "en.wikipedia.org"])

function sentenceCount(value: string) {
  return value.match(/[^.!?]+[.!?]+/g)?.length ?? 0
}

function hostOf(href: string) {
  return new URL(href).host
}

describe("PATTERN_EXPLANATIONS", () => {
  const catalogIds = PATTERN_CATALOG.map((pattern) => pattern.id)
  const explanationIds = Object.keys(PATTERN_EXPLANATIONS) as PatternId[]

  it("covers every detected pattern once", () => {
    expect(explanationIds.sort()).toEqual([...catalogIds].sort())
    expect(new Set(explanationIds).size).toBe(catalogIds.length)
  })

  it("keeps each hint to one sentence and each summary to two or three", () => {
    for (const id of catalogIds) {
      const entry = getPatternExplanation(id)
      expect(sentenceCount(entry.hint), id).toBe(1)
      expect(sentenceCount(entry.summary), id).toBeGreaterThanOrEqual(2)
      expect(sentenceCount(entry.summary), id).toBeLessThanOrEqual(3)
    }
  })

  it("only links to Refactoring Guru or English Wikipedia", () => {
    for (const id of catalogIds) {
      const entry = getPatternExplanation(id)
      if (!entry.learnMore) continue
      const href = entry.learnMore.href
      expect(href.startsWith("https://"), id).toBe(true)
      expect(ALLOWED_HOSTS.has(hostOf(href)), `${id} ${href}`).toBe(true)
      expect(entry.learnMore.label.length).toBeGreaterThan(0)
    }
  })
})
