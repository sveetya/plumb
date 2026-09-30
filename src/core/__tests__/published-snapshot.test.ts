import { describe, expect, it } from "vitest"
import { publishedSnapshot } from "../../server/published-snapshot"

describe("publishedSnapshot", () => {
  it("loads the prebuilt umami map without reading the repo", () => {
    const snapshot = publishedSnapshot()
    expect(snapshot.repo.id).toBe("umami")
    expect(snapshot.model.nodes.length).toBeGreaterThan(0)
    expect(snapshot.tree.kind).toBe("dir")
  })
})
