import { mkdirSync, writeFileSync } from "node:fs"
import path from "node:path"
import { loadConfig } from "../src/server/config"
import { buildRepoSnapshot } from "../src/server/snapshot"

const outDir = path.join(process.cwd(), "src", "generated")
const outFile = path.join(outDir, "snapshot.json")

mkdirSync(outDir, { recursive: true })
const snapshot = buildRepoSnapshot("umami", loadConfig())
writeFileSync(outFile, `${JSON.stringify(snapshot)}\n`, "utf8")
console.log(`wrote ${outFile} (${snapshot.model.nodes.length} nodes)`)
