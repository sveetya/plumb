import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import { readRepoFacts } from "../../server/facts"

describe("readRepoFacts pattern signals", () => {
  let root = ""

  afterEach(() => {
    if (root) {
      rmSync(root, { recursive: true, force: true })
      root = ""
    }
  })

  it("reads collect, store, realtime, mcp, and cloud signals from file text", () => {
    root = mkdtempSync(path.join(tmpdir(), "plumb-facts-"))
    writeRel(root, "package.json", "{}\n")
    writeRel(
      root,
      "docker-compose.yml",
      "services:\n  umami:\n    healthcheck:\n      test: curl http://localhost:3000/api/heartbeat\n",
    )
    writeRel(root, "src/app/api/send/route.ts", "skipAuth: true\npixel\nlink\nwebsite\nisbot\n")
    writeRel(root, "src/app/api/record/route.ts", "skipAuth: true\nisbot\n")
    writeRel(root, "src/app/api/batch/route.ts", "skipAuth: true\nsend.POST\n")
    writeRel(root, "src/lib/prisma.ts", "process.env.DATABASE_REPLICA_URL\n")
    writeRel(root, "src/lib/redis.ts", "async rateLimit() {}\n")
    writeRel(root, "src/lib/subscription.ts", "export const CLOUD_FREE_WEBSITE_LIMIT = 1\n")
    writeRel(root, "src/app/mcp/route.ts", "createInProcessFetch()\n")
    writeRel(root, "src/app/api/realtime/[websiteId]/route.ts", "return json(data)\n")
    const files = [
      "src/app/api/send/route.ts",
      "src/app/api/record/route.ts",
      "src/app/api/batch/route.ts",
      "src/lib/prisma.ts",
      "src/lib/redis.ts",
      "src/lib/subscription.ts",
      "src/app/mcp/route.ts",
      "src/app/api/realtime/[websiteId]/route.ts",
    ]
    const facts = readRepoFacts(root, files)
    expect(facts.skipAuthRoutes).toEqual(
      expect.arrayContaining([
        "src/app/api/send/route.ts",
        "src/app/api/record/route.ts",
        "src/app/api/batch/route.ts",
      ]),
    )
    expect(facts.batchImportsSend).toBe(true)
    expect(facts.ingestUsesIsbot).toBe(true)
    expect(facts.hasReadReplica).toBe(true)
    expect(facts.redisHasRateLimit).toBe(true)
    expect(facts.realtimeIsJson).toBe(true)
    expect(facts.mcpUsesInProcessFetch).toBe(true)
    expect(facts.sendHasCollectors).toBe(true)
    expect(facts.subscriptionHasCloudLimits).toBe(true)
    expect(facts.composeProbesHeartbeat).toBe(true)
  })
})

function writeRel(root: string, rel: string, contents: string): void {
  const full = path.join(root, rel)
  mkdirSync(path.dirname(full), { recursive: true })
  writeFileSync(full, contents, "utf8")
}
