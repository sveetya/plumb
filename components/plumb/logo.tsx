export function PlumbLogoMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 28 28"
      className={className}
    >
      <rect
        x="3"
        y="11"
        width="10"
        height="6"
        rx="2"
        fill="currentColor"
        opacity="0.9"
      />
      <rect
        x="15"
        y="11"
        width="10"
        height="6"
        rx="2"
        fill="currentColor"
        opacity="0.55"
      />
      <rect x="12" y="13" width="4" height="2" rx="1" fill="currentColor" />
    </svg>
  )
}

export function PlumbLogo({ className }: { className?: string }) {
  return (
    <div className={className}>
      <PlumbLogoMark className="size-7 shrink-0 text-primary" />
      <span className="font-heading text-lg font-medium tracking-tight">
        Plumb
      </span>
    </div>
  )
}
