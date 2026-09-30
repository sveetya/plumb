"use client"

import { ChevronDownIcon } from "lucide-react"
import type { RepoSnapshot } from "@/src/core/types"
import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { TechIcon } from "./tech-icon"

const REPO_OPTION = "umami-software/umami"

export function RepoSwitcher({ repo }: { repo: RepoSnapshot["repo"] }) {
  const shortHead = repo.gitHead ? repo.gitHead.slice(0, 7) : null
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-testid="repo-switcher"
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "max-w-[360px] gap-2",
        )}
      >
        <TechIcon tech="github" />
        <span className="truncate">{REPO_OPTION}</span>
        {shortHead ? (
          <span className="font-mono text-xs text-muted-foreground">
            {shortHead}
          </span>
        ) : null}
        <ChevronDownIcon className="size-3.5 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuItem>
          <TechIcon tech="github" />
          <span>{REPO_OPTION}</span>
          {shortHead ? (
            <span className="ml-auto font-mono text-xs text-muted-foreground">
              {shortHead}
            </span>
          ) : null}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
