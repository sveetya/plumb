import { readFileSync } from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import { parse } from "yaml"
import { parseArchitectureModel, parseIntent } from "../core/schema"
import type { ArchitectureModel, Intent } from "../core/types"

export function loadModel(archDir: string): ArchitectureModel {
  const raw = readFileSync(path.join(archDir, "model.yaml"), "utf8")
  return parseArchitectureModel(parse(raw))
}

export function loadIntent(archDir: string, intentId: string): Intent {
  const raw = readFileSync(
    path.join(archDir, "intents", `${intentId}.md`),
    "utf8",
  )
  const parsed = matter(raw)
  return parseIntent(parsed.data, parsed.content)
}

export function loadFixture(archDir: string, name: string): string[] {
  const raw = readFileSync(
    path.join(archDir, "demo", `${name}.files.txt`),
    "utf8",
  )
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"))
}
