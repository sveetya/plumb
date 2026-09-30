import type { ArchitectureStyle, RepoFacts } from "./types"
import { normalize } from "./paths"
import { deployableCount, realPackageJsonPaths } from "./stack"

export function classifyStyle(facts: RepoFacts, files: string[]): ArchitectureStyle {
  const deployables = deployableCount(facts)
  const modules = moduleFolderCount(files)
  const packageCount = realPackageJsonPaths(facts.packageJsonPaths).length
  if (deployables >= 2) {
    return {
      id: "microservices",
      label: "Microservices",
      reasons: [`${deployables} deployables`],
      not: [],
    }
  }
  if (deployables === 1 && modules >= 3) {
    return {
      id: "modular-monolith",
      label: "Modular monolith",
      reasons: [
        `${packageCount || 1} package.json (workspace glob ignored)`,
        `${modules} query/api modules`,
      ],
      not: [
        "not microservices (1 deployable)",
        "not CQRS (shared query module)",
      ],
    }
  }
  return {
    id: "monolith",
    label: "Monolith",
    reasons: [`${deployables} deployable`],
    not: ["not microservices (1 deployable)"],
  }
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
