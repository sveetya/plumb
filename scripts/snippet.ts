import { parseFlag } from "../src/server/argv"
import { loadConfig } from "../src/server/config"
import { loadIntent, loadModel } from "../src/server/load"
import { renderAgentSnippet } from "../src/core/snippet"
import { intentIdSchema } from "../src/server/run-check"

function main() {
  const config = loadConfig()
  const intentId = intentIdSchema.parse(
    parseFlag(process.argv, "intent") ?? "bot-ingest",
  )
  const model = loadModel(config.archDir)
  const intent = loadIntent(config.archDir, intentId)
  process.stdout.write(renderAgentSnippet(intent, model))
}

main()
