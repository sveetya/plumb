import { mkdirSync, writeFileSync } from "node:fs"
import path from "node:path"
import { loadConfig } from "../src/server/config"
import { buildRepoSnapshot } from "../src/server/snapshot"

const root = process.cwd()
const outDir = path.join(root, "src", "generated")
const outFile = path.join(outDir, "snapshot.json")
const config = {
  ...loadConfig(),
  archDir: path.join(root, "architecture"),
  targetRepo: path.join(root, "umami"),
}

mkdirSync(outDir, { recursive: true })
const snapshot = buildRepoSnapshot("umami", config)
writeFileSync(outFile, `${JSON.stringify(snapshot)}\n`, "utf8")
console.log(`wrote ${outFile} (${snapshot.model.nodes.length} nodes)`)
