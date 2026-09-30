import { describe, expect, it } from "vitest"
import { classifyStyle } from "../style"
import { umamiLikeFacts } from "./fixtures"

describe("classifyStyle", () => {
  it("classifies umami-like facts with 1 package.json as modular-monolith, not microservices", () => {
    const style = classifyStyle(umamiLikeFacts(), [
      "package.json",
      "src/queries/sql/getWebsiteStats.ts",
      "src/queries/prisma/website.ts",
      "src/app/api/send/route.ts",
      "src/app/api/websites/[websiteId]/route.ts",
    ])
    expect(style.id).toBe("modular-monolith")
    expect(style.label.toLowerCase()).toContain("modular monolith")
    expect(style.not.some((item) => item.includes("not microservices"))).toBe(
      true,
    )
    expect(style.not.some((item) => item.includes("not CQRS"))).toBe(true)
  })

  it("ignores packages/* package.json from a workspace glob", () => {
    const style = classifyStyle(
      umamiLikeFacts({
        packageJsonPaths: [
          "package.json",
          "packages/mcp/package.json",
          "packages/api-client/package.json",
        ],
      }),
      [
        "package.json",
        "src/queries/sql/getWebsiteStats.ts",
        "src/queries/prisma/website.ts",
        "src/app/api/send/route.ts",
      ],
    )
    expect(style.id).toBe("modular-monolith")
  })

  it("classifies two apps/*/package.json deployables as microservices", () => {
    const style = classifyStyle(
      umamiLikeFacts({
        packageJsonPaths: [
          "apps/web/package.json",
          "apps/api/package.json",
        ],
      }),
      ["apps/web/package.json", "apps/api/package.json"],
    )
    expect(style.id).toBe("microservices")
  })
})
