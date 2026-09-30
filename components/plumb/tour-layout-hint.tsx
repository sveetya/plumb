import type { TourSurface } from "./tour-steps"

export function TourLayoutHint({ surface }: { surface: TourSurface }) {
  const regions = highlight(surface)
  return (
    <div
      aria-hidden
      className={`grid h-16 w-28 shrink-0 grid-rows-[10px_1fr] gap-1 rounded-lg border bg-background p-1.5 ${
        surface === "none" ? "opacity-60" : ""
      }`}
    >
      <div className={regionClass(regions.header)} />
      <div className="grid grid-cols-[22px_minmax(0,1fr)_26px] gap-1">
        <div className={regionClass(regions.tree)} />
        <div className={regionClass(regions.map)} />
        <div className={regionClass(regions.inspector)} />
      </div>
    </div>
  )
}

function highlight(surface: TourSurface) {
  if (surface === "workspace") {
    return { header: true, tree: true, map: true, inspector: true }
  }
  if (surface === "map") {
    return { header: false, tree: false, map: true, inspector: false }
  }
  if (surface === "tree") {
    return { header: false, tree: true, map: false, inspector: true }
  }
  if (surface === "inspector") {
    return { header: false, tree: false, map: false, inspector: true }
  }
  return { header: false, tree: false, map: false, inspector: false }
}

function regionClass(active: boolean) {
  return active
    ? "rounded-[3px] bg-primary/55 ring-1 ring-primary"
    : "rounded-[3px] bg-foreground/12"
}
