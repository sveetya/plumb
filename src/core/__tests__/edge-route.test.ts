import { describe, expect, it } from "vitest"
import { mapEdgeLabel, routeEdge } from "../edge-route"
import { sampleModel } from "./fixtures"

describe("routeEdge", () => {
  it("exits right when the target sits to the right", () => {
    expect(routeEdge("tracker", "ingest-api", sampleModel)).toEqual({
      sourceHandle: "s-right",
      targetHandle: "t-left",
    })
  })

  it("exits left when the target sits to the left", () => {
    expect(routeEdge("dashboard-ui", "analytics-api", sampleModel)).toEqual({
      sourceHandle: "s-left",
      targetHandle: "t-right",
    })
  })

  it("exits bottom when the target sits below", () => {
    expect(routeEdge("ingest-api", "sql-write", sampleModel)).toEqual({
      sourceHandle: "s-bottom",
      targetHandle: "t-top",
    })
  })
})

describe("mapEdgeLabel", () => {
  it("hides labels until the edge is in focus", () => {
    const edge = sampleModel.edges[0]
    expect(mapEdgeLabel(edge, false)).toBeUndefined()
    expect(mapEdgeLabel(edge, true)).toBe(edge.label)
  })
})
