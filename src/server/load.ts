import matter from "gray-matter"
import { parse } from "yaml"
import { parseArchitectureModel, parseIntent } from "../core/schema"
import type { ArchitectureModel, Intent } from "../core/types"
import { readUtf8Required } from "./repo-fs"

export function loadModel(archDir: string): ArchitectureModel {
  const raw = readUtf8Required(archDir, "model.yaml")
  return parseArchitectureModel(parse(raw))
}

export function loadIntent(archDir: string, intentId: string): Intent {
  const raw = readUtf8Required(archDir, `intents/${intentId}.md`)
  const parsed = matter(raw)
  return parseIntent(parsed.data, parsed.content)
}

export function loadFixture(archDir: string, name: string): string[] {
  const raw = readUtf8Required(archDir, `demo/${name}.files.txt`)
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"))
}
