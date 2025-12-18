"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  AlignVerticalSpaceAround,
  ChevronDown,
  Columns2,
  FileText,
  Minus,
  Palette,
  Plus,
  RulerIcon,
  Settings2,
  Type,
} from "lucide-react"
import { useState } from "react"

interface DocumentSettings {
  pageSize: string
  orientation: "portrait" | "landscape"
  marginPreset: string
  marginTop: number
  marginBottom: number
  marginLeft: number
  marginRight: number
  fontFamily: string
  fontSize: number
  lineSpacing: number
  columns: number
  pageColor: string
}

const PAGE_SIZES = [
  { value: "a4", label: "A4", width: "210mm", height: "297mm" },
  { value: "a3", label: "A3", width: "297mm", height: "420mm" },
  { value: "letter", label: "Letter", width: "8.5in", height: "11in" },
  { value: "legal", label: "Legal", width: "8.5in", height: "14in" },
  { value: "tabloid", label: "Tabloid", width: "11in", height: "17in" },
  { value: "executive", label: "Executive", width: "7.25in", height: "10.5in" },
]

const MARGIN_PRESETS = [
  { value: "normal", label: "Normal", top: 1, bottom: 1, left: 1, right: 1 },
  { value: "narrow", label: "Narrow", top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 },
  { value: "moderate", label: "Moderate", top: 1, bottom: 1, left: 0.75, right: 0.75 },
  { value: "wide", label: "Wide", top: 1, bottom: 1, left: 2, right: 2 },
  { value: "mirrored", label: "Mirrored", top: 1, bottom: 1, left: 1.25, right: 1 },
  { value: "custom", label: "Custom", top: 1, bottom: 1, left: 1, right: 1 },
]

const FONT_FAMILIES = [
  { value: "inter", label: "Inter" },
  { value: "arial", label: "Arial" },
  { value: "times", label: "Times New Roman" },
  { value: "georgia", label: "Georgia" },
  { value: "helvetica", label: "Helvetica" },
  { value: "calibri", label: "Calibri" },
  { value: "cambria", label: "Cambria" },
  { value: "garamond", label: "Garamond" },
  { value: "verdana", label: "Verdana" },
  { value: "courier", label: "Courier New" },
]

const LINE_SPACINGS = [
  { value: 1, label: "Single" },
  { value: 1.15, label: "1.15" },
  { value: 1.5, label: "1.5" },
  { value: 2, label: "Double" },
  { value: 2.5, label: "2.5" },
  { value: 3, label: "Triple" },
]

const PAGE_COLORS = [
  { value: "white", label: "White", color: "bg-white" },
  { value: "cream", label: "Cream", color: "bg-amber-50" },
  { value: "light-gray", label: "Light Gray", color: "bg-gray-100" },
  { value: "light-blue", label: "Light Blue", color: "bg-blue-50" },
  { value: "light-green", label: "Light Green", color: "bg-green-50" },
  { value: "sepia", label: "Sepia", color: "bg-orange-50" },
]

interface DocumentControlsProps {
  settings?: Partial<DocumentSettings>
  onSettingsChange?: (settings: DocumentSettings) => void
}

