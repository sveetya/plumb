import { Workspace } from "@/components/plumb/workspace"
import { publishedSnapshot } from "@/src/server/published-snapshot"

export default function Page() {
  return <Workspace snapshot={publishedSnapshot()} />
}
