"use client"

import type { RepoSnapshot } from "@/src/core/types"
import { PlumbLogo } from "./logo"
import { ProductTour } from "./product-tour"
import { RepoSwitcher } from "./repo-switcher"

export function AppHeader({ repo }: { repo: RepoSnapshot["repo"] }) {
  return (
    <header
      data-testid="app-header"
      className="flex h-12 shrink-0 items-center justify-between border-b px-4"
    >
      <PlumbLogo className="flex items-center gap-2" />
      <div className="flex items-center gap-2">
        <ProductTour />
        <RepoSwitcher repo={repo} />
      </div>
    </header>
  )
}
