import type { DetectedPattern, PatternId, RepoFacts } from "./types"
import { normalize } from "./paths"
import { deployableCount } from "./stack"

export type PatternDefinition = {
  id: PatternId
  label: string
  nodeIds: string[]
  evidence: (files: string[], facts: RepoFacts) => string[]
}

export const PATTERN_CATALOG: PatternDefinition[] = [
  {
    id: "modular-monolith",
    label: "Modular monolith",
    nodeIds: [
      "ingest-api",
      "sql-write",
      "dashboard-ui",
      "analytics-api",
      "analytics-reads",
      "platform-api",
      "entity-repo",
    ],
    evidence: (files, facts) => {
      if (deployableCount(facts) !== 1 || moduleFolderCount(files) < 3) {
        return []
      }
      return [
        ...realRootPackage(facts),
        ...files.filter((file) => file.startsWith("src/queries/") || file.startsWith("src/app/api/")).slice(0, 6),
      ]
    },
  },
  {
    id: "next-app-router",
    label: "Next.js App Router",
    nodeIds: ["dashboard-ui", "ingest-api", "analytics-api", "platform-api"],
    evidence: (files, facts) => {
      if (!facts.dependencyNames.includes("next") || !facts.hasNextConfig) {
        return []
      }
      const pages = files.filter((file) => file.endsWith("/page.tsx") || file.endsWith("page.tsx"))
      const routes = files.filter((file) => file.endsWith("/route.ts") || file.endsWith("route.ts"))
      if (pages.length === 0 && routes.length === 0) {
        return []
      }
      return [
        "next.config.ts",
        ...pages.slice(0, 2),
        ...routes.slice(0, 2),
      ]
    },
  },
  {
    id: "route-groups",
    label: "Route groups split surfaces",
    nodeIds: ["dashboard-ui", "ingest-api"],
    evidence: (_files, facts) =>
      facts.routeGroupDirs.length > 0
        ? facts.routeGroupDirs.map((dir) => `src/app/${dir}/`)
        : [],
  },
  {
    id: "route-handler-bff",
    label: "Same-origin API (BFF)",
    nodeIds: ["ingest-api", "analytics-api", "platform-api"],
    evidence: (files, facts) => {
      if (facts.routeTsCount <= 5 || !facts.hasUseApi) {
        return []
      }
      return [
        ...files.filter((file) => file.endsWith("route.ts")).slice(0, 4),
        ...files.filter((file) => file.endsWith("useApi.ts")).slice(0, 1),
      ]
    },
  },
  {
    id: "repository-query-layer",
    label: "Repository / query layer",
    nodeIds: ["entity-repo", "analytics-reads", "sql-write"],
    evidence: (files, facts) => {
      if (!facts.hasQueriesDir) {
        return []
      }
      return files.filter((file) => file.startsWith("src/queries/")).slice(0, 6)
    },
  },
  {
    id: "verb-split-queries",
    label: "Shared query module, write/read by verb",
    nodeIds: ["sql-write", "analytics-reads"],
    evidence: (files, facts) => {
      if (facts.writeQueryCount === 0 || facts.readQueryCount === 0) {
        return []
      }
      const writes = files.filter(isWriteQuery).slice(0, 2)
      const reads = files.filter(isReadQuery).slice(0, 2)
      return [...writes, ...reads]
    },
  },
  {
    id: "dual-store",
    label: "Dual store",
    nodeIds: ["postgres", "clickhouse"],
    evidence: (files, facts) => {
      if (
        !facts.hasPrismaSchema ||
        !facts.dependencyNames.includes("@clickhouse/client") ||
        !facts.hasClickhouseSchema
      ) {
        return []
      }
      return [
        "prisma/schema.prisma",
        ...files.filter((file) => file.includes("clickhouse")).slice(0, 2),
      ]
    },
  },
  {
    id: "env-store-dispatch",
    label: "Env-switched store dispatch",
    nodeIds: ["sql-write", "analytics-reads"],
    evidence: (_files, facts) => {
      if (!facts.dbTsHasRunQuery || !facts.dbTsHasClickhouse || facts.runQueryCallCount <= 10) {
        return []
      }
      return ["src/lib/db.ts"]
    },
  },
  {
    id: "optional-event-stream",
    label: "Optional Kafka",
    nodeIds: ["kafka"],
    evidence: (_files, facts) => {
      if (!facts.dependencyNames.includes("kafkajs") || !facts.hasKafkaTs) {
        return []
      }
      return ["src/lib/kafka.ts"]
    },
  },
  {
    id: "embeddable-tracker",
    label: "Separate tracker build",
    nodeIds: ["tracker"],
    evidence: (_files, facts) => {
      if (!facts.hasRollupTracker || !facts.hasTrackerIndex) {
        return []
      }
      return ["rollup.tracker.config.js", "src/tracker/index.ts"]
    },
  },
  {
    id: "schema-migrations",
    label: "Schema-first migrations",
    nodeIds: ["postgres", "clickhouse"],
    evidence: (files, facts) => {
      if (!facts.hasPrismaSchema || facts.migrationHits.length === 0) {
        return []
      }
      return ["prisma/schema.prisma", ...facts.migrationHits.slice(0, 3), ...files.filter((file) => file.includes("/migrations/")).slice(0, 2)]
    },
  },
  {
    id: "container-deploy",
    label: "Container + PaaS",
    nodeIds: [],
    evidence: (_files, facts) => {
      const hits = [
        ...(facts.hasDockerfile ? ["Dockerfile"] : []),
        ...(facts.hasDockerCompose ? ["docker-compose.yml"] : []),
        ...(facts.hasVercelJson ? ["vercel.json"] : []),
        ...(facts.hasNetlifyToml ? ["netlify.toml"] : []),
      ]
      return hits.length >= 2 ? hits : []
    },
  },
  {
    id: "collect-plane",
    label: "Unauthenticated collect plane",
    nodeIds: ["tracker", "ingest-api"],
    evidence: (files, facts) => {
      const skipped = new Set(facts.skipAuthRoutes.map(normalize))
      const routes = COLLECT_ROUTES.filter((file) => files.includes(file) && skipped.has(file))
      return routes.length >= 3 ? routes.slice(0, 4) : []
    },
  },
  {
    id: "three-collectors",
    label: "Website, link, and pixel collectors",
    nodeIds: ["tracker", "ingest-api", "entity-repo"],
    evidence: (files, facts) => {
      const routes = present(files, [
        "src/app/api/send/route.ts",
        "src/tracker/index.ts",
        "src/app/api/links/route.ts",
        "src/app/api/pixels/route.ts",
      ])
      return facts.sendHasCollectors && routes.length === 4 ? routes : []
    },
  },
  {
    id: "batch-fan-in",
    label: "Batch ingest reuses send",
    nodeIds: ["ingest-api"],
    evidence: (files, facts) => {
      const routes = present(files, ["src/app/api/batch/route.ts", "src/app/api/send/route.ts"])
      return facts.batchImportsSend && routes.includes("src/app/api/batch/route.ts") ? routes : []
    },
  },
  {
    id: "session-replay-sidecar",
    label: "Session replay sidecar build",
    nodeIds: ["tracker", "ingest-api", "clickhouse"],
    evidence: (files, facts) => {
      const recorder = files.find((file) => file.startsWith("src/recorder/"))
      const required = present(files, ["rollup.recorder.config.js", "src/app/api/record/route.ts"])
      if (!facts.dependencyNames.includes("rrweb") || !recorder || required.length < 2) {
        return []
      }
      return ["rollup.recorder.config.js", recorder, "src/app/api/record/route.ts"]
    },
  },
  {
    id: "bot-gate",
    label: "Bot gate on ingest",
    nodeIds: ["ingest-api"],
    evidence: (files, facts) => {
      if (!facts.ingestUsesIsbot || !facts.dependencyNames.includes("isbot")) {
        return []
      }
      const routes = present(files, ["src/app/api/send/route.ts", "src/app/api/record/route.ts"])
      return routes.length === 2 ? routes : []
    },
  },
  {
    id: "geo-enrichment",
    label: "Local GeoIP enrichment",
    nodeIds: ["ingest-api"],
    evidence: (files, facts) => {
      if (!facts.dependencyNames.includes("maxmind") || !files.includes("src/lib/detect.ts")) {
        return []
      }
      return present(files, ["src/lib/detect.ts", "scripts/build-geo.js"])
    },
  },
  {
    id: "oltp-olap",
    label: "OLTP entities vs analytics SQL",
    nodeIds: ["entity-repo", "analytics-reads", "sql-write", "postgres", "clickhouse"],
    evidence: (files, facts) => {
      if (!facts.hasQueriesPrisma || !facts.hasQueriesSql || !facts.hasPrismaSchema) {
        return []
      }
      const prismaQuery = files.find(isPrismaQuery)
      const sqlQuery = files.find((file) => file.startsWith("src/queries/sql/") && file.endsWith(".ts"))
      return [files.includes("prisma/schema.prisma") ? "prisma/schema.prisma" : "", prismaQuery ?? "", sqlQuery ?? ""].filter(
        (file) => file.length > 0,
      )
    },
  },
  {
    id: "analytics-modules",
    label: "Analytics capability modules",
    nodeIds: ["analytics-reads", "analytics-api"],
    evidence: (files) => {
      const hits = ANALYTICS_MODULES.flatMap((name) => {
        const found = files.find((file) => file.startsWith(`src/queries/sql/${name}/`))
        return found ? [found] : []
      })
      return hits.length >= 6 ? hits.slice(0, 8) : []
    },
  },
  {
    id: "read-replica",
    label: "Optional Postgres read replica",
    nodeIds: ["postgres", "analytics-reads", "entity-repo"],
    evidence: (files, facts) => {
      if (
        !facts.hasReadReplica ||
        !facts.dependencyNames.includes("@prisma/extension-read-replicas") ||
        !files.includes("src/lib/prisma.ts")
      ) {
        return []
      }
      return ["src/lib/prisma.ts"]
    },
  },
  {
    id: "redis-cache",
    label: "Optional Redis cache and rate limit",
    nodeIds: ["redis", "auth"],
    evidence: (files, facts) => {
      if (!facts.hasRedisTs || !facts.redisHasRateLimit || !facts.dependencyNames.includes("redis")) {
        return []
      }
      return present(files, ["src/lib/redis.ts"])
    },
  },
  {
    id: "resource-authz",
    label: "Website-scoped authorization",
    nodeIds: ["analytics-api", "platform-api", "auth"],
    evidence: (files) => {
      const permission = files.find(
        (file) => file.startsWith("src/permissions/") && file.endsWith(".ts") && !file.endsWith(".test.ts"),
      )
      const scoped = files.find((file) => file.includes("[websiteId]") && file.endsWith("route.ts"))
      return permission && scoped ? [permission, scoped] : []
    },
  },
  {
    id: "multi-credential",
    label: "Session, API key, share token, and 2FA",
    nodeIds: ["auth"],
    evidence: (files, facts) => {
      const credentials = present(files, ["src/lib/auth.ts", "src/lib/jwt.ts", "src/lib/api-key.ts"])
      const hasStepUp = facts.dependencyNames.includes("otplib") || files.some((file) => file.includes("/2fa/"))
      return credentials.length === 3 && hasStepUp ? credentials : []
    },
  },
  {
    id: "in-process-mcp",
    label: "In-process MCP facade",
    nodeIds: ["platform-api", "analytics-api"],
    evidence: (files, facts) => {
      const pkg = files.find((file) => file.startsWith("packages/mcp/"))
      if (!facts.mcpUsesInProcessFetch || !files.includes("src/app/mcp/route.ts") || !pkg) {
        return []
      }
      return ["src/app/mcp/route.ts", pkg]
    },
  },
  {
    id: "generated-contracts",
    label: "Generated OpenAPI contracts",
    nodeIds: ["analytics-api", "platform-api"],
    evidence: (files) => {
      const script = files.find((file) => file === "scripts/generate-openapi.ts")
      const contract = files.find((file) => file.endsWith("contract.generated.ts"))
      const client = files.find((file) => file.startsWith("packages/api-client/"))
      return script && contract && client ? [script, contract, client] : []
    },
  },
  {
    id: "polled-realtime",
    label: "Polled realtime",
    nodeIds: ["analytics-api", "analytics-reads"],
    evidence: (files, facts) => {
      const route = files.find((file) => file.includes("/api/realtime/") && file.endsWith("route.ts"))
      return facts.realtimeIsJson && route ? [route] : []
    },
  },
  {
    id: "collect-edge",
    label: "Collect path rewrite and CORS",
    nodeIds: ["tracker", "ingest-api"],
    evidence: (files) => present(files, ["docker/proxy.ts"]),
  },
  {
    id: "public-share",
    label: "Public share surface",
    nodeIds: ["share-ui", "auth", "analytics-reads"],
    evidence: (files) => {
      const page = files.find((file) => file.startsWith("src/app/share/") && file.endsWith("page.tsx"))
      if (!page) {
        return []
      }
      return present(files, [page, "src/lib/auth.ts"])
    },
  },
  {
    id: "zod-boundary",
    label: "Zod at the HTTP boundary",
    nodeIds: ["ingest-api", "analytics-api", "platform-api"],
    evidence: (files, facts) => {
      if (!facts.dependencyNames.includes("zod") || facts.routeTsCount <= 5) {
        return []
      }
      const boundary = present(files, ["src/lib/request.ts", "src/lib/schema.ts"])
      const route = files.find((file) => file.endsWith("route.ts"))
      return boundary.length > 0 && route ? [...boundary.slice(0, 2), route] : []
    },
  },
  {
    id: "env-switches",
    label: "Environment store switches",
    nodeIds: ["clickhouse", "kafka", "redis", "postgres"],
    evidence: (files, facts) => {
      const hits = [
        facts.dbTsHasClickhouse ? "src/lib/db.ts" : "",
        facts.hasKafkaTs ? "src/lib/kafka.ts" : "",
        facts.hasRedisTs ? "src/lib/redis.ts" : "",
        facts.hasReadReplica ? "src/lib/prisma.ts" : "",
      ].filter((file) => file.length > 0 && files.includes(file))
      return hits.length >= 3 ? hits : []
    },
  },
  {
    id: "client-state-split",
    label: "UI store vs server cache",
    nodeIds: ["dashboard-ui"],
    evidence: (files, facts) => {
      const store = files.find((file) => file.startsWith("src/store/") && file.endsWith(".ts"))
      if (
        !store ||
        !facts.hasUseApi ||
        !facts.dependencyNames.includes("zustand") ||
        !facts.dependencyNames.includes("@tanstack/react-query")
      ) {
        return []
      }
      return present(files, [store, "src/components/hooks/useApi.ts"])
    },
  },
  {
    id: "i18n-catalog",
    label: "Message catalog",
    nodeIds: ["dashboard-ui"],
    evidence: (files, facts) => {
      const catalog = files.find((file) => file.startsWith("src/i18n/"))
      if (!catalog || !facts.dependencyNames.includes("next-intl")) {
        return []
      }
      return [catalog]
    },
  },
  {
    id: "cloud-entitlements",
    label: "Cloud plan limits",
    nodeIds: ["platform-api", "entity-repo"],
    evidence: (files, facts) => {
      if (!facts.subscriptionHasCloudLimits || !files.includes("src/lib/subscription.ts")) {
        return []
      }
      return present(files, ["src/lib/subscription.ts", ".github/workflows/cd-cloud.yml"])
    },
  },
  {
    id: "health-probe",
    label: "Process health probe",
    nodeIds: [],
    evidence: (files, facts) => {
      if (!files.includes("src/app/api/heartbeat/route.ts")) {
        return []
      }
      return facts.composeProbesHeartbeat
        ? present(files, ["src/app/api/heartbeat/route.ts", "docker-compose.yml"])
        : ["src/app/api/heartbeat/route.ts"]
    },
  },
]

