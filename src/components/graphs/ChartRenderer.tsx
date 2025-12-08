'use client';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'scatter';

export interface ChartDataPoint {
  [key: string]: string | number;
}

export interface ChartConfig {
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  colors?: string[];
  legend?: boolean;
  dataKey?: string;
  xKey?: string;
  yKey?: string;
}

export interface ChartRendererProps {
  type: ChartType;
  data: ChartDataPoint[];
  config?: ChartConfig;
}

const DEFAULT_COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7c7c',
  '#8dd1e1',
  '#d084d0',
  '#ffb347',
];

export function ChartRenderer({ type, data, config = {} }: ChartRendererProps) {
  const {
    title,
    xAxisLabel,
    yAxisLabel,
    colors = DEFAULT_COLORS,
    legend = true,
    dataKey = 'value',
    xKey = 'name',
    yKey = 'value',
  } = config;

  // Support both xLabel/yLabel and xAxisLabel/yAxisLabel
  const xLabel = (config as any).xLabel || xAxisLabel;
  const yLabel = (config as any).yLabel || yAxisLabel;

  // Auto-detect the correct key from data if not specified
  const detectedXKey = data.length > 0 && 'label' in data[0] ? 'label' : xKey;
  const detectedDataKey = data.length > 0 && 'value' in data[0] ? 'value' : dataKey;

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted/30 rounded">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={detectedXKey} label={xLabel ? { value: xLabel, position: 'insideBottom', offset: -5 } : undefined} />
              <YAxis label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft' } : undefined} />
              <Tooltip />
              {legend && <Legend />}
              <Bar dataKey={detectedDataKey} fill={colors[0]}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={detectedXKey} label={xLabel ? { value: xLabel, position: 'insideBottom', offset: -5 } : undefined} />
              <YAxis label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft' } : undefined} />
              <Tooltip />
              {legend && <Legend />}
              <Line type="monotone" dataKey={detectedDataKey} stroke={colors[0]} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey={detectedDataKey}
                nameKey={detectedXKey}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              {legend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={detectedXKey} label={xLabel ? { value: xLabel, position: 'insideBottom', offset: -5 } : undefined} />
              <YAxis label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft' } : undefined} />
              <Tooltip />
              {legend && <Legend />}
              <Area type="monotone" dataKey={detectedDataKey} stroke={colors[0]} fill={colors[0]} fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={detectedXKey} label={xLabel ? { value: xLabel, position: 'insideBottom', offset: -5 } : undefined} />
              <YAxis dataKey={yKey} label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft' } : undefined} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              {legend && <Legend />}
              <Scatter name={detectedDataKey} data={data} fill={colors[0]} />
            </ScatterChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64 bg-muted/30 rounded">
            <p className="text-sm text-muted-foreground">Unsupported chart type: {type}</p>
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
      )}
      <div className="h-64">
        {renderChart()}
      </div>
    </div>
  );
}
