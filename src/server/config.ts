import { existsSync, readFileSync } from "node:fs"
import { joinRoot, resolveProjectRoot } from "./repo-fs"

export type PlumbConfig = {
  archDir: string
  targetRepo: string
  diffBase: string
  supabaseUrl?: string
  supabasePublishableKey?: string
  supabaseSecretKey?: string
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): PlumbConfig {
  const root = resolveProjectRoot(process.cwd(), env)
  const fileEnv = readEnvFile(joinRoot(root, ".env.local"))
  const merged = { ...fileEnv, ...definedEnv(env) }
  return {
    archDir: projectDir(root, merged.PLUMB_ARCH_DIR, "architecture"),
    targetRepo: projectDir(root, merged.PLUMB_TARGET_REPO, "umami"),
    diffBase: merged.PLUMB_DIFF_BASE ?? "HEAD",
    supabaseUrl: emptyToUndefined(merged.NEXT_PUBLIC_SUPABASE_URL),
    supabasePublishableKey: emptyToUndefined(
      merged.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    ),
    supabaseSecretKey: emptyToUndefined(merged.SUPABASE_SECRET_KEY),
  }
}

function definedEnv(env: NodeJS.ProcessEnv): Record<string, string> {
  return Object.fromEntries(
    Object.entries(env).flatMap(([key, value]) =>
      value === undefined ? [] : [[key, value]],
    ),
  )
}

function readEnvFile(filePath: string): Record<string, string> {
  if (!existsSync(filePath)) {
    return {}
  }
  return parseEnvText(readFileSync(filePath, "utf8"))
}

function parseEnvText(text: string): Record<string, string> {
  return text.split(/\r?\n/).reduce<Record<string, string>>((acc, line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      return acc
    }
    const eq = trimmed.indexOf("=")
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim()
    return { ...acc, [key]: value }
  }, {})
}

function emptyToUndefined(value: string | undefined): string | undefined {
  return value && value.length > 0 ? value : undefined
}

function projectDir(root: string, value: string | undefined, fallback: string): string {
  const name = value && isProjectRelative(value) ? value : fallback
  return joinRoot(root, name)
}

function isProjectRelative(value: string): boolean {
  return (
    value.length > 0 &&
    !value.startsWith("/") &&
    !value.startsWith("\\") &&
    !value.includes("..") &&
    !/^[A-Za-z]:/.test(value)
  )
}
