import { describe, expect, it } from "vitest"
import { checkFiles } from "../check"
import { botIngestIntent, sampleModel } from "./fixtures"

describe("checkFiles", () => {
  it("fails the wrong-layer fixture with denied stats and dashboard files", () => {
    const result = checkFiles({
      model: sampleModel,
      intent: botIngestIntent,
      files: [
        "src/queries/sql/getWebsiteStats.ts",
        "src/app/(main)/websites/page.tsx",
      ],
    })

    expect(result.pass).toBe(false)
    expect(result.counts.denied).toBe(2)
    expect(result.nodeStatus["analytics-reads"]).toBe("denied")
    expect(result.nodeStatus["dashboard-ui"]).toBe("denied")
    expect(result.nodeStatus["next-app"]).toBe("denied")
    expect(result.files.map((item) => item.file)).toEqual([
      "src/queries/sql/getWebsiteStats.ts",
      "src/app/(main)/websites/page.tsx",
    ])
  })

  it("passes the good-ingest fixture and paints ingest green", () => {
    const result = checkFiles({
      model: sampleModel,
      intent: botIngestIntent,
      files: ["src/app/api/send/route.ts", "src/lib/detect.ts"],
    })

    expect(result.pass).toBe(true)
    expect(result.counts.denied).toBe(0)
    expect(result.counts.unscoped).toBe(0)
    expect(result.nodeStatus["ingest-api"]).toBe("allowed")
    expect(result.nodeStatus["next-app"]).toBe("allowed")
    expect(result.nodeStatus["dashboard-ui"]).toBe("idle")
  })

  it("applies deny over allow over unscoped", () => {
    const result = checkFiles({
      model: sampleModel,
      intent: botIngestIntent,
      files: [
        "src/app/api/send/route.ts",
        "src/app/api/websites/[websiteId]/stats/route.ts",
        "prisma/schema.prisma",
      ],
    })

    const byFile = Object.fromEntries(
      result.files.map((item) => [item.file, item.status]),
    )
    expect(byFile["src/app/api/send/route.ts"]).toBe("allowed")
    expect(byFile["src/app/api/websites/[websiteId]/stats/route.ts"]).toBe(
      "denied",
    )
    expect(byFile["prisma/schema.prisma"]).toBe("unscoped")
    expect(result.pass).toBe(false)
  })

  it("fails strict intents when any file is unscoped even without denies", () => {
    const result = checkFiles({
      model: sampleModel,
      intent: botIngestIntent,
      files: ["src/lib/prisma.ts"],
    })

    expect(result.pass).toBe(false)
    expect(result.counts.unscoped).toBe(1)
    expect(result.counts.denied).toBe(0)
  })

  it("normalizes Windows backslashes before checking", () => {
    const result = checkFiles({
      model: sampleModel,
      intent: botIngestIntent,
      files: ["src\\app\\api\\send\\route.ts"],
    })

    expect(result.pass).toBe(true)
    expect(result.files[0]?.file).toBe("src/app/api/send/route.ts")
    expect(result.files[0]?.status).toBe("allowed")
    expect(result.nodeStatus["ingest-api"]).toBe("allowed")
  })

  it("rolls group ids to the worst child when siblings mix allowed and denied", () => {
    const result = checkFiles({
      model: sampleModel,
      intent: botIngestIntent,
      files: [
        "src/queries/sql/events/saveEvent.ts",
        "src/queries/sql/getWebsiteStats.ts",
      ],
    })

    expect(result.nodeStatus["sql-write"]).toBe("allowed")
    expect(result.nodeStatus["analytics-reads"]).toBe("denied")
    expect(result.nodeStatus["next-app"]).toBe("denied")
  })
})
