import { describe, expect, it } from "vitest"
import { resolveFileToNode } from "../resolve"
import { sampleModel } from "./fixtures"

describe("resolveFileToNode", () => {
  it("maps a (main) dashboard file to dashboard-ui", () => {
    const node = resolveFileToNode(
      "src/app/(main)/websites/page.tsx",
      sampleModel.nodes,
    )
    expect(node?.id).toBe("dashboard-ui")
  })

  it("maps the websites stats route to analytics-api using a prefix, not a character class", () => {
    const node = resolveFileToNode(
      "src/app/api/websites/[websiteId]/stats/route.ts",
      sampleModel.nodes,
    )
    expect(node?.id).toBe("analytics-api")
  })

  it("maps a Windows backslash send route to ingest-api", () => {
    const node = resolveFileToNode(
      "src\\app\\api\\send\\route.ts",
      sampleModel.nodes,
    )
    expect(node?.id).toBe("ingest-api")
  })

  it("maps getWebsiteStats.ts to analytics-reads, not sql-write", () => {
    const node = resolveFileToNode(
      "src/queries/sql/getWebsiteStats.ts",
      sampleModel.nodes,
    )
    expect(node?.id).toBe("analytics-reads")
  })

  it("maps send/route.ts to ingest-api", () => {
    const node = resolveFileToNode(
      "src/app/api/send/route.ts",
      sampleModel.nodes,
    )
    expect(node?.id).toBe("ingest-api")
  })

  it("maps event writes to sql-write, not analytics-reads", () => {
    const node = resolveFileToNode(
      "src/queries/sql/events/saveEvent.ts",
      sampleModel.nodes,
    )
    expect(node?.id).toBe("sql-write")
  })

  it("returns undefined when no anchor matches", () => {
    expect(resolveFileToNode("README.md", sampleModel.nodes)).toBeUndefined()
  })
})
