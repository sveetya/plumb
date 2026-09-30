import { z } from "zod"
import { checkFiles } from "../core/check"
import { MAX_CHECK_FILES } from "../core/envelope"
import { hashCanonical } from "../core/hash"
import type { CheckPayload, CheckSource } from "../core/types"
import type { PlumbConfig } from "./config"
import { gitDiffNameOnly, gitRevParseHead } from "./git"
import { loadFixture, loadIntent, loadModel } from "./load"
import { insertCheckRun } from "./runs"

export const fixtureNameSchema = z.enum(["wrong-layer", "good-ingest"])
export const intentIdSchema = z.string().regex(/^[a-z0-9-]+$/)
export const checkSourceSchema = z.enum(["fixture", "git"])

export type { CheckSource }

export async function runPlumbCheck(input: {
  config: PlumbConfig
  intentId: string
  source: CheckSource
  fixture?: string
}): Promise<CheckPayload> {
  const intentId = intentIdSchema.parse(input.intentId)
  const model = loadModel(input.config.archDir)
  const intent = loadIntent(input.config.archDir, intentId)
  const loaded = loadChangedFiles(input)
  const truncated = loaded.length > MAX_CHECK_FILES
  const files = loaded.slice(0, MAX_CHECK_FILES)
  const result = checkFiles({ model, intent, files })
  const modelHash = hashCanonical(model)
  const intentHash = hashCanonical(intent)
  const gitHead = gitRevParseHead(input.config.targetRepo)
  const history = await insertCheckRun(input.config, {
    intent_id: intentId,
    target_repo: input.config.targetRepo,
    git_head: gitHead ?? null,
    source: input.source,
    model_hash: modelHash,
    intent_hash: intentHash,
    pass: result.pass,
    counts: result.counts,
    files: result.files,
  })
  return {
    ...result,
    historySaved: history.saved,
    historyError: history.error,
    gitHead,
    modelHash,
    intentHash,
    truncated,
    intentId,
    source: input.source,
  }
}

function loadChangedFiles(input: {
  config: PlumbConfig
  source: CheckSource
  fixture?: string
}): string[] {
  if (input.source === "git") {
    return gitDiffNameOnly(input.config.targetRepo, input.config.diffBase)
  }
  const fixture = fixtureNameSchema.parse(input.fixture)
  return loadFixture(input.config.archDir, fixture)
}
