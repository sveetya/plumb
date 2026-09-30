import { parseFlag } from "../src/server/argv"
import { loadConfig } from "../src/server/config"
import { checkSourceSchema, runPlumbCheck } from "../src/server/run-check"

async function main() {
  const intentId = parseFlag(process.argv, "intent") ?? "bot-ingest"
  const fixture = parseFlag(process.argv, "fixture")
  const source = checkSourceSchema.parse(fixture ? "fixture" : "git")
  const result = await runPlumbCheck({
    config: loadConfig(),
    intentId,
    source,
    fixture,
  })
  console.log(
    JSON.stringify(
      {
        pass: result.pass,
        counts: result.counts,
        files: result.files,
        nodeStatus: result.nodeStatus,
        historySaved: result.historySaved,
        historyError: result.historyError,
      },
      null,
      2,
    ),
  )
  process.exitCode = result.pass ? 0 : 1
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 2
})