export function detectPatterns(files: string[], facts: RepoFacts): DetectedPattern[] {
  const normalized = files.map(normalize)
  return PATTERN_CATALOG.flatMap((pattern) => {
    const evidence = pattern.evidence(normalized, facts)
    if (evidence.length === 0) {
      return []
    }
    return [
      {
        id: pattern.id,
        label: pattern.label,
        evidence,
        nodeIds: pattern.nodeIds,
      },
    ]
  })
}

function moduleFolderCount(files: string[]): number {
  const folders = new Set<string>()
  for (const file of files.map(normalize)) {
    const match = file.match(/^(src\/queries\/[^/]+|src\/app\/api\/[^/]+)/)
    if (match) {
      folders.add(match[1])
    }
  }
  return folders.size
}

function realRootPackage(facts: RepoFacts): string[] {
  return facts.packageJsonPaths.includes("package.json") ? ["package.json"] : []
}

function isWriteQuery(file: string): boolean {
  const name = file.split("/").at(-1) ?? ""
  return (
    file.includes("src/queries/sql/") &&
    (name.startsWith("save") || name.startsWith("create") || name.startsWith("update"))
  )
}

const COLLECT_ROUTES = [
  "src/app/api/send/route.ts",
  "src/app/api/record/route.ts",
  "src/app/api/batch/route.ts",
  "src/app/api/config/route.ts",
]

const ANALYTICS_MODULES = [
  "funnels",
  "retention",
  "journeys",
  "heatmap",
  "revenue",
  "performance",
  "replays",
  "goals",
  "pageviews",
  "events",
  "sessions",
  "utm",
]

function present(files: string[], paths: string[]): string[] {
  return paths.filter((file) => files.includes(file))
}

function isPrismaQuery(file: string): boolean {
  return file.startsWith("src/queries/prisma/") && file.endsWith(".ts") && !file.endsWith(".test.ts")
}

function isReadQuery(file: string): boolean {
  const name = file.split("/").at(-1) ?? ""
  return (
    file.includes("src/queries/sql/") &&
    (name.startsWith("get") || name.startsWith("extract"))
  )
}
