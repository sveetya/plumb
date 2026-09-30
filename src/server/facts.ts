import { parse } from "yaml"
import { normalize } from "../core/paths"
import type { ComposeServiceFact, RepoFacts } from "../core/types"
import { fileExists, readUtf8 } from "./repo-fs"

export function readRepoFacts(root: string, files: string[]): RepoFacts {
  const normalized = files.map(normalize)
  const packageJsonPaths = normalized.filter(
    (file) => file.endsWith("package.json") && !file.includes("/node_modules/"),
  )
  const rootPkg = readJsonObject(root, "package.json")
  const dbText = readText(root, "src/lib/db.ts")
  const prismaText = readText(root, "prisma/schema.prisma")
  return {
    packageJsonPaths,
    dependencyNames: dependencyNames(rootPkg),
    prismaProvider: readPrismaProvider(prismaText),
    composeServices: readComposeServices(root),
    hasNextConfig: existsAny(root, ["next.config.ts", "next.config.js", "next.config.mjs"]),
    hasDockerfile: existsAny(root, ["Dockerfile", "dockerfile"]),
    hasDockerCompose: existsAny(root, ["docker-compose.yml", "docker-compose.yaml"]),
    hasVercelJson: existsPath(root, "vercel.json"),
    hasNetlifyToml: existsPath(root, "netlify.toml"),
    hasPrismaSchema: existsPath(root, "prisma/schema.prisma"),
    hasClickhouseSchema:
      existsPath(root, "db/clickhouse/schema.sql") || existsPath(root, "db/clickhouse"),
    hasKafkaTs: existsPath(root, "src/lib/kafka.ts"),
    hasRedisTs: existsPath(root, "src/lib/redis.ts"),
    hasDbTs: existsPath(root, "src/lib/db.ts"),
    hasTrackerIndex: existsPath(root, "src/tracker/index.ts"),
    hasRollupTracker: existsPath(root, "rollup.tracker.config.js"),
    hasUseApi: normalized.some((file) => file.endsWith("useApi.ts")),
    hasQueriesDir: normalized.some((file) => file.startsWith("src/queries/")),
    hasQueriesPrisma: normalized.some((file) => file.startsWith("src/queries/prisma/")),
    hasQueriesSql: normalized.some((file) => file.startsWith("src/queries/sql/")),
    hasGithubDir:
      existsPath(root, ".github") || normalized.some((file) => file.startsWith(".github/")),
    hasTsconfig: existsAny(root, ["tsconfig.json"]),
    dbTsHasRunQuery: dbText.includes("runQuery("),
    dbTsHasClickhouse: dbText.includes("CLICKHOUSE"),
    dbTsHasKafka: dbText.includes("KAFKA"),
    runQueryCallCount: countRunQueryCalls(root, normalized),
    routeTsCount: normalized.filter((file) => file.endsWith("route.ts")).length,
    pageTsxCount: normalized.filter((file) => file.endsWith("page.tsx")).length,
    routeGroupDirs: routeGroupDirs(normalized),
    writeQueryCount: normalized.filter(isWriteQuery).length,
    readQueryCount: normalized.filter(isReadQuery).length,
    migrationHits: normalized.filter(isMigrationPath),
    ...readPatternSignals(root, normalized),
  }
}

function readPatternSignals(root: string, files: string[]) {
  const send = readText(root, "src/app/api/send/route.ts")
  const record = readText(root, "src/app/api/record/route.ts")
  const batch = readText(root, "src/app/api/batch/route.ts")
  const prisma = readText(root, "src/lib/prisma.ts")
  const redis = readText(root, "src/lib/redis.ts")
  const subscription = readText(root, "src/lib/subscription.ts")
  const mcp = readText(root, "src/app/mcp/route.ts")
  const realtimeRel = files.find(
    (file) => file.includes("/api/realtime/") && file.endsWith("route.ts"),
  )
  const realtime = realtimeRel ? readText(root, realtimeRel) : ""
  return {
    skipAuthRoutes: files.filter(
      (file) => file.endsWith("route.ts") && readText(root, file).includes("skipAuth"),
    ),
    batchImportsSend: batch.includes("send.POST") || batch.includes("@/app/api/send/route"),
    ingestUsesIsbot: send.includes("isbot") && record.includes("isbot"),
    hasReadReplica: prisma.includes("DATABASE_REPLICA_URL"),
    redisHasRateLimit: redis.includes("rateLimit"),
    realtimeIsJson: realtime.includes("json(") && !realtime.includes("text/event-stream"),
    mcpUsesInProcessFetch: mcp.includes("createInProcessFetch"),
    sendHasCollectors: send.includes("pixel") && send.includes("link") && send.includes("website"),
    subscriptionHasCloudLimits: subscription.includes("CLOUD_"),
    composeProbesHeartbeat: composeRaw(root).includes("heartbeat"),
  }
}

