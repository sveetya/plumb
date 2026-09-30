import { describe, expect, it } from "vitest"
import { detectStack } from "../stack"
import { umamiLikeFacts } from "./fixtures"

describe("detectStack", () => {
  it("detects nextjs, react, prisma, and docker from umami-like facts", () => {
    const stack = detectStack(umamiLikeFacts())
    const ids = stack.map((item) => item.id)
    expect(ids).toContain("nextjs")
    expect(ids).toContain("react")
    expect(ids).toContain("typescript")
    expect(ids).toContain("prisma")
    expect(ids).toContain("postgresql")
    expect(ids).toContain("clickhouse")
    expect(ids).toContain("kafka")
    expect(ids).toContain("redis")
    expect(ids).toContain("docker")
    expect(ids).toContain("github")
    expect(stack.find((item) => item.id === "nextjs")?.evidence.length).toBeGreaterThan(
      0,
    )
  })

  it("omits kafka when neither the client nor kafka.ts is present", () => {
    const stack = detectStack(
      umamiLikeFacts({
        dependencyNames: ["next", "react"],
        hasKafkaTs: false,
      }),
    )
    expect(stack.map((item) => item.id)).not.toContain("kafka")
  })
})
