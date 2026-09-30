"use client"

import type { RepoSnapshot } from "@/src/core/types"
import { hasMapSelection } from "@/src/core/focus"
import { AppHeader } from "./app-header"
import { FileTree } from "./file-tree"
import { Inspector } from "./inspector"
import { MapCanvas } from "./map-canvas"
import { useFocus } from "./use-focus"

export function Workspace({ snapshot }: { snapshot: RepoSnapshot }) {
  const focus = useFocus(snapshot)

  return (
    <div className="flex h-svh max-h-svh min-w-[1180px] flex-col overflow-hidden">
      <AppHeader repo={snapshot.repo} />
      <div className="grid min-h-0 flex-1 grid-cols-[280px_minmax(0,1fr)_320px] gap-3 overflow-hidden p-3">
        <FileTree
          tree={snapshot.tree}
          unmodeled={snapshot.unmodeled}
          selectedPath={focus.selectedPath}
          focusPaths={focus.focus.paths}
          onSelectPath={focus.selectPath}
        />
        <MapCanvas
          snapshot={snapshot}
          focus={focus.focus}
          hasSelection={hasMapSelection({
            selectedPath: focus.selectedPath,
            selectedNodeId: focus.selectedNodeId,
            selectedPatternId: focus.selectedPatternId,
          })}
          onSelectNode={focus.selectNode}
          onClearFocus={focus.clearFocus}
        />
        <Inspector snapshot={snapshot} focus={focus} />
      </div>
    </div>
  )
}
