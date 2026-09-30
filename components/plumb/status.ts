import type { NodeStatus } from "@/src/core/types"

export function statusLabel(status: NodeStatus): string {
  if (status === "allowed") return "Allowed"
  if (status === "denied") return "Denied"
  if (status === "unscoped") return "Unscoped"
  return "Idle"
}

export function statusRingClass(status: NodeStatus): string {
  if (status === "allowed") return "ring-2 ring-emerald-500"
  if (status === "denied") return "ring-2 ring-red-500"
  if (status === "unscoped") return "ring-2 ring-amber-500"
  return "ring-1 ring-border"
}

export function statusTextClass(status: NodeStatus): string {
  if (status === "allowed") return "text-emerald-700 dark:text-emerald-400"
  if (status === "denied") return "text-red-700 dark:text-red-400"
  if (status === "unscoped") return "text-amber-700 dark:text-amber-400"
  return "text-muted-foreground"
}
