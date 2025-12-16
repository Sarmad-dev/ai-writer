"use client"

import { ContentCard } from "@/components/content/ContentCard"
import { ContentHeader } from "@/components/content/ContentHeader"
import { ContentListItem } from "@/components/content/ContentListItem"
import { useState } from "react"

interface ContentItem {
  id: string
  title: string
  preview: string
  updatedAt: Date
  wordCount: number
}

const mockContent: ContentItem[] = [
  {
    id: "1",
    title: "Blog Post: AI in 2025",
    preview:
      "In an era where content is king, artificial intelligence has emerged as the crown jewel of creative production...",
    updatedAt: new Date(),
    wordCount: 1250,
  },
  {
    id: "2",
    title: "Marketing Email Campaign",
    preview:
      "Introducing our latest product that will revolutionize the way you work. Discover the future of productivity...",
    updatedAt: new Date(Date.now() - 86400000),
    wordCount: 450,
  },
  {
    id: "3",
    title: "Product Description",
    preview:
      "Crafted with precision and designed for excellence. This premium solution offers unmatched performance...",
    updatedAt: new Date(Date.now() - 172800000),
    wordCount: 320,
  },
  {
    id: "4",
    title: "Social Media Content Pack",
    preview: "Engage your audience with these carefully crafted posts. Each piece is optimized for maximum impact...",
    updatedAt: new Date(Date.now() - 259200000),
    wordCount: 890,
  },
  {
    id: "5",
    title: "Landing Page Copy",
    preview: "Transform your business with our cutting-edge platform. Join thousands of satisfied customers...",
    updatedAt: new Date(Date.now() - 345600000),
    wordCount: 680,
  },
  {
    id: "6",
    title: "Newsletter: Weekly Digest",
    preview:
      "This week's top stories and insights from the world of technology. Stay informed and ahead of the curve...",
    updatedAt: new Date(Date.now() - 432000000),
    wordCount: 1100,
  },
  {
    id: "7",
    title: "Technical Documentation",
    preview:
      "Comprehensive guide to implementing our API. Learn how to integrate seamlessly with your existing systems...",
    updatedAt: new Date(Date.now() - 518400000),
    wordCount: 2400,
  },
  {
    id: "8",
    title: "Case Study: Enterprise Client",
    preview: "How Company X increased their productivity by 300% using our AI-powered content generation platform...",
    updatedAt: new Date(Date.now() - 604800000),
    wordCount: 1800,
  },
]

export default function ContentPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("Recent")

  const filteredContent = mockContent
    .filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.preview.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "Recent") {
        return b.updatedAt.getTime() - a.updatedAt.getTime()
      }
      if (sortBy === "Alphabetical") {
        return a.title.localeCompare(b.title)
      }
      if (sortBy === "Word Count") {
        return b.wordCount - a.wordCount
      }
      return 0
    })

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ContentHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />
      <main className="flex-1 p-6">
        {viewMode === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredContent.map((item) => (
              <ContentCard key={item.id} {...item} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredContent.map((item) => (
              <ContentListItem key={item.id} {...item} />
            ))}
          </div>
        )}
        {filteredContent.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-lg font-medium">No content found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search query</p>
          </div>
        )}
      </main>
    </div>
  )
}
