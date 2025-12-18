"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Logo } from "@/components/logo"
import { ChevronDown, Grid3X3, LayoutList, Search } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "../ui/theme-toggle"
import { NewSessionDialog } from "./NewSessionDialog"

interface ContentHeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  viewMode: "grid" | "list"
  onViewModeChange: (mode: "grid" | "list") => void
  sortBy: string
  onSortChange: (sort: string) => void
}

export function ContentHeader({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
}: ContentHeaderProps) {
  return (
    <header className="border-b border-border bg-background">
      <div className="flex h-14 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <NewSessionDialog />
        </div>
      </div>
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-2xl font-semibold">My Content</h1>
          <p className="text-sm text-muted-foreground">Manage and organize all your AI-generated content</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 w-64 bg-secondary pl-9"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                Sort: {sortBy}
                <ChevronDown className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onSortChange("Recent")}>Recent</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange("Alphabetical")}>Alphabetical</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange("Word Count")}>Word Count</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex rounded-lg border border-border p-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="size-7"
              onClick={() => onViewModeChange("grid")}
            >
              <Grid3X3 className="size-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="size-7"
              onClick={() => onViewModeChange("list")}
            >
              <LayoutList className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
