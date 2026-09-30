import { z } from "zod"
import type { ArchitectureModel, Intent } from "./types"

const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
})

const sizeSchema = z.object({
  width: z.number(),
  height: z.number(),
})

const techSchema = z.enum([
  "nextjs",
  "react",
  "typescript",
  "prisma",
  "postgresql",
  "clickhouse",
  "kafka",
  "redis",
  "docker",
  "github",
])

const groupSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  position: positionSchema,
  size: sizeSchema,
})

const nodeSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  kind: z.enum(["client", "app", "api", "module", "store", "queue", "cache"]),
  runtime: z.enum(["browser", "server", "external"]).optional(),
  group: z.string().min(1).optional(),
  tech: z.array(techSchema).default([]),
  anchors: z.array(z.string()).default([]),
  position: positionSchema,
  optional: z.boolean().optional(),
})

const edgeSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  kind: z.enum(["http", "imports", "sql", "writes", "event"]),
  label: z.string().min(1).optional(),
  optional: z.boolean().optional(),
})

export const architectureModelSchema = z.object({
  version: z.literal(2),
  name: z.string().min(1),
  repo: z.object({
    id: z.string().min(1),
    github: z.string().min(1),
  }),
  groups: z.array(groupSchema).default([]),
  nodes: z.array(nodeSchema),
  edges: z.array(edgeSchema).default([]),
})

export const intentFrontmatterSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  allow: z.array(z.string()),
  deny: z.array(z.string()),
  strict: z.boolean().default(false),
  node_ids: z.array(z.string()).optional(),
})

export function parseArchitectureModel(raw: unknown): ArchitectureModel {
  return architectureModelSchema.parse(raw)
}

export function parseIntent(frontmatter: unknown, body: string): Intent {
  const data = intentFrontmatterSchema.parse(frontmatter)
  return {
    id: data.id,
    title: data.title,
    allow: data.allow,
    deny: data.deny,
    strict: data.strict,
    nodeIds: data.node_ids,
    body,
  }
}
