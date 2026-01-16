"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEditor } from "@/hooks/useEditor";
import {
  AlignVerticalSpaceAround,
  ChevronDown,
  Columns2,
  Eye,
  FileText,
  Minus,
  Monitor,
  Palette,
  Plus,
  RulerIcon,
  Settings2,
  Type,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

const PAGE_SIZES = [
  { value: "a4", label: "A4", width: "210mm", height: "297mm" },
  { value: "a3", label: "A3", width: "297mm", height: "420mm" },
  { value: "a5", label: "A5", width: "148mm", height: "210mm" },
  { value: "letter", label: "Letter", width: "8.5in", height: "11in" },
  { value: "legal", label: "Legal", width: "8.5in", height: "14in" },
  { value: "tabloid", label: "Tabloid", width: "11in", height: "17in" },
  { value: "executive", label: "Executive", width: "7.25in", height: "10.5in" },
];

const MARGIN_PRESETS = [
  { value: "normal", label: "Normal", top: 1, bottom: 1, left: 1, right: 1 },
  {
    value: "narrow",
    label: "Narrow",
    top: 0.5,
    bottom: 0.5,
    left: 0.5,
    right: 0.5,
  },
  {
    value: "moderate",
    label: "Moderate",
    top: 1,
    bottom: 1,
    left: 0.75,
    right: 0.75,
  },
  { value: "wide", label: "Wide", top: 1, bottom: 1, left: 2, right: 2 },
  {
    value: "mirrored",
    label: "Mirrored",
    top: 1,
    bottom: 1,
    left: 1.25,
    right: 1,
  },
  { value: "custom", label: "Custom", top: 1, bottom: 1, left: 1, right: 1 },
];

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
  { value: "roboto", label: "Roboto" },
  { value: "open-sans", label: "Open Sans" },
];

const LINE_SPACINGS = [
  { value: 1, label: "Single" },
  { value: 1.15, label: "1.15" },
  { value: 1.5, label: "1.5" },
  { value: 2, label: "Double" },
  { value: 2.5, label: "2.5" },
  { value: 3, label: "Triple" },
];

const PAGE_COLORS = [
  { value: "white", label: "White", color: "bg-white" },
  { value: "cream", label: "Cream", color: "bg-amber-50" },
  { value: "light-gray", label: "Light Gray", color: "bg-gray-100" },
  { value: "light-blue", label: "Light Blue", color: "bg-blue-50" },
  { value: "light-green", label: "Light Green", color: "bg-green-50" },
  { value: "sepia", label: "Sepia", color: "bg-orange-50" },
  { value: "dark", label: "Dark", color: "bg-gray-900" },
];

const VIEW_MODES = [
  { value: "page", label: "Page View", icon: FileText },
  { value: "web", label: "Web View", icon: Monitor },
  { value: "outline", label: "Outline", icon: Eye },
  { value: "draft", label: "Draft", icon: FileText },
];

