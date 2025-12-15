import type { LucideIcon } from "lucide-react"

interface NavItemProps {
  icon: LucideIcon
  title: string
  description: string
  href?: string
}

export function NavItem({ icon: Icon, title, description, href = "#" }: NavItemProps) {
  return (
    <a href={href} className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-accent">
      <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/50">
        <Icon className="size-5 text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
    </a>
  )
}
