"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { getLinkPreview } from "link-preview-js"
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

interface LinkHoverHandlerProps {
  editorElement: HTMLElement | null
}

export function LinkHoverHandler({ editorElement }: LinkHoverHandlerProps) {
  const [hoveredLink, setHoveredLink] = useState<{
    element: HTMLElement
    href: string
    rect: DOMRect
  } | null>(null)
  const [preview, setPreview] = useState<LinkPreview | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const previewCache = useRef<Map<string, LinkPreview>>(new Map())

  const fetchPreview = async (href: string) => {
    // Check cache first
    if (previewCache.current.has(href)) {
      setPreview(previewCache.current.get(href)!)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const previewData = await getLinkPreview(href, {
        imagesPropertyType: "og",
        headers: {
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
      })

      const hasMetadata = 'title' in previewData || 'description' in previewData

      const previewResult: LinkPreview = {
        title: hasMetadata && 'title' in previewData ? previewData.title || '' : '',
        description: hasMetadata && 'description' in previewData ? previewData.description || '' : '',
        images: hasMetadata && 'images' in previewData ? previewData.images || [] : [],
        siteName: hasMetadata && 'siteName' in previewData ? previewData.siteName || '' : '',
        url: previewData.url || href,
        favicons: previewData.favicons || []
      }

      // Cache the result
      previewCache.current.set(href, previewResult)
      setPreview(previewResult)
    } catch (err) {
      console.error('Failed to fetch link preview:', err)
      setError('Failed to load preview')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!editorElement) return

    const handleMouseEnter = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (target.tagName === 'A' && target.classList.contains('tiptap-link')) {
        const href = target.getAttribute('href')
        if (href) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = setTimeout(() => {
            const rect = target.getBoundingClientRect()
            setHoveredLink({ element: target, href, rect })
            fetchPreview(href)
          }, 300)
        }
      }
    }

    const handleMouseLeave = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (target.tagName === 'A' && target.classList.contains('tiptap-link')) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
          setHoveredLink(null)
          setPreview(null)
          setIsLoading(false)
          setError(null)
        }, 100)
      }
    }

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (target.tagName === 'A' && target.classList.contains('tiptap-link')) {
        const href = target.getAttribute('href')
        if (href) {
          event.preventDefault()
          window.open(href, '_blank', 'noopener,noreferrer')
        }
      }
    }

    editorElement.addEventListener('mouseenter', handleMouseEnter, true)
    editorElement.addEventListener('mouseleave', handleMouseLeave, true)
    editorElement.addEventListener('click', handleClick, true)

    return () => {
      editorElement.removeEventListener('mouseenter', handleMouseEnter, true)
      editorElement.removeEventListener('mouseleave', handleMouseLeave, true)
      editorElement.removeEventListener('click', handleClick, true)
      clearTimeout(timeoutRef.current)
    }
  }, [editorElement])

  const renderPreviewContent = () => {
    if (isLoading) {
      return (
        <Card className="w-80 shadow-lg border">
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

    if (error || !preview) {
      return (
        <Card className="w-80 shadow-lg border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span className="text-sm">Preview unavailable</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate">{hoveredLink?.href}</p>
          </CardContent>
        </Card>
      )
    }

    const favicon = preview.favicons?.[0]
    const image = preview.images?.[0]
    const displayUrl = hoveredLink?.href ? new URL(hoveredLink.href).hostname : ''

    return (
      <Card className="w-80 shadow-lg border">
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

  if (!hoveredLink) return null

  const { rect } = hoveredLink
  const style: React.CSSProperties = {
    position: 'fixed',
    top: rect.top - 10, // Position above the link
    left: rect.left + rect.width / 2, // Center horizontally
    transform: 'translateX(-50%) translateY(-100%)',
    zIndex: 1000,
    pointerEvents: 'none',
  }

  // Adjust position if it would go off screen
  if (rect.top < 200) {
    style.top = rect.bottom + 10
    style.transform = 'translateX(-50%)'
  }

  return createPortal(
    <div style={style}>
      {renderPreviewContent()}
    </div>,
    document.body
  )
}