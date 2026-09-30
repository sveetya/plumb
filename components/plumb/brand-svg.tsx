"use client"

import { svgWithClass } from "@/src/core/svg-with-class"

export function BrandSvg({
  svg,
  className,
}: {
  svg: string
  className?: string
}) {
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 [&_svg]:block [&_svg]:size-4"
      dangerouslySetInnerHTML={{
        __html: svgWithClass(svg, className ?? "size-4"),
      }}
    />
  )
}
