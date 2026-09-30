"use client"

import { useCallback, useMemo, useState } from "react"
import {
  focusForNode,
  focusForPath,
  focusForPattern,
} from "@/src/core/focus"
import type { Focus, RepoSnapshot, TreeEntry } from "@/src/core/types"

export type InspectorTab = "node" | "patterns"

const IDLE_FOCUS: Focus = {
  kind: "node",
  key: "",
  nodeIds: [],
  edgeIds: [],
  paths: [],
  unmodeled: false,
}

export function useFocus(snapshot: RepoSnapshot) {
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(
    null,
  )
  const [selectedTab, setSelectedTab] = useState<InspectorTab>("node")
  const files = useMemo(() => collectFiles(snapshot.tree), [snapshot.tree])

  const focus = useMemo((): Focus => {
    if (selectedPath !== null) {
      return focusForPath(selectedPath, snapshot.model, files)
    }
    if (selectedNodeId !== null) {
      return focusForNode(selectedNodeId, snapshot.model, files)
    }
    if (selectedPatternId !== null) {
      return focusForPattern(
        selectedPatternId,
        snapshot.model,
        files,
        snapshot.patterns,
      )
    }
    return IDLE_FOCUS
  }, [files, selectedNodeId, selectedPath, selectedPatternId, snapshot])

  const selectPath = useCallback((path: string) => {
    setSelectedPath(path)
    setSelectedNodeId(null)
    setSelectedPatternId(null)
    setSelectedTab("node")
  }, [])

  const selectNode = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId)
    setSelectedPath(null)
    setSelectedPatternId(null)
    setSelectedTab("node")
  }, [])

  const selectPattern = useCallback((patternId: string) => {
    setSelectedPatternId(patternId)
    setSelectedPath(null)
    setSelectedNodeId(null)
    setSelectedTab("patterns")
  }, [])

  const clearFocus = useCallback(() => {
    setSelectedPath(null)
    setSelectedNodeId(null)
    setSelectedPatternId(null)
    setSelectedTab("node")
  }, [])

  return {
    selectedPath,
    selectedNodeId,
    selectedPatternId,
    selectedTab,
    setSelectedTab,
    focus,
    selectPath,
    selectNode,
    selectPattern,
    clearFocus,
  }
}

export type FocusController = ReturnType<typeof useFocus>

function collectFiles(entry: TreeEntry): string[] {
  if (entry.kind === "file") {
    return [entry.path]
  }
  return entry.children.flatMap((child) => collectFiles(child))
}
