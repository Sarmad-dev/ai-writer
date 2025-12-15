"use client"

import { AIWritingLogo } from "./logo"
import { ProductDropdown } from "./product-dropdown"
import { ResourcesDropdown } from "./resources-dropdown"
import { HeaderActions } from "./header-actions"
import { MobileNav } from "./mobile-nav"
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu"

export function SiteHeader() {
  return (
    <header className="flex w-full items-center justify-center p-4">
      <div className="flex w-full max-w-5xl items-center justify-between rounded-full bg-card border border-border px-4 py-3 md:px-6 shadow-lg">
        <div className="flex items-center gap-4 md:gap-6">
          <MobileNav />
          <AIWritingLogo />
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList className="gap-0">
              <ProductDropdown />
              <ResourcesDropdown />
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="#"
                  className="rounded-md bg-transparent px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Pricing
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="hidden md:block">
          <HeaderActions />
        </div>
      </div>
    </header>
  )
}
