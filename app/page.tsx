import { Workspace } from "@/components/plumb/workspace"
import { loadConfig } from "@/src/server/config"
import { buildRepoSnapshot } from "@/src/server/snapshot"

export const dynamic = "force-dynamic"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ repo?: string }>
}) {
  const params = await searchParams
  const repo = params.repo?.trim() || "umami"
  const config = loadConfig()
  const snapshot = buildRepoSnapshot(repo, config)
  return <Workspace snapshot={snapshot} />
}
