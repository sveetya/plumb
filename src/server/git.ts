import { execFileSync } from "node:child_process"

export function gitDiffNameOnly(repo: string, base: string): string[] {
  try {
    const output = execFileSync("git", ["-C", repo, "diff", "--name-only", base], {
      encoding: "utf8",
      windowsHide: true,
    })
    return splitLines(output)
  } catch (error) {
    console.error("git diff failed", error)
    throw error
  }
}

export function gitRevParseHead(repo: string): string | undefined {
  try {
    const output = execFileSync("git", ["-C", repo, "rev-parse", "HEAD"], {
      encoding: "utf8",
      windowsHide: true,
    })
    return output.trim()
  } catch (error) {
    console.error("git rev-parse failed", error)
    return undefined
  }
}

function splitLines(output: string): string[] {
  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}
