import type { ArchitectureModel, Intent } from "./types"

export function renderAgentSnippet(intent: Intent, model: ArchitectureModel): string {
  const allow = toBullets(intent.allow)
  const deny = toBullets(intent.deny)
  const nodes = toBullets(preferredNodeLines(intent, model))
  return [
    `# Agent context: ${intent.title}`,
    "",
    intent.body.trim(),
    "",
    "## Allowed paths",
    allow,
    "",
    "## Denied paths",
    deny,
    "",
    "## Preferred nodes",
    nodes,
    "",
    "Do not edit denied paths. Stay on the allowed ingest pipe.",
    "",
  ].join("\n")
}

function preferredNodeLines(intent: Intent, model: ArchitectureModel): string[] {
  const ids = intent.nodeIds ?? []
  return ids.flatMap((id) => {
    const node = model.nodes.find((item) => item.id === id)
    return node ? [`${node.label} (${node.id})`] : []
  })
}

function toBullets(items: string[]): string {
  if (items.length === 0) {
    return "- (none)"
  }
  return items.map((item) => `- ${item}`).join("\n")
}