export function DocumentControls({ settings, onSettingsChange }: DocumentControlsProps) {
  const [documentSettings, setDocumentSettings] = useState<DocumentSettings>({
    pageSize: "a4",
    orientation: "portrait",
    marginPreset: "normal",
    marginTop: 1,
    marginBottom: 1,
    marginLeft: 1,
    marginRight: 1,
    fontFamily: "inter",
    fontSize: 12,
    lineSpacing: 1.15,
    columns: 1,
    pageColor: "white",
    ...settings,
  })

  const updateSettings = (updates: Partial<DocumentSettings>) => {
    const newSettings = { ...documentSettings, ...updates }
    setDocumentSettings(newSettings)
    onSettingsChange?.(newSettings)
  }

  const handleMarginPresetChange = (preset: string) => {
    const marginPreset = MARGIN_PRESETS.find((p) => p.value === preset)
    if (marginPreset) {
      updateSettings({
        marginPreset: preset,
        marginTop: marginPreset.top,
        marginBottom: marginPreset.bottom,
        marginLeft: marginPreset.left,
        marginRight: marginPreset.right,
      })
    }
  }

  const incrementFontSize = () => {
    updateSettings({ fontSize: Math.min(documentSettings.fontSize + 1, 72) })
  }

  const decrementFontSize = () => {
    updateSettings({ fontSize: Math.max(documentSettings.fontSize - 1, 8) })
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {/* Page Size Control */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2 text-xs">
                  <FileText className="size-4" />
                  {PAGE_SIZES.find((s) => s.value === documentSettings.pageSize)?.label}
                  <ChevronDown className="size-3" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Page size</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Page Size</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {PAGE_SIZES.map((size) => (
              <DropdownMenuItem
                key={size.value}
                onClick={() => updateSettings({ pageSize: size.value })}
                className="flex justify-between"
              >
                <span>{size.label}</span>
                <span className="text-xs text-muted-foreground">
                  {size.width} × {size.height}
                </span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Orientation</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => updateSettings({ orientation: "portrait" })}>
              <FileText className="mr-2 size-4" />
              Portrait
              {documentSettings.orientation === "portrait" && <span className="ml-auto text-primary">✓</span>}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateSettings({ orientation: "landscape" })}>
              <FileText className="mr-2 size-4 rotate-90" />
              Landscape
              {documentSettings.orientation === "landscape" && <span className="ml-auto text-primary">✓</span>}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Margins Control */}
        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2 text-xs">
                  <RulerIcon className="size-4" />
                  Margins
                  <ChevronDown className="size-3" />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>Page margins</TooltipContent>
          </Tooltip>
          <PopoverContent className="w-72" align="start">
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-medium">Preset</Label>
                <Select value={documentSettings.marginPreset} onValueChange={handleMarginPresetChange}>
                  <SelectTrigger className="mt-1.5 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MARGIN_PRESETS.map((preset) => (
                      <SelectItem key={preset.value} value={preset.value}>
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Top (in)</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Slider
                      value={[documentSettings.marginTop]}
                      onValueChange={([value]) => updateSettings({ marginTop: value, marginPreset: "custom" })}
                      min={0}
                      max={3}
                      step={0.25}
                      className="flex-1"
                    />
                    <span className="w-8 text-xs text-muted-foreground">{documentSettings.marginTop}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Bottom (in)</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Slider
                      value={[documentSettings.marginBottom]}
                      onValueChange={([value]) => updateSettings({ marginBottom: value, marginPreset: "custom" })}
                      min={0}
                      max={3}
                      step={0.25}
                      className="flex-1"
                    />
                    <span className="w-8 text-xs text-muted-foreground">{documentSettings.marginBottom}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Left (in)</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Slider
                      value={[documentSettings.marginLeft]}
                      onValueChange={([value]) => updateSettings({ marginLeft: value, marginPreset: "custom" })}
                      min={0}
                      max={3}
                      step={0.25}
                      className="flex-1"
                    />
                    <span className="w-8 text-xs text-muted-foreground">{documentSettings.marginLeft}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Right (in)</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Slider
                      value={[documentSettings.marginRight]}
                      onValueChange={([value]) => updateSettings({ marginRight: value, marginPreset: "custom" })}
                      min={0}
                      max={3}
                      step={0.25}
                      className="flex-1"
                    />
                    <span className="w-8 text-xs text-muted-foreground">{documentSettings.marginRight}</span>
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Font Family Control */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2 text-xs">
                  <Type className="size-4" />
                  {FONT_FAMILIES.find((f) => f.value === documentSettings.fontFamily)?.label}
                  <ChevronDown className="size-3" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Font family</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="start" className="max-h-64 overflow-y-auto">
            <DropdownMenuLabel>Font Family</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {FONT_FAMILIES.map((font) => (
              <DropdownMenuItem
                key={font.value}
                onClick={() => updateSettings({ fontFamily: font.value })}
                style={{ fontFamily: font.label }}
              >
                {font.label}
                {documentSettings.fontFamily === font.value && <span className="ml-auto text-primary">✓</span>}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Font Size Control */}
        <div className="flex items-center rounded-md border border-border">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 rounded-none rounded-l-md"
                onClick={decrementFontSize}
              >
                <Minus className="size-3" />
                <span className="sr-only">Decrease font size</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Decrease font size</TooltipContent>
          </Tooltip>
          <span className="w-8 text-center text-xs">{documentSettings.fontSize}</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 rounded-none rounded-r-md"
                onClick={incrementFontSize}
              >
                <Plus className="size-3" />
                <span className="sr-only">Increase font size</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Increase font size</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Line Spacing Control */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2 text-xs">
                  <AlignVerticalSpaceAround className="size-4" />
                  {LINE_SPACINGS.find((s) => s.value === documentSettings.lineSpacing)?.label ||
                    documentSettings.lineSpacing}
                  <ChevronDown className="size-3" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Line spacing</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Line Spacing</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {LINE_SPACINGS.map((spacing) => (
              <DropdownMenuItem key={spacing.value} onClick={() => updateSettings({ lineSpacing: spacing.value })}>
                {spacing.label}
                {documentSettings.lineSpacing === spacing.value && <span className="ml-auto text-primary">✓</span>}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Columns Control */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2 text-xs">
                  <Columns2 className="size-4" />
                  {documentSettings.columns === 1 ? "1 Col" : `${documentSettings.columns} Cols`}
                  <ChevronDown className="size-3" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Columns</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {[1, 2, 3].map((col) => (
              <DropdownMenuItem key={col} onClick={() => updateSettings({ columns: col })}>
                {col === 1 ? "One" : col === 2 ? "Two" : "Three"} Column{col > 1 ? "s" : ""}
                {documentSettings.columns === col && <span className="ml-auto text-primary">✓</span>}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Page Color Control */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2 text-xs">
                  <Palette className="size-4" />
                  <ChevronDown className="size-3" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Page color</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Page Color</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {PAGE_COLORS.map((color) => (
              <DropdownMenuItem key={color.value} onClick={() => updateSettings({ pageColor: color.value })}>
                <div className={`mr-2 size-4 rounded border border-border ${color.color}`} />
                {color.label}
                {documentSettings.pageColor === color.value && <span className="ml-auto text-primary">✓</span>}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* More Page Settings */}
        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <Settings2 className="size-4" />
                  <span className="sr-only">More page settings</span>
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>More page settings</TooltipContent>
          </Tooltip>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <h4 className="font-medium">Page Setup</h4>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Page Size</Label>
                  <Select
                    value={documentSettings.pageSize}
                    onValueChange={(value) => updateSettings({ pageSize: value })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZES.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label} ({size.width} × {size.height})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Orientation</Label>
                  <Select
                    value={documentSettings.orientation}
                    onValueChange={(value: "portrait" | "landscape") => updateSettings({ orientation: value })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Portrait</SelectItem>
                      <SelectItem value="landscape">Landscape</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Default Font</Label>
                  <Select
                    value={documentSettings.fontFamily}
                    onValueChange={(value) => updateSettings({ fontFamily: value })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_FAMILIES.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Default Font Size</Label>
                  <Select
                    value={String(documentSettings.fontSize)}
                    onValueChange={(value) => updateSettings({ fontSize: Number.parseInt(value) })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72].map((size) => (
                        <SelectItem key={size} value={String(size)}>
                          {size} pt
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </TooltipProvider>
  )
}
