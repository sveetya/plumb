import { describe, expect, it } from "vitest"
import { matches } from "../match"
import { normalize } from "../paths"

describe("normalize", () => {
  it("converts Windows backslashes to forward slashes", () => {
    expect(normalize("src\\app\\api\\send\\route.ts")).toBe(
      "src/app/api/send/route.ts",
    )
  })
})

describe("matches", () => {
  it("matches dashboard files under (main) as a prefix, not a glob group", () => {
    expect(
      matches("src/app/(main)/", "src/app/(main)/websites/page.tsx"),
    ).toBe(true)
    expect(matches("src/app/(main)/", "src/app/api/send/route.ts")).toBe(false)
  })

  it("matches websites stats route with [websiteId] as a literal path, not a character class", () => {
    const file = "src/app/api/websites/[websiteId]/stats/route.ts"
    expect(matches("src/app/api/websites/", file)).toBe(true)
    expect(matches("src/app/api/websites/[websiteId]/stats/route.ts", file)).toBe(
      true,
    )
    expect(
      matches(
        "src/app/api/websites/[websiteId]/stats/route.ts",
        "src/app/api/websites/w/stats/route.ts",
      ),
    ).toBe(false)
  })

  it("normalizes a Windows backslash send route to the ingest path", () => {
    expect(
      matches("src/app/api/send/route.ts", "src\\app\\api\\send\\route.ts"),
    ).toBe(true)
  })

  it("uses glob only when the pattern contains a star after escaping brackets", () => {
    expect(matches("src/tracker/*", "src/tracker/index.ts")).toBe(true)
    expect(
      matches("src/app/(main)/**", "src/app/(main)/websites/page.tsx"),
    ).toBe(true)
  })

  it("does not treat an exact file pattern as a prefix", () => {
    expect(matches("src/lib/detect.ts", "src/lib/detect.ts.bak")).toBe(false)
  })

  it("matches getWebsiteStats.ts with a **/ glob that spans zero directories", () => {
    expect(
      matches(
        "src/queries/sql/**/get*.ts",
        "src/queries/sql/getWebsiteStats.ts",
      ),
    ).toBe(true)
  })

  it("matches nested get* query files under the same **/ glob", () => {
    expect(
      matches(
        "src/queries/sql/**/get*.ts",
        "src/queries/sql/events/getEventData.ts",
      ),
    ).toBe(true)
    expect(
      matches(
        "src/queries/sql/**/get*.ts",
        "src/queries/sql/sessions/getWebsiteSession.ts",
      ),
    ).toBe(true)
  })
})
