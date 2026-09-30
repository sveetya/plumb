import {
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  FolderSearch,
  Layers,
  ListTree,
  Network,
  Waypoints,
  type LucideIcon,
} from "lucide-react"
import { TourLayoutHint } from "./tour-layout-hint"
import type { TourIconKey, TourStep } from "./tour-steps"

const ICONS: Record<TourIconKey, LucideIcon> = {
  "folder-search": FolderSearch,
  waypoints: Waypoints,
  network: Network,
  "list-tree": ListTree,
  layers: Layers,
}

export function TourStepView({ step }: { step: TourStep }) {
  const Icon = ICONS[step.icon]
  return (
    <div
      key={step.id}
      aria-live="polite"
      className="flex flex-col gap-4 motion-reduce:animate-none animate-in fade-in-0 duration-150"
    >
      <div className="flex items-start justify-between gap-4 pr-8">
        <div className="flex size-10 items-center justify-center rounded-xl border bg-muted/40">
          <Icon aria-hidden className="size-5 text-foreground/80" />
        </div>
        <TourLayoutHint surface={step.surface} />
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-xs text-muted-foreground">{step.kicker}</p>
        <DialogTitle data-testid="tour-step-title">{step.title}</DialogTitle>
        <DialogDescription>{step.body}</DialogDescription>
      </div>
    </div>
  )
}
