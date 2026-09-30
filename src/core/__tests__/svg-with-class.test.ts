import { describe, expect, test } from "vitest"
import { svgWithClass } from "../svg-with-class"

describe("svgWithClass", () => {
  test("adds a class attribute to a bare svg tag", () => {
    expect(svgWithClass('<svg viewBox="0 0 24 24"></svg>', "size-4")).toBe(
      '<svg class="size-4" viewBox="0 0 24 24"></svg>',
    )
  })

  test("appends to an existing class", () => {
    expect(svgWithClass('<svg class="foo"></svg>', "size-4")).toBe(
      '<svg class="foo size-4"></svg>',
    )
  })
})