export function EnhancedDocumentControls() {
  const { settings, updateSettings, setZoom } = useEditor();

  const handleMarginPresetChange = (preset: string) => {
    const marginPreset = MARGIN_PRESETS.find((p) => p.value === preset);
    if (marginPreset) {
      updateSettings({
        marginPreset: preset,
        marginTop: marginPreset.top,
        marginBottom: marginPreset.bottom,
        marginLeft: marginPreset.left,
        marginRight: marginPreset.right,
      });
    }
  };

  const incrementFontSize = () => {
    updateSettings({ fontSize: Math.min(settings.fontSize + 1, 72) });
  };

  const decrementFontSize = () => {
    updateSettings({ fontSize: Math.max(settings.fontSize - 1, 8) });
  };

  const incrementZoom = () => {
    setZoom(settings.zoomLevel + 10);
  };

  const decrementZoom = () => {
    setZoom(settings.zoomLevel - 10);
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {/* View Mode Control */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 px-2 text-xs"
                >
                  {VIEW_MODES.find((m) => m.value === settings.viewMode)
                    ?.icon && (
                    <span className="size-4">
                      {(() => {
                        const Icon = VIEW_MODES.find(
                          (m) => m.value === settings.viewMode
                        )?.icon;
                        return Icon ? <Icon className="size-4" /> : null;
                      })()}
                    </span>
                  )}
                  <ChevronDown className="size-3" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>View mode</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>View Mode</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {VIEW_MODES.map((mode) => (
              <DropdownMenuItem
                key={mode.value}
                onClick={() => updateSettings({ viewMode: mode.value as any })}
              >
                <mode.icon className="mr-2 size-4" />
                {mode.label}
                {settings.viewMode === mode.value && (
                  <span className="ml-auto text-primary">✓</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Zoom Control */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={decrementZoom}
              >
                <ZoomOut className="size-3" />
                <span className="sr-only">Zoom out</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom out</TooltipContent>
          </Tooltip>
          <span className="min-w-12 text-center text-xs">
            {settings.zoomLevel}%
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={incrementZoom}
              >
                <ZoomIn className="size-3" />
                <span className="sr-only">Zoom in</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom in</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Page Size Control */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 px-2 text-xs"
                >
                  <FileText className="size-4" />
                  {PAGE_SIZES.find((s) => s.value === settings.pageSize)?.label}
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
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              Orientation
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => updateSettings({ orientation: "portrait" })}
            >
              <FileText className="mr-2 size-4" />
              Portrait
              {settings.orientation === "portrait" && (
                <span className="ml-auto text-primary">✓</span>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => updateSettings({ orientation: "landscape" })}
            >
              <FileText className="mr-2 size-4 rotate-90" />
              Landscape
              {settings.orientation === "landscape" && (
                <span className="ml-auto text-primary">✓</span>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Margins Control */}
        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 px-2 text-xs"
                >
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
                <Select
                  value={settings.marginPreset}
                  onValueChange={handleMarginPresetChange}
                >
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
                  <Label className="text-xs text-muted-foreground">
                    Top (in)
                  </Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Slider
                      value={[settings.marginTop]}
                      onValueChange={([value]) =>
                        updateSettings({
                          marginTop: value,
                          marginPreset: "custom",
                        })
                      }
                      min={0}
                      max={3}
                      step={0.25}
                      className="flex-1"
                    />
                    <span className="w-8 text-xs text-muted-foreground">
                      {settings.marginTop}
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Bottom (in)
                  </Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Slider
                      value={[settings.marginBottom]}
                      onValueChange={([value]) =>
                        updateSettings({
                          marginBottom: value,
                          marginPreset: "custom",
                        })
                      }
                      min={0}
                      max={3}
                      step={0.25}
                      className="flex-1"
                    />
                    <span className="w-8 text-xs text-muted-foreground">
                      {settings.marginBottom}
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Left (in)
                  </Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Slider
                      value={[settings.marginLeft]}
                      onValueChange={([value]) =>
                        updateSettings({
                          marginLeft: value,
                          marginPreset: "custom",
                        })
                      }
                      min={0}
                      max={3}
                      step={0.25}
                      className="flex-1"
                    />
                    <span className="w-8 text-xs text-muted-foreground">
                      {settings.marginLeft}
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Right (in)
                  </Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Slider
                      value={[settings.marginRight]}
                      onValueChange={([value]) =>
                        updateSettings({
                          marginRight: value,
                          marginPreset: "custom",
                        })
                      }
                      min={0}
                      max={3}
                      step={0.25}
                      className="flex-1"
                    />
                    <span className="w-8 text-xs text-muted-foreground">
                      {settings.marginRight}
                    </span>
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 px-2 text-xs"
                >
                  <Type className="size-4" />
                  {
                    FONT_FAMILIES.find((f) => f.value === settings.fontFamily)
                      ?.label
                  }
                  <ChevronDown className="size-3" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Font family</TooltipContent>
          </Tooltip>
          <DropdownMenuContent
            align="start"
            className="max-h-64 overflow-y-auto"
          >
            <DropdownMenuLabel>Font Family</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {FONT_FAMILIES.map((font) => (
              <DropdownMenuItem
                key={font.value}
                onClick={() => updateSettings({ fontFamily: font.value })}
                style={{ fontFamily: font.label }}
              >
                {font.label}
                {settings.fontFamily === font.value && (
                  <span className="ml-auto text-primary">✓</span>
                )}
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
          <span className="w-8 text-center text-xs">{settings.fontSize}</span>
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 px-2 text-xs"
                >
                  <AlignVerticalSpaceAround className="size-4" />
                  {LINE_SPACINGS.find((s) => s.value === settings.lineSpacing)
                    ?.label || settings.lineSpacing}
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
              <DropdownMenuItem
                key={spacing.value}
                onClick={() => updateSettings({ lineSpacing: spacing.value })}
              >
                {spacing.label}
                {settings.lineSpacing === spacing.value && (
                  <span className="ml-auto text-primary">✓</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Columns Control */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 px-2 text-xs"
                >
                  <Columns2 className="size-4" />
                  {settings.columns === 1
                    ? "1 Col"
                    : `${settings.columns} Cols`}
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
              <DropdownMenuItem
                key={col}
                onClick={() => updateSettings({ columns: col })}
              >
                {col === 1 ? "One" : col === 2 ? "Two" : "Three"} Column
                {col > 1 ? "s" : ""}
                {settings.columns === col && (
                  <span className="ml-auto text-primary">✓</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Advanced Settings */}
        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <Settings2 className="size-4" />
                  <span className="sr-only">Advanced settings</span>
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>Advanced settings</TooltipContent>
          </Tooltip>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <h4 className="font-medium">Advanced Settings</h4>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Show Page Numbers</Label>
                  <Switch
                    checked={settings.showPageNumbers}
                    onCheckedChange={(checked) =>
                      updateSettings({ showPageNumbers: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs">Show Header</Label>
                  <Switch
                    checked={settings.showHeader}
                    onCheckedChange={(checked) =>
                      updateSettings({ showHeader: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs">Show Footer</Label>
                  <Switch
                    checked={settings.showFooter}
                    onCheckedChange={(checked) =>
                      updateSettings({ showFooter: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs">Spell Check</Label>
                  <Switch
                    checked={settings.spellCheck}
                    onCheckedChange={(checked) =>
                      updateSettings({ spellCheck: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs">Auto Correct</Label>
                  <Switch
                    checked={settings.autoCorrect}
                    onCheckedChange={(checked) =>
                      updateSettings({ autoCorrect: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs">Track Changes</Label>
                  <Switch
                    checked={settings.trackChanges}
                    onCheckedChange={(checked) =>
                      updateSettings({ trackChanges: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs">Show Comments</Label>
                  <Switch
                    checked={settings.showComments}
                    onCheckedChange={(checked) =>
                      updateSettings({ showComments: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs">Print Background</Label>
                  <Switch
                    checked={settings.printBackground}
                    onCheckedChange={(checked) =>
                      updateSettings({ printBackground: checked })
                    }
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </TooltipProvider>
  );
}
