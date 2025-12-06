'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ChartRenderer, ChartType, ChartDataPoint, ChartConfig } from './ChartRenderer';
import { DataTable } from './DataTable';
import { Save, X } from 'lucide-react';

export interface GraphEditorProps {
  graphId?: string;
  initialType?: ChartType;
  initialData?: ChartDataPoint[];
  initialConfig?: ChartConfig;
  onSave: (type: ChartType, data: ChartDataPoint[], config: ChartConfig) => void;
  onCancel: () => void;
}

const CHART_TYPES: { value: ChartType; label: string }[] = [
  { value: 'bar', label: 'Bar Chart' },
  { value: 'line', label: 'Line Chart' },
  { value: 'pie', label: 'Pie Chart' },
  { value: 'area', label: 'Area Chart' },
  { value: 'scatter', label: 'Scatter Chart' },
];

const DEFAULT_COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7c7c',
  '#8dd1e1',
  '#d084d0',
  '#ffb347',
];

export function GraphEditor({
  graphId,
  initialType = 'bar',
  initialData = [
    { name: 'A', value: 10 },
    { name: 'B', value: 20 },
    { name: 'C', value: 15 },
  ],
  initialConfig = {},
  onSave,
  onCancel,
}: GraphEditorProps) {
  const [chartType, setChartType] = useState<ChartType>(initialType);
  const [data, setData] = useState<ChartDataPoint[]>(initialData);
  const [config, setConfig] = useState<ChartConfig>({
    title: '',
    xAxisLabel: '',
    yAxisLabel: '',
    colors: DEFAULT_COLORS,
    legend: true,
    dataKey: 'value',
    xKey: 'name',
    yKey: 'value',
    ...initialConfig,
  });

  const handleConfigChange = (key: keyof ChartConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(chartType, data, config);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      {/* Left Panel - Configuration */}
      <div className="space-y-6">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Chart Configuration</h3>
          
          {/* Chart Type Selector */}
          <div className="space-y-2 mb-4">
            <Label>Chart Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {CHART_TYPES.map((type) => (
                <Button
                  key={type.value}
                  variant={chartType === type.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType(type.value)}
                  className="justify-start"
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Chart Settings */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Chart Title</Label>
              <Input
                id="title"
                value={config.title || ''}
                onChange={(e) => handleConfigChange('title', e.target.value)}
                placeholder="Enter chart title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="xAxisLabel">X-Axis Label</Label>
              <Input
                id="xAxisLabel"
                value={config.xAxisLabel || ''}
                onChange={(e) => handleConfigChange('xAxisLabel', e.target.value)}
                placeholder="Enter X-axis label"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="yAxisLabel">Y-Axis Label</Label>
              <Input
                id="yAxisLabel"
                value={config.yAxisLabel || ''}
                onChange={(e) => handleConfigChange('yAxisLabel', e.target.value)}
                placeholder="Enter Y-axis label"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataKey">Data Key</Label>
              <Input
                id="dataKey"
                value={config.dataKey || 'value'}
                onChange={(e) => handleConfigChange('dataKey', e.target.value)}
                placeholder="value"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="xKey">X Key</Label>
              <Input
                id="xKey"
                value={config.xKey || 'name'}
                onChange={(e) => handleConfigChange('xKey', e.target.value)}
                placeholder="name"
              />
            </div>

            {chartType === 'scatter' && (
              <div className="space-y-2">
                <Label htmlFor="yKey">Y Key</Label>
                <Input
                  id="yKey"
                  value={config.yKey || 'value'}
                  onChange={(e) => handleConfigChange('yKey', e.target.value)}
                  placeholder="value"
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="legend"
                checked={config.legend ?? true}
                onChange={(e) => handleConfigChange('legend', e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="legend" className="cursor-pointer">Show Legend</Label>
            </div>
          </div>
        </Card>

        {/* Data Table */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Chart Data</h3>
          <DataTable data={data} onChange={setData} />
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save Graph
          </Button>
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className="space-y-4">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Preview</h3>
          <ChartRenderer type={chartType} data={data} config={config} />
        </Card>
      </div>
    </div>
  );
}
