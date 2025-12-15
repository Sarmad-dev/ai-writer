import type React from "react"
interface NavSectionProps {
  title: string
  children: React.ReactNode
}

export function NavSection({ title, children }: NavSectionProps) {
  return (
    <div className="flex flex-col">
      <span className="mb-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</span>
      <div className="flex flex-col">{children}</div>
    </div>
  )
}
