import { NavigationMenuContent, NavigationMenuItem, NavigationMenuTrigger } from "@/components/ui/navigation-menu"
import { NavItem } from "./nav-item"
import { NavSection } from "./nav-section"
import { FileText, MessageSquare, BarChart3, Sparkles, PenTool, Globe } from "lucide-react"

const features = [
  {
    icon: FileText,
    title: "AI Content Generator",
    description: "Create high-quality content with AI assistance",
  },
  {
    icon: MessageSquare,
    title: "AI Chat Assistant",
    description: "Interactive AI conversations for brainstorming",
  },
  {
    icon: PenTool,
    title: "Writing Tools",
    description: "Advanced editing and formatting tools",
  },
  {
    icon: BarChart3,
    title: "Content Analytics",
    description: "Track performance and engagement metrics",
  },
  {
    icon: Sparkles,
    title: "Smart Templates",
    description: "Pre-built templates for various content types",
  },
  {
    icon: Globe,
    title: "Multi-language Support",
    description: "Create content in multiple languages",
  },
]

export function ProductDropdown() {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger className="bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
        Product
      </NavigationMenuTrigger>
      <NavigationMenuContent className="rounded-xl border-border bg-popover p-4 shadow-lg">
        <NavSection title="Features">
          <div className="grid w-[500px] grid-cols-2 gap-1">
            {features.map((feature) => (
              <NavItem
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </NavSection>
      </NavigationMenuContent>
    </NavigationMenuItem>
  )
}
