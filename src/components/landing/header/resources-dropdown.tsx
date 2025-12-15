import { NavigationMenuContent, NavigationMenuItem, NavigationMenuTrigger } from "@/components/ui/navigation-menu"
import { NavItem } from "./nav-item"
import { NavSection } from "./nav-section"
import {
  Users,
  Star,
  Handshake,
  ListTodo,
  MessageCircle,
  FileText,
  Briefcase,
  PenTool,
  ScrollText,
  Shield,
} from "lucide-react"

const companyItems = [
  {
    icon: Users,
    title: "About Us",
    description: "Learn more about our AI writing platform",
  },
  {
    icon: Star,
    title: "Customers",
    description: "See who is using our AI writing tools",
  },
  {
    icon: Handshake,
    title: "Partnerships",
    description: "Collaborate with us for mutual growth",
  },
  {
    icon: ListTodo,
    title: "Changelog",
    description: "See recent updates and new features",
  },
  {
    icon: MessageCircle,
    title: "Support",
    description: "Get help with your AI writing projects",
  },
]

const resourceItems = [
  {
    icon: FileText,
    title: "Documentation",
    description: "Learn how to use our AI writing tools",
  },
  {
    icon: Briefcase,
    title: "Case Studies",
    description: "See how AI writing transformed businesses",
  },
  {
    icon: PenTool,
    title: "Blog",
    description: "Tips and insights about AI-powered writing",
  },
]

const legalItems = [
  {
    icon: ScrollText,
    title: "Terms of Service",
    description: "",
  },
  {
    icon: Shield,
    title: "Privacy Policy",
    description: "",
  },
]

export function ResourcesDropdown() {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger className="bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
        Resources
      </NavigationMenuTrigger>
      <NavigationMenuContent className="rounded-xl border-border bg-popover p-4 shadow-lg">
        <div className="flex w-[600px] gap-8">
          <NavSection title="Company">
            <div className="flex w-[260px] flex-col gap-1">
              {companyItems.map((item) => (
                <NavItem key={item.title} icon={item.icon} title={item.title} description={item.description} />
              ))}
            </div>
          </NavSection>
          <div className="flex flex-col gap-4">
            <NavSection title="Resources">
              <div className="flex w-[260px] flex-col gap-1">
                {resourceItems.map((item) => (
                  <NavItem key={item.title} icon={item.icon} title={item.title} description={item.description} />
                ))}
              </div>
            </NavSection>
            <NavSection title="Legal">
              <div className="flex flex-col gap-1">
                {legalItems.map((item) => (
                  <a
                    key={item.title}
                    href="#"
                    className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-accent"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/50">
                      <item.icon className="size-5 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{item.title}</span>
                  </a>
                ))}
              </div>
            </NavSection>
          </div>
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  )
}
