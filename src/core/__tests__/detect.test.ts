import { describe, expect, it } from "vitest"
import { detectFromFiles } from "../detect"
import { sampleModel } from "./fixtures"

describe("detectFromFiles", () => {
  it("marks anchored nodes detected when their anchors have files", () => {
    const report = detectFromFiles(sampleModel, [
      "src/tracker/index.ts",
      "src/app/api/send/route.ts",
      "src/queries/sql/events/saveEvent.ts",
    ])

    const byId = Object.fromEntries(report.nodes.map((node) => [node.id, node]))
    expect(report.version).toBe(2)
    expect(byId.tracker?.source).toBe("detected")
    expect(byId.tracker?.detected).toBe(true)
    expect(byId.tracker?.fileCount).toBe(1)
    expect(byId["ingest-api"]?.source).toBe("detected")
    expect(byId["sql-write"]?.source).toBe("detected")
    expect(byId["dashboard-ui"]?.source).toBe("declared")
    expect(byId["dashboard-ui"]?.detected).toBe(false)
    expect(byId["dashboard-ui"]?.fileCount).toBe(0)
  })

  it("lists missing anchors that match no files", () => {
    const report = detectFromFiles(sampleModel, ["src/tracker/index.ts"])
    const ingest = report.nodes.find((node) => node.id === "ingest-api")
    expect(ingest?.detected).toBe(false)
    expect(ingest?.missingAnchors).toEqual(
      expect.arrayContaining(["src/app/api/send/", "src/lib/detect.ts"]),
    )
  })

  it("does not mutate the input model", () => {
    const snapshot = JSON.stringify(sampleModel)
    detectFromFiles(sampleModel, ["src/tracker/index.ts"])
    expect(JSON.stringify(sampleModel)).toBe(snapshot)
  })

  it("does not invent nodes beyond the declared model", () => {
    const report = detectFromFiles(sampleModel, ["src/lib/auth.ts"])
    expect(report.nodes.map((node) => node.id)).toEqual(
      sampleModel.nodes.map((node) => node.id),
    )
  })

  it("counts (main) dashboard files with prefix matching", () => {
    const report = detectFromFiles(sampleModel, [
      "src/app/(main)/websites/page.tsx",
    ])
    const dashboard = report.nodes.find((node) => node.id === "dashboard-ui")
    expect(dashboard?.source).toBe("detected")
    expect(dashboard?.detected).toBe(true)
    expect(dashboard?.fileCount).toBe(1)
  })
})
