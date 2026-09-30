import { describe, expect, it } from "vitest"
import { PATTERN_CATALOG, detectPatterns } from "../patterns"
import { umamiLikeFacts } from "./fixtures"

const umamiLikeFiles = [
  "package.json",
  "next.config.ts",
  "src/app/(main)/websites/page.tsx",
  "src/app/(collect)/script/route.ts",
  "src/app/api/send/route.ts",
  "src/app/api/batch/route.ts",
  "src/app/api/record/route.ts",
  "src/app/api/websites/[websiteId]/stats/route.ts",
  "src/app/api/realtime/[websiteId]/route.ts",
  "src/app/api/auth/login/route.ts",
  "src/components/hooks/useApi.ts",
  "src/queries/sql/getWebsiteStats.ts",
  "src/queries/sql/events/saveEvent.ts",
  "src/queries/prisma/website.ts",
  "src/lib/db.ts",
  "src/lib/clickhouse.ts",
  "src/lib/kafka.ts",
  "src/tracker/index.ts",
  "rollup.tracker.config.js",
  "prisma/schema.prisma",
  "db/clickhouse/schema.sql",
  "db/clickhouse/migrations/01.sql",
  "db/postgresql/data-migrations/x.sql",
  "Dockerfile",
  "docker-compose.yml",
  "vercel.json",
  "netlify.toml",
  "src/app/api/config/route.ts",
  "src/app/api/links/route.ts",
  "src/app/api/pixels/route.ts",
  "src/app/api/heartbeat/route.ts",
  "src/app/mcp/route.ts",
  "src/app/share/[slug]/page.tsx",
  "src/recorder/index.js",
  "rollup.recorder.config.js",
  "src/lib/detect.ts",
  "src/lib/auth.ts",
  "src/lib/jwt.ts",
  "src/lib/api-key.ts",
  "src/lib/request.ts",
  "src/lib/schema.ts",
  "src/lib/prisma.ts",
  "src/lib/redis.ts",
  "src/lib/subscription.ts",
  "src/permissions/website.ts",
  "src/store/app.ts",
  "src/i18n/request.ts",
  "docker/proxy.ts",
  "scripts/generate-openapi.ts",
  "scripts/build-geo.js",
  "packages/mcp/src/server.ts",
  "packages/api-client/src/client.ts",
  "prisma/schema.prisma",
  "src/queries/sql/funnels/getFunnel.ts",
  "src/queries/sql/retention/getRetention.ts",
  "src/queries/sql/journeys/getJourney.ts",
  "src/queries/sql/heatmap/getHeatmap.ts",
  "src/queries/sql/revenue/getRevenueStats.ts",
  "src/queries/sql/performance/getPerformance.ts",
  "src/queries/sql/replays/saveRecording.ts",
  "src/queries/sql/goals/getGoal.ts",
  "src/queries/sql/pageviews/getPageviewStats.ts",
  "src/queries/sql/sessions/createSession.ts",
  "src/queries/sql/utm/getUTM.ts",
  "src/app/api/websites/contract.generated.ts",
  ".github/workflows/cd-cloud.yml",
]

const scoutedPatternIds = [
  "collect-plane",
  "three-collectors",
  "batch-fan-in",
  "session-replay-sidecar",
  "bot-gate",
  "geo-enrichment",
  "oltp-olap",
  "analytics-modules",
  "read-replica",
  "redis-cache",
  "resource-authz",
  "multi-credential",
  "in-process-mcp",
  "generated-contracts",
  "polled-realtime",
  "collect-edge",
  "public-share",
  "zod-boundary",
  "env-switches",
  "client-state-split",
  "i18n-catalog",
  "cloud-entitlements",
  "health-probe",
]

describe("detectPatterns", () => {
  it("detects modular monolith and other umami structural patterns", () => {
    const patterns = detectPatterns(umamiLikeFiles, umamiLikeFacts())
    const ids = patterns.map((item) => item.id)
    expect(ids).toContain("modular-monolith")
    expect(ids).toContain("next-app-router")
    expect(ids).toContain("route-groups")
    expect(ids).toContain("route-handler-bff")
    expect(ids).toContain("repository-query-layer")
    expect(ids).toContain("verb-split-queries")
    expect(ids).toContain("dual-store")
    expect(ids).toContain("env-store-dispatch")
    expect(patterns.every((item) => item.evidence.length > 0)).toBe(true)
  })

  it("detects scouted umami planes, services, and software patterns", () => {
    const patterns = detectPatterns(umamiLikeFiles, umamiLikeFacts())
    const ids = patterns.map((item) => item.id)
    for (const id of scoutedPatternIds) {
      expect(ids, id).toContain(id)
    }
    for (const id of scoutedPatternIds) {
      const pattern = patterns.find((item) => item.id === id)
      expect(pattern?.evidence.length, id).toBeGreaterThan(0)
    }
  })

  it("hides content-gated patterns when the file signals are absent", () => {
    const ids = detectPatterns(
      umamiLikeFiles,
      umamiLikeFacts({
        skipAuthRoutes: [],
        batchImportsSend: false,
        ingestUsesIsbot: false,
        hasReadReplica: false,
        redisHasRateLimit: false,
        realtimeIsJson: false,
        mcpUsesInProcessFetch: false,
        sendHasCollectors: false,
        subscriptionHasCloudLimits: false,
        composeProbesHeartbeat: false,
      }),
    ).map((item) => item.id)
    expect(ids).not.toContain("collect-plane")
    expect(ids).not.toContain("three-collectors")
    expect(ids).not.toContain("batch-fan-in")
    expect(ids).not.toContain("bot-gate")
    expect(ids).not.toContain("read-replica")
    expect(ids).not.toContain("redis-cache")
    expect(ids).not.toContain("in-process-mcp")
    expect(ids).not.toContain("polled-realtime")
    expect(ids).not.toContain("cloud-entitlements")
  })

  it("never labels verb-split queries as CQRS", () => {
    const labels = [
      ...PATTERN_CATALOG.map((item) => item.label.toLowerCase()),
      ...detectPatterns(umamiLikeFiles, umamiLikeFacts()).map((item) =>
        item.label.toLowerCase(),
      ),
    ]
    expect(labels.some((label) => label.includes("cqrs"))).toBe(false)
  })
})
