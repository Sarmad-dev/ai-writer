"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AIWritingLogo } from "./logo";
import {
  Menu,
  ArrowUpRight,
  FileText,
  MessageSquare,
  BarChart3,
  Sparkles,
  PenTool,
  Globe,
  Users,
  Star,
  Handshake,
  ListTodo,
  Briefcase,
  ScrollText,
  Shield,
} from "lucide-react";

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
];

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
    icon: MessageSquare,
    title: "Support",
    description: "Get help with your AI writing projects",
  },
];

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
  { icon: PenTool, title: "Blog", description: "Tips and insights about AI-powered writing" },
];

const legalItems = [
  { icon: ScrollText, title: "Terms of Service" },
  { icon: Shield, title: "Privacy Policy" },
];

function MobileNavItem({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
}) {
  return (
    <a
      href="#"
      className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-accent"
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/50">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground">{title}</span>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </div>
    </a>
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-foreground hover:bg-accent hover:text-accent-foreground lg:hidden"
        >
          <Menu className="size-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-full border-border bg-background p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-border px-6 py-4">
          <SheetTitle>
            <AIWritingLogo />
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col overflow-y-auto">
          <Accordion type="single" collapsible className="w-full">
            {/* Product Section */}
            <AccordionItem value="product" className="border-b border-border">
              <AccordionTrigger className="px-6 py-4 text-foreground hover:bg-accent hover:no-underline">
                Product
              </AccordionTrigger>
              <AccordionContent className="bg-muted/50 px-3 pb-4">
                <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Features
                </p>
                <div className="flex flex-col gap-1">
                  {features.map((item) => (
                    <MobileNavItem
                      key={item.title}
                      icon={item.icon}
                      title={item.title}
                      description={item.description}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Resources Section */}
            <AccordionItem
              value="resources"
              className="border-b border-border"
            >
              <AccordionTrigger className="px-6 py-4 text-foreground hover:bg-accent hover:no-underline">
                Resources
              </AccordionTrigger>
              <AccordionContent className="bg-muted/50 px-3 pb-4">
                <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Company
                </p>
                <div className="flex flex-col gap-1">
                  {companyItems.map((item) => (
                    <MobileNavItem
                      key={item.title}
                      icon={item.icon}
                      title={item.title}
                      description={item.description}
                    />
                  ))}
                </div>
                <p className="mt-4 px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Resources
                </p>
                <div className="flex flex-col gap-1">
                  {resourceItems.map((item) => (
                    <MobileNavItem
                      key={item.title}
                      icon={item.icon}
                      title={item.title}
                      description={item.description}
                    />
                  ))}
                </div>
                <p className="mt-4 px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Legal
                </p>
                <div className="flex flex-col gap-1">
                  {legalItems.map((item) => (
                    <MobileNavItem
                      key={item.title}
                      icon={item.icon}
                      title={item.title}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Pricing Link */}
          <a
            href="#"
            className="border-b border-border px-6 py-4 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Pricing
          </a>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 p-6">
            <Button
              variant="ghost"
              className="w-full justify-center bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              Login
            </Button>
            <Button
              variant="outline"
              className="w-full justify-center border-border bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
            >
              Get Access
              <ArrowUpRight className="ml-2 size-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
