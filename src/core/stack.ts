import type { RepoFacts, TechEvidence, TechId } from "./types"
import { normalize } from "./paths"

type TechRule = {
  id: TechId
  evidence: (facts: RepoFacts) => string[]
}

const TECH_RULES: TechRule[] = [
  {
    id: "nextjs",
    evidence: (facts) => [
      ...(hasDep(facts, "next") ? ["package.json:next"] : []),
      ...(facts.hasNextConfig ? ["next.config.ts"] : []),
    ],
  },
  {
    id: "react",
    evidence: (facts) => (hasDep(facts, "react") ? ["package.json:react"] : []),
  },
  {
    id: "typescript",
    evidence: (facts) => [
      ...(hasDep(facts, "typescript") ? ["package.json:typescript"] : []),
      ...(facts.hasTsconfig ? ["tsconfig.json"] : []),
    ],
  },
  {
    id: "prisma",
    evidence: (facts) => [
      ...(hasDep(facts, "prisma") || hasDep(facts, "@prisma/client")
        ? ["package.json:prisma"]
        : []),
      ...(facts.hasPrismaSchema ? ["prisma/schema.prisma"] : []),
    ],
  },
  {
    id: "postgresql",
    evidence: (facts) => [
      ...(facts.prismaProvider === "postgresql" ? ["prisma provider postgresql"] : []),
      ...facts.composeServices
        .filter((service) => infraName(service.image).includes("postgres"))
        .map((service) => `compose:${service.name}`),
    ],
  },
  {
    id: "clickhouse",
    evidence: (facts) => [
      ...(hasDep(facts, "@clickhouse/client") ? ["package.json:@clickhouse/client"] : []),
      ...(facts.hasClickhouseSchema ? ["db/clickhouse/"] : []),
    ],
  },
  {
    id: "kafka",
    evidence: (facts) => [
      ...(hasDep(facts, "kafkajs") ? ["package.json:kafkajs"] : []),
      ...(facts.hasKafkaTs ? ["src/lib/kafka.ts"] : []),
    ],
  },
  {
    id: "redis",
    evidence: (facts) => [
      ...(hasDep(facts, "redis") ? ["package.json:redis"] : []),
      ...(facts.hasRedisTs ? ["src/lib/redis.ts"] : []),
    ],
  },
  {
    id: "docker",
    evidence: (facts) => [
      ...(facts.hasDockerfile ? ["Dockerfile"] : []),
      ...(facts.hasDockerCompose ? ["docker-compose.yml"] : []),
    ],
  },
  {
    id: "github",
    evidence: (facts) => (facts.hasGithubDir ? [".github/"] : []),
  },
]

export function detectStack(facts: RepoFacts): TechEvidence[] {
  return TECH_RULES.flatMap((rule) => {
    const evidence = rule.evidence(facts)
    return evidence.length > 0 ? [{ id: rule.id, evidence }] : []
  })
}

export function realPackageJsonPaths(paths: string[]): string[] {
  return paths
    .map(normalize)
    .filter((path) => path.endsWith("package.json"))
    .filter((path) => !path.includes("/node_modules/"))
    .filter((path) => !path.startsWith("packages/"))
}

export function deployableCount(facts: RepoFacts): number {
  const composeBuilds = facts.composeServices.filter((service) => service.hasBuild).length
  const appPackages = facts.packageJsonPaths.filter((path) =>
    /^apps\/[^/]+\/package\.json$/.test(normalize(path)),
  ).length
  if (composeBuilds + appPackages >= 2) {
    return composeBuilds + appPackages
  }
  const realPackages = realPackageJsonPaths(facts.packageJsonPaths).length
  return Math.max(realPackages, composeBuilds + appPackages, realPackages > 0 ? 1 : 0)
}

function hasDep(facts: RepoFacts, name: string): boolean {
  return facts.dependencyNames.includes(name)
}

function infraName(image: string | undefined): string {
  return (image ?? "").toLowerCase()
}
