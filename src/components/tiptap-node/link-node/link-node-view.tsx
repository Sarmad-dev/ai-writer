"use client"

import { useCallback, useEffect, useState } from "react"
import type { NodeViewProps } from "@tiptap/react"
import { NodeViewWrapper } from "@tiptap/react"
import { getLinkPreview } from "link-preview-js"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ExternalLink, Globe } from "lucide-react"

interface LinkPreview {
  title?: string
  description?: string
  images?: string[]
  siteName?: string
  url: string
  favicons?: string[]
}

export function LinkNodeView(props: NodeViewProps) {
  const { node } = props
  const href = node.attrs.href
  const [preview, setPreview] = useState<LinkPreview | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPreview = useCallback(async () => {
    if (!href || preview || isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const previewData = await getLinkPreview(href, {
        imagesPropertyType: "og", // Use Open Graph images
        headers: {
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
      })

      // Type guard to check if previewData has the expected properties
      const hasMetadata = 'title' in previewData || 'description' in previewData

      setPreview({
        title: hasMetadata && 'title' in previewData ? previewData.title || '' : '',
        description: hasMetadata && 'description' in previewData ? previewData.description || '' : '',
        images: hasMetadata && 'images' in previewData ? previewData.images || [] : [],
        siteName: hasMetadata && 'siteName' in previewData ? previewData.siteName || '' : '',
        url: previewData.url || href,
        favicons: previewData.favicons || []
      })
    } catch (err) {
      console.error('Failed to fetch link preview:', err)
      setError('Failed to load preview')
    } finally {
      setIsLoading(false)
    }
  }, [href, preview, isLoading])

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    if (href) {
      window.open(href, '_blank', 'noopener,noreferrer')
    }
  }, [href])

  const handleMouseEnter = useCallback(() => {
    if (!preview && !isLoading && !error) {
      fetchPreview()
    }
  }, [preview, isLoading, error, fetchPreview])

  const renderPreviewContent = () => {
    if (isLoading) {
      return (
        <Card className="w-80">
          <CardContent className="p-4">
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    if (error) {
      return (
        <Card className="w-80">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span className="text-sm">Preview unavailable</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{href}</p>
          </CardContent>
        </Card>
      )
    }

    if (!preview) return null

    const favicon = preview.favicons?.[0]
    const image = preview.images?.[0]
    const displayUrl = new URL(href).hostname

    return (
      <Card className="w-80">
        <CardContent className="p-0">
          {image && (
            <div className="aspect-video w-full overflow-hidden rounded-t-lg">
              <img
                src={image}
                alt={preview.title || 'Link preview'}
                className="h-full w-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            </div>
          )}
          <div className="p-4">
            <div className="space-y-2">
              {preview.title && (
                <h4 className="font-semibold text-sm line-clamp-2 leading-tight">
                  {preview.title}
                </h4>
              )}
              {preview.description && (
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {preview.description}
                </p>
              )}
              <div className="flex items-center space-x-2 pt-2">
                {favicon ? (
                  <img
                    src={favicon}
                    alt=""
                    className="h-4 w-4 rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                ) : (
                  <Globe className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-xs text-muted-foreground truncate">
                  {preview.siteName || displayUrl}
                </span>
                <ExternalLink className="h-3 w-3 text-muted-foreground ml-auto" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <NodeViewWrapper as="span" className="tiptap-link-wrapper">
      <HoverCard openDelay={300} closeDelay={100}>
        <HoverCardTrigger asChild>
          <a
            href={href}
            className="tiptap-link cursor-pointer text-blue-600 hover:text-blue-800 underline decoration-blue-600/30 hover:decoration-blue-800/50 transition-colors"
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            target="_blank"
            rel="noopener noreferrer"
          >
            {props.node.textContent}
          </a>
        </HoverCardTrigger>
        <HoverCardContent side="top" className="p-0">
          {renderPreviewContent()}
        </HoverCardContent>
      </HoverCard>
    </NodeViewWrapper>
  )
}