function composeRaw(root: string): string {
  for (const rel of ["docker-compose.yml", "docker-compose.yaml"]) {
    const text = readText(root, rel)
    if (text.length > 0) {
      return text
    }
  }
  return ""
}

function dependencyNames(pkg: Record<string, unknown> | undefined): string[] {
  if (!pkg) {
    return []
  }
  const deps = keyNames(pkg.dependencies)
  const dev = keyNames(pkg.devDependencies)
  return unique([...deps, ...dev])
}

function keyNames(value: unknown): string[] {
  if (!value || typeof value !== "object") {
    return []
  }
  return Object.keys(value)
}

function readPrismaProvider(schema: string): string | undefined {
  const datasource = schema.match(/datasource\s+\w+\s*\{([^}]*)\}/)
  if (!datasource?.[1]) {
    return undefined
  }
  const provider = datasource[1].match(/provider\s*=\s*"([^"]+)"/)
  return provider?.[1]
}

function readComposeServices(root: string): ComposeServiceFact[] {
  const rel = ["docker-compose.yml", "docker-compose.yaml"].find((file) =>
    existsPath(root, file),
  )
  if (!rel) {
    return []
  }
  const parsed: unknown = parse(readText(root, rel))
  if (!parsed || typeof parsed !== "object") {
    return []
  }
  const services = (parsed as { services?: unknown }).services
  if (!services || typeof services !== "object") {
    return []
  }
  return Object.entries(services as Record<string, unknown>).map(([name, value]) => {
    const record = isRecord(value) ? value : {}
    return {
      name,
      image: typeof record.image === "string" ? record.image : undefined,
      hasBuild: record.build !== undefined,
    }
  })
}

function countRunQueryCalls(root: string, files: string[]): number {
  return files
    .filter(
      (file) =>
        file === "src/lib/db.ts" ||
        (file.startsWith("src/queries/") && file.endsWith(".ts")),
    )
    .reduce((sum, file) => {
      const text = readText(root, file)
      return sum + countToken(text, "runQuery(")
    }, 0)
}

function routeGroupDirs(files: string[]): string[] {
  const groups = new Set<string>()
  for (const file of files) {
    const match = file.match(/^src\/app\/(\([^/)]+\))\//)
    if (match) {
      groups.add(match[1])
    }
  }
  return [...groups].sort()
}

function isWriteQuery(file: string): boolean {
  const name = file.split("/").at(-1) ?? ""
  return (
    file.startsWith("src/queries/sql/") &&
    (name.startsWith("save") || name.startsWith("create") || name.startsWith("update"))
  )
}

function isReadQuery(file: string): boolean {
  const name = file.split("/").at(-1) ?? ""
  return (
    file.startsWith("src/queries/sql/") &&
    (name.startsWith("get") || name.startsWith("extract"))
  )
}

function isMigrationPath(file: string): boolean {
  return file.includes("/migrations/") || file.includes("/data-migrations/")
}

function existsPath(root: string, rel: string): boolean {
  return fileExists(root, rel)
}

function existsAny(root: string, rels: string[]): boolean {
  return rels.some((rel) => existsPath(root, rel))
}

function readText(root: string, rel: string): string {
  return readUtf8(root, rel)
}

function readJsonObject(
  root: string,
  rel: string,
): Record<string, unknown> | undefined {
  const text = readUtf8(root, rel)
  if (!text) {
    return undefined
  }
  try {
    const parsed: unknown = JSON.parse(text)
    return isRecord(parsed) ? parsed : undefined
  } catch {
    return undefined
  }
}

function countToken(text: string, token: string): number {
  let count = 0
  let from = 0
  while (from < text.length) {
    const index = text.indexOf(token, from)
    if (index === -1) {
      return count
    }
    count += 1
    from = index + token.length
  }
  return count
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function unique(values: string[]): string[] {
  return [...new Set(values)]
}
