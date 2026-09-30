import { writeFileSync } from "node:fs"
import path from "node:path"
import { detectFromFiles } from "../src/core/detect"
import { detectPatterns } from "../src/core/patterns"
import { detectStack } from "../src/core/stack"
import { classifyStyle } from "../src/core/style"
import { listUnmodeledFolders } from "../src/core/tree"
import { loadConfig } from "../src/server/config"
import { readRepoFacts } from "../src/server/facts"
import { loadModel } from "../src/server/load"
import { walkFiles } from "../src/server/walk"

function main() {
  const config = loadConfig()
  const model = loadModel(config.archDir)
  const files = walkFiles(config.targetRepo)
  const facts = readRepoFacts(config.targetRepo, files)
  const report = detectFromFiles(model, files)
  const stack = detectStack(facts)
  const patterns = detectPatterns(files, facts)
  const style = classifyStyle(facts, files)
  const unmodeled = listUnmodeledFolders(files, model.nodes)
  const out = {
    version: 2 as const,
    nodes: report.nodes,
    stack,
    patterns,
    style,
    unmodeled,
  }
  const outPath = path.join(config.archDir, "detected.json")
  writeFileSync(outPath, `${JSON.stringify(out, null, 2)}\n`, "utf8")
  console.log(`stack: ${stack.map((item) => item.id).join(", ") || "(none)"}`)
  console.log(`patterns: ${patterns.map((item) => item.id).join(", ") || "(none)"}`)
  console.log(`style: ${style.label}`)
  for (const caveat of style.not) {
    console.log(`  ${caveat}`)
  }
  console.log(`unmodeled (${unmodeled.length}):`)
  for (const folder of unmodeled) {
    console.log(`  ${folder}`)
  }
  for (const node of report.nodes) {
    const count = String(node.fileCount).padStart(5, " ")
    const missing =
      node.missingAnchors.length > 0
        ? `  missing: ${node.missingAnchors.join(", ")}`
        : ""
    console.log(`${count}  ${node.source.padEnd(9)}  ${node.id}${missing}`)
  }
  console.log(`wrote ${outPath} (${files.length} files walked)`)
}

main()
