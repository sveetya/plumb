import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import {
  fileExists,
  joinRoot,
  listDir,
  readUtf8,
  readUtf8Required,
  resolveProjectRoot,
} from "../../server/repo-fs"

describe("repo-fs", () => {
  let root = ""

  afterEach(() => {
    if (root) {
      rmSync(root, { recursive: true, force: true })
      root = ""
    }
  })

  it("joins, lists, and reads files without treating missing paths as errors", () => {
    root = mkdtempSync(path.join(tmpdir(), "plumb-repo-fs-"))
    writeFileSync(path.join(root, "package.json"), '{"name":"demo"}\n', "utf8")
    expect(joinRoot(root, "src", "lib", "db.ts")).toBe(
      path.join(root, "src", "lib", "db.ts"),
    )
    expect(fileExists(root, "package.json")).toBe(true)
    expect(fileExists(root, "missing.ts")).toBe(false)
    expect(readUtf8(root, "package.json")).toContain('"name":"demo"')
    expect(readUtf8(root, "missing.ts")).toBe("")
    expect(readUtf8Required(root, "package.json")).toContain('"name":"demo"')
    expect(listDir(root).map((entry) => entry.name)).toContain("package.json")
  })

  it("throws when a required file is missing", () => {
    root = mkdtempSync(path.join(tmpdir(), "plumb-repo-fs-missing-"))
    expect(() => readUtf8Required(root, "model.yaml")).toThrow()
  })

  it("resolves the project root from Lambda task root when the model is there", () => {
    root = mkdtempSync(path.join(tmpdir(), "plumb-repo-fs-root-"))
    mkdirSync(path.join(root, "architecture"))
    writeFileSync(path.join(root, "architecture", "model.yaml"), "name: demo\n", "utf8")
    expect(
      resolveProjectRoot("/var", { LAMBDA_TASK_ROOT: root }),
    ).toBe(root)
  })

  it("keeps architecture and umami inside the project when env points at a parent", async () => {
    const { loadConfig } = await import("../../server/config")
    const config = loadConfig({
      PLUMB_ARCH_DIR: "../architecture",
      PLUMB_TARGET_REPO: "../umami",
    } as unknown as NodeJS.ProcessEnv)
    expect(config.archDir.includes("..")).toBe(false)
    expect(config.targetRepo.includes("..")).toBe(false)
    expect(config.archDir.replaceAll("\\", "/").endsWith("/architecture")).toBe(true)
    expect(config.targetRepo.replaceAll("\\", "/").endsWith("/umami")).toBe(true)
  })
})
