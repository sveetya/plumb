"use client"

import type { ReactNode, SVGProps } from "react"
import clickhouse from "@thesvg/icons/clickhouse"
import kafka from "@thesvg/icons/kafka"
import { Box, Database, Globe, Server } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TechId } from "@/src/core/types"
import { Docker } from "@/components/ui/svgs/docker"
import { GithubDark } from "@/components/ui/svgs/githubDark"
import { GithubLight } from "@/components/ui/svgs/githubLight"
import { NextjsIconDark } from "@/components/ui/svgs/nextjsIconDark"
import { Postgresql } from "@/components/ui/svgs/postgresql"
import { Prisma } from "@/components/ui/svgs/prisma"
import { PrismaDark } from "@/components/ui/svgs/prismaDark"
import { ReactDark } from "@/components/ui/svgs/reactDark"
import { ReactLight } from "@/components/ui/svgs/reactLight"
import { Redis } from "@/components/ui/svgs/redis"
import { Typescript } from "@/components/ui/svgs/typescript"
import { BrandSvg } from "./brand-svg"

type IconProps = SVGProps<SVGSVGElement> & { className?: string }

function Dual({
  Light,
  Dark,
  className,
}: {
  Light: (props: IconProps) => ReactNode
  Dark: (props: IconProps) => ReactNode
  className?: string
}) {
  return (
    <>
      <Light aria-hidden className={cn("size-4 shrink-0 dark:hidden", className)} />
      <Dark aria-hidden className={cn("hidden size-4 shrink-0 dark:block", className)} />
    </>
  )
}

function LucideFallback({
  tech,
  className,
}: {
  tech: TechId
  className?: string
}) {
  const classes = cn("size-4 shrink-0 text-muted-foreground", className)
  if (tech === "postgresql" || tech === "redis") {
    return <Database aria-hidden className={classes} />
  }
  if (tech === "nextjs" || tech === "react" || tech === "github") {
    return <Globe aria-hidden className={classes} />
  }
  if (tech === "docker") {
    return <Box aria-hidden className={classes} />
  }
  return <Server aria-hidden className={classes} />
}

export function TechIcon({
  tech,
  className,
}: {
  tech: TechId
  className?: string
}) {
  switch (tech) {
    case "nextjs":
      return (
        <NextjsIconDark
          aria-hidden
          className={cn("size-4 shrink-0 dark:invert", className)}
        />
      )
    case "react":
      return <Dual Light={ReactLight} Dark={ReactDark} className={className} />
    case "prisma":
      return <Dual Light={Prisma} Dark={PrismaDark} className={className} />
    case "postgresql":
      return (
        <Postgresql aria-hidden className={cn("size-4 shrink-0", className)} />
      )
    case "github":
      return <Dual Light={GithubLight} Dark={GithubDark} className={className} />
    case "typescript":
      return (
        <Typescript aria-hidden className={cn("size-4 shrink-0", className)} />
      )
    case "docker":
      return <Docker aria-hidden className={cn("size-4 shrink-0", className)} />
    case "redis":
      return <Redis aria-hidden className={cn("size-4 shrink-0", className)} />
    case "clickhouse":
      return <BrandSvg svg={clickhouse.svg} className={className} />
    case "kafka":
      return (
        <BrandSvg
          svg={kafkaDarkSvg(kafka.svg)}
          className={cn("text-foreground", className)}
        />
      )
    default:
      return <LucideFallback tech={tech} className={className} />
  }
}

function kafkaDarkSvg(svg: string): string {
  return svg
    .replace(/^<\?xml[^>]*>/, "")
    .trim()
    .replaceAll(/fill="#1[Aa]1919"/g, 'fill="currentColor"')
}
