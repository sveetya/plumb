import { existsSync, readdirSync, readFileSync, type Dirent } from "node:fs"
import path from "node:path"

export function joinRoot(root: string, ...segments: string[]): string {
  return path.join(root, ...segments)
}

export function resolveProjectRoot(
  cwd: string,
  env: Record<string, string | undefined> = process.env,
): string {
  const candidates = [cwd, env.LAMBDA_TASK_ROOT, "/var/task"].filter(
    (value): value is string => Boolean(value && value.length > 0),
  )
  for (const dir of candidates) {
    if (fileExists(dir, "architecture/model.yaml")) {
      return dir
    }
  }
  return cwd
}

export function fileExists(root: string, rel: string): boolean {
  return existsSync(joinRoot(root, rel))
}

export function readUtf8(root: string, rel: string): string {
  const filePath = joinRoot(root, rel)
  if (!existsSync(filePath)) {
    return ""
  }
  return readFileSync(filePath, "utf8")
}

export function readUtf8Required(root: string, rel: string): string {
  return readFileSync(joinRoot(root, rel), "utf8")
}

export function listDir(current: string): Dirent[] {
  return readdirSync(current, { withFileTypes: true })
}
