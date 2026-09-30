export type TourIconKey =
  | "folder-search"
  | "waypoints"
  | "network"
  | "list-tree"
  | "layers"

export type TourSurface = "none" | "workspace" | "map" | "tree" | "inspector"

export type TourStep = Readonly<{
  id: string
  kicker: string
  title: string
  body: string
  icon: TourIconKey
  surface: TourSurface
}>

export const TOUR_STEPS: readonly TourStep[] = Object.freeze([
  {
    id: "problem",
    kicker: "The first hour in a repo",
    title: "Folders don't show how code connects",
    body: "You open a repo and see folders. You still can't tell what calls what, or where your change belongs.",
    icon: "folder-search",
    surface: "none",
  },
  {
    id: "solution",
    kicker: "What Plumb does",
    title: "Plumb reads your repo and draws it",
    body: "It traces real calls, imports, queries, and events into one map. Then it names the patterns so you can see how the repo is actually built.",
    icon: "waypoints",
    surface: "workspace",
  },
  {
    id: "map",
    kicker: "The map, center",
    title: "See how it's actually wired",
    body: "Each box is a part of your app. Each line is a real call, import, query, write, or event.",
    icon: "network",
    surface: "map",
  },
  {
    id: "inspect",
    kicker: "File tree and Node tab",
    title: "Start from any file or box",
    body: "Pick a file on the left or a box on the map. The Node tab shows the proof, and every connection in and out.",
    icon: "list-tree",
    surface: "tree",
  },
  {
    id: "patterns",
    kicker: "Patterns tab",
    title: "Name what you're looking at",
    body: "Plumb reads the style and the stack for you. Click a pattern to light up the parts that use it.",
    icon: "layers",
    surface: "inspector",
  },
])

export function nextStepIndex(index: number, total: number) {
  return Math.min(index + 1, total - 1)
}

export function prevStepIndex(index: number) {
  return Math.max(index - 1, 0)
}

export function isLastStep(index: number, total: number) {
  return index === total - 1
}
