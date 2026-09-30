import { detectFromFiles, evidenceByNode } from "../core/detect"
import { detectPatterns } from "../core/patterns"
import { detectStack } from "../core/stack"
import { classifyStyle } from "../core/style"
import { buildTree, listUnmodeledFolders } from "../core/tree"
import type { RepoSnapshot } from "../core/types"
import type { PlumbConfig } from "./config"
import { readRepoFacts } from "./facts"
import { gitRevParseHead } from "./git"
import { loadModel } from "./load"
import { UnknownRepoError, getRepo } from "./repos"
import { walkFiles } from "./walk"

export function buildRepoSnapshot(repoId: string, config: PlumbConfig): RepoSnapshot {
  const repo = getRepo(repoId)
  if (!repo) {
    throw new UnknownRepoError(repoId)
  }
  const files = walkFiles(config.targetRepo)
  const facts = readRepoFacts(config.targetRepo, files)
  const model = loadModel(config.archDir)
  const detected = detectFromFiles(model, files)
  return {
    repo: {
      id: repo.id,
      label: repo.label,
      gitHead: gitRevParseHead(config.targetRepo),
    },
    model,
    tree: buildTree(files, model),
    evidence: evidenceByNode(detected),
    stack: detectStack(facts),
    patterns: detectPatterns(files, facts),
    style: classifyStyle(facts, files),
    unmodeled: listUnmodeledFolders(files, model.nodes),
  }
}
