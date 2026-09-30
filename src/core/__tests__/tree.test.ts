import { describe, expect, it } from "vitest"
import { buildTree, listUnmodeledFolders } from "../tree"
import { sampleModel } from "./fixtures"

describe("buildTree", () => {
  it("assigns send/route.ts to ingest-api and aggregates dir owner counts", () => {
    const tree = buildTree(
      [
        "src/app/api/send/route.ts",
        "src/queries/sql/getWebsiteStats.ts",
        "README.md",
      ],
      sampleModel,
    )

    const src = tree.children.find((child) => child.name === "src")
    const app = src?.children.find((child) => child.name === "app")
    const api = app?.children.find((child) => child.name === "api")
    const send = api?.children.find((child) => child.name === "send")
    const route = send?.children.find((child) => child.name === "route.ts")

    expect(route?.kind).toBe("file")
    expect(route?.ownerId).toBe("ingest-api")
    expect(send?.ownerCounts["ingest-api"]).toBe(1)
    expect(src?.ownerCounts["ingest-api"]).toBe(1)
    expect(src?.ownerCounts["analytics-reads"]).toBe(1)
  })

  it("does not mutate the input file list", () => {
    const files = ["src/app/api/send/route.ts"]
    const snapshot = JSON.stringify(files)
    buildTree(files, sampleModel)
    expect(JSON.stringify(files)).toBe(snapshot)
  })
})

describe("listUnmodeledFolders", () => {
  it("reports shallow src folders that have no owner", () => {
    const folders = listUnmodeledFolders(
      [
        "src/app/api/send/route.ts",
        "src/i18n/en.json",
        "src/assets/logo.svg",
        "src/assets/icons/x.svg",
      ],
      sampleModel.nodes,
    )
    expect(folders).toContain("src/i18n/")
    expect(folders).toContain("src/assets/")
    expect(folders).not.toContain("src/assets/icons/")
    expect(folders).not.toContain("src/app/")
  })
})
