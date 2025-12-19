"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useEditor } from "@/hooks/useEditor"
import { BarChart3, Clock, FileText, Type } from "lucide-react"

export function DocumentStatistics() {
  const { wordCount, characterCount, paragraphCount, readingTime } = useEditor()

  const stats = [
    {
      label: "Words",
      value: wordCount.toLocaleString(),
      icon: Type,
      color: "text-blue-600",
    },
    {
      label: "Characters",
      value: characterCount.toLocaleString(),
      icon: FileText,
      color: "text-green-600",
    },
    {
      label: "Paragraphs",
      value: paragraphCount.toLocaleString(),
      icon: BarChart3,
      color: "text-purple-600",
    },
    {
      label: "Reading Time",
      value: `${readingTime} min`,
      icon: Clock,
      color: "text-orange-600",
    },
  ]

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Document Statistics</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div key={stat.label}>
              <div className="flex items-center gap-2">
                <stat.icon className={`size-4 ${stat.color}`} />
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                  <div className="text-sm font-medium">{stat.value}</div>
                </div>
              </div>
              {index < stats.length - 1 && index % 2 === 1 && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function CompactDocumentStatistics() {
  const { wordCount, characterCount, readingTime } = useEditor()

  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      <span className="flex items-center gap-1">
        <Type className="size-3" />
        {wordCount.toLocaleString()} words
      </span>
      <span className="flex items-center gap-1">
        <FileText className="size-3" />
        {characterCount.toLocaleString()} chars
      </span>
      <span className="flex items-center gap-1">
        <Clock className="size-3" />
        {readingTime} min read
      </span>
    </div>
  )
}