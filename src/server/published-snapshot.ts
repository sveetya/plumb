import snapshot from "../generated/snapshot.json"
import type { RepoSnapshot } from "../core/types"

export function publishedSnapshot(): RepoSnapshot {
  return snapshot as unknown as RepoSnapshot
}
