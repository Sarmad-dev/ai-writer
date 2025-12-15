import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface BentoCardProps {
  title: string
  description: string
  icon: ReactNode
  className?: string
  children?: ReactNode
}

export function BentoCard({ title, description, icon, className, children }: BentoCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card p-6",
        "hover:border-muted-foreground/30 transition-all duration-300",
        "flex flex-col h-full",
        className,
      )}
    >
      <div className="relative z-10 flex flex-col flex-1">
        <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-secondary p-2.5 text-foreground w-fit">
          {icon}
        </div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed flex-1">{description}</p>
        {children && <div className="mt-6 relative z-10">{children}</div>}
      </div>
      <div className="absolute inset-0 bg-linear-to-br from-muted/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  )
}

interface BentoGridProps {
  children: ReactNode
  className?: string
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return <div className={cn("grid gap-4 auto-rows-fr", className)}>{children}</div>
}
