import { describe, expect, it } from "vitest"
import {
  focusForNode,
  focusForPath,
  focusForPattern,
  hasMapSelection,
} from "../focus"
import { sampleModel } from "./fixtures"

describe("focusForPath", () => {
  it("focuses ingest-api for send/route.ts", () => {
    const focus = focusForPath(
      "src/app/api/send/route.ts",
      sampleModel,
      ["src/app/api/send/route.ts", "src/lib/detect.ts"],
    )
    expect(focus.kind).toBe("path")
    expect(focus.nodeIds[0]).toBe("ingest-api")
    expect(focus.nodeIds).toContain("ingest-api")
    expect(focus.unmodeled).toBe(false)
    expect(focus.edgeIds.length).toBeGreaterThan(0)
  })

  it("marks unowned paths as unmodeled", () => {
    const focus = focusForPath("src/i18n/en.json", sampleModel, [
      "src/i18n/en.json",
    ])
    expect(focus.unmodeled).toBe(true)
    expect(focus.nodeIds).toEqual([])
  })
})

describe("focusForNode", () => {
  it("returns files owned by analytics-reads", () => {
    const focus = focusForNode("analytics-reads", sampleModel, [
      "src/queries/sql/getWebsiteStats.ts",
      "src/queries/sql/events/saveEvent.ts",
    ])
    expect(focus.kind).toBe("node")
    expect(focus.nodeIds).toEqual(["analytics-reads"])
    expect(focus.paths).toContain("src/queries/sql/getWebsiteStats.ts")
    expect(focus.paths).not.toContain("src/queries/sql/events/saveEvent.ts")
  })
})

describe("focusForPattern", () => {
  it("focuses the pattern node ids", () => {
    const focus = focusForPattern(
      "verb-split-queries",
      sampleModel,
      ["src/queries/sql/getWebsiteStats.ts"],
      [
        {
          id: "verb-split-queries",
          label: "Shared query module, write/read by verb",
          evidence: ["src/queries/sql/getWebsiteStats.ts"],
          nodeIds: ["sql-write", "analytics-reads"],
        },
      ],
    )
    expect(focus.kind).toBe("pattern")
    expect(focus.nodeIds).toEqual(["sql-write", "analytics-reads"])
  })
})

describe("hasMapSelection", () => {
  it("is false only when nothing is picked", () => {
    expect(
      hasMapSelection({
        selectedPath: null,
        selectedNodeId: null,
        selectedPatternId: null,
      }),
    ).toBe(false)
    expect(
      hasMapSelection({
        selectedPath: "src/lib/detect.ts",
        selectedNodeId: null,
        selectedPatternId: null,
      }),
    ).toBe(true)
    expect(
      hasMapSelection({
        selectedPath: null,
        selectedNodeId: "ingest-api",
        selectedPatternId: null,
      }),
    ).toBe(true)
    expect(
      hasMapSelection({
        selectedPath: null,
        selectedNodeId: null,
        selectedPatternId: "verb-split-queries",
      }),
    ).toBe(true)
  })
})
