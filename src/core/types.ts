export type NodeKind =
  | "client"
  | "app"
  | "api"
  | "module"
  | "store"
  | "queue"
  | "cache"

export type Runtime = "browser" | "server" | "external"

export type EdgeKind = "http" | "imports" | "sql" | "writes" | "event"

export type TechId =
  | "nextjs"
  | "react"
  | "typescript"
  | "prisma"
  | "postgresql"
  | "clickhouse"
  | "kafka"
  | "redis"
  | "docker"
  | "github"

export type NodeSource = "declared" | "detected"
export type FileStatus = "denied" | "allowed" | "unscoped"
export type NodeStatus = "idle" | "allowed" | "denied" | "unscoped"

export type Position = {
  x: number
  y: number
}

export type Size = {
  width: number
  height: number
}

export type ArchGroup = {
  id: string
  label: string
  position: Position
  size: Size
}

export type ArchNode = {
  id: string
  label: string
  kind: NodeKind
  runtime?: Runtime
  group?: string
  tech: TechId[]
  anchors: string[]
  position: Position
  optional?: boolean
}

export type ArchEdge = {
  from: string
  to: string
  kind: EdgeKind
  label?: string
  optional?: boolean
}

export type ArchitectureModel = {
  version: 2
  name: string
  repo: {
    id: string
    github: string
  }
  groups: ArchGroup[]
  nodes: ArchNode[]
  edges: ArchEdge[]
}

export type Intent = {
  id: string
  title: string
  allow: string[]
  deny: string[]
  strict: boolean
  nodeIds?: string[]
  body: string
}

export type FileVerdict = {
  file: string
  status: FileStatus
  nodeId?: string
  rule?: "allow" | "deny"
}

export type CheckCounts = {
  allowed: number
  denied: number
  unscoped: number
}

export type CheckResult = {
  pass: boolean
  files: FileVerdict[]
  nodeStatus: Record<string, NodeStatus>
  counts: CheckCounts
}

export type DetectedNode = {
  id: string
  source: NodeSource
  fileCount: number
  detected: boolean
  missingAnchors: string[]
}

export type DetectReport = {
  version: 2
  nodes: DetectedNode[]
}

export type CheckSource = "fixture" | "git"

export type CheckPayload = CheckResult & {
  historySaved: boolean
  historyError?: string
  gitHead?: string
  modelHash: string
  intentHash: string
  truncated: boolean
  intentId: string
  source: CheckSource
}

export type CheckRunRow = {
  id: string
  created_at: string
  intent_id: string
  target_repo: string
  git_head: string | null
  source: string
  model_hash: string
  intent_hash: string
  pass: boolean
  counts: CheckCounts
  files: FileVerdict[]
}

export type TreeEntry = {
  name: string
  path: string
  kind: "file" | "dir"
  ownerId?: string
  ownerCounts: Record<string, number>
  children: TreeEntry[]
}

export type Focus = {
  kind: "path" | "node" | "pattern"
  key: string
  nodeIds: string[]
  edgeIds: string[]
  paths: string[]
  unmodeled: boolean
}

export type NodeEvidence = {
  nodeId: string
  fileCount: number
  detected: boolean
  missingAnchors: string[]
}

export type TechEvidence = {
  id: TechId
  evidence: string[]
}

export type PatternId =
  | "modular-monolith"
  | "next-app-router"
  | "route-groups"
  | "route-handler-bff"
  | "repository-query-layer"
  | "verb-split-queries"
  | "dual-store"
  | "env-store-dispatch"
  | "optional-event-stream"
  | "embeddable-tracker"
  | "schema-migrations"
  | "container-deploy"
  | "collect-plane"
  | "three-collectors"
  | "batch-fan-in"
  | "session-replay-sidecar"
  | "bot-gate"
  | "geo-enrichment"
  | "oltp-olap"
  | "analytics-modules"
  | "read-replica"
  | "redis-cache"
  | "resource-authz"
  | "multi-credential"
  | "in-process-mcp"
  | "generated-contracts"
  | "polled-realtime"
  | "collect-edge"
  | "public-share"
  | "zod-boundary"
  | "env-switches"
  | "client-state-split"
  | "i18n-catalog"
  | "cloud-entitlements"
  | "health-probe"

export type DetectedPattern = {
  id: PatternId
  label: string
  evidence: string[]
  nodeIds: string[]
}

export type ArchitectureStyleId =
  | "microservices"
  | "modular-monolith"
  | "monolith"

export type ArchitectureStyle = {
  id: ArchitectureStyleId
  label: string
  reasons: string[]
  not: string[]
}

export type ComposeServiceFact = {
  name: string
  image?: string
  hasBuild: boolean
}

export type RepoFacts = {
  packageJsonPaths: string[]
  dependencyNames: string[]
  prismaProvider?: string
  composeServices: ComposeServiceFact[]
  hasNextConfig: boolean
  hasDockerfile: boolean
  hasDockerCompose: boolean
  hasVercelJson: boolean
  hasNetlifyToml: boolean
  hasPrismaSchema: boolean
  hasClickhouseSchema: boolean
  hasKafkaTs: boolean
  hasRedisTs: boolean
  hasDbTs: boolean
  hasTrackerIndex: boolean
  hasRollupTracker: boolean
  hasUseApi: boolean
  hasQueriesDir: boolean
  hasQueriesPrisma: boolean
  hasQueriesSql: boolean
  hasGithubDir: boolean
  hasTsconfig: boolean
  dbTsHasRunQuery: boolean
  dbTsHasClickhouse: boolean
  dbTsHasKafka: boolean
  runQueryCallCount: number
  routeTsCount: number
  pageTsxCount: number
  routeGroupDirs: string[]
  writeQueryCount: number
  readQueryCount: number
  migrationHits: string[]
  skipAuthRoutes: string[]
  batchImportsSend: boolean
  ingestUsesIsbot: boolean
  hasReadReplica: boolean
  redisHasRateLimit: boolean
  realtimeIsJson: boolean
  mcpUsesInProcessFetch: boolean
  sendHasCollectors: boolean
  subscriptionHasCloudLimits: boolean
  composeProbesHeartbeat: boolean
}

export type RepoSnapshot = {
  repo: { id: string; label: string; gitHead?: string }
  model: ArchitectureModel
  tree: TreeEntry
  evidence: Record<string, NodeEvidence>
  stack: TechEvidence[]
  patterns: DetectedPattern[]
  style: ArchitectureStyle
  unmodeled: string[]
}
