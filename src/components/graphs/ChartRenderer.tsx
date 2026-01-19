'use client';

import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

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

  const xLabel = (config as ChartConfig & { xLabel?: string }).xLabel ?? xAxisLabel;
  const yLabel = (config as ChartConfig & { yLabel?: string }).yLabel ?? yAxisLabel;

  // Auto-detect the correct key from data if not specified
  const detectedXKey = data.length > 0 && 'label' in data[0] ? 'label' : xKey;
  const detectedDataKey = data.length > 0 && 'value' in data[0] ? 'value' : dataKey;

  const toStr = (v: unknown) => String(v ?? '');
  const toNum = (v: unknown) => {
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  };

  const option = useMemo(() => {
    if (!data || data.length === 0) return null;
    const base: EChartsOption = {
      title: title
        ? {
            text: title,
            left: 'center',
            textStyle: { fontSize: 16, fontWeight: 'bold' },
          }
        : undefined,
      color: colors,
      tooltip: { trigger: type === 'pie' ? 'item' : 'axis' },
      legend: { show: legend },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    };

    if (type === 'bar') {
      const categories = data.map((d) => toStr(d[detectedXKey]));
      const seriesData = data.map((d, i) => ({
        value: toNum(d[detectedDataKey]),
        itemStyle: { color: colors[i % colors.length] },
      }));
      return {
        ...base,
        xAxis: { type: 'category', name: xLabel || '', nameLocation: 'middle', nameGap: 30, data: categories },
        yAxis: { type: 'value', name: yLabel || '', nameLocation: 'middle', nameGap: 50 },
        series: [{ name: detectedDataKey, type: 'bar', data: seriesData }],
      };
    }

    if (type === 'line') {
      const categories = data.map((d) => toStr(d[detectedXKey]));
      const seriesData = data.map((d) => toNum(d[detectedDataKey]));
      return {
        ...base,
        xAxis: { type: 'category', name: xLabel || '', data: categories },
        yAxis: { type: 'value', name: yLabel || '' },
        series: [{ name: detectedDataKey, type: 'line', data: seriesData }],
      };
    }

    if (type === 'area') {
      const categories = data.map((d) => toStr(d[detectedXKey]));
      const seriesData = data.map((d) => toNum(d[detectedDataKey]));
      return {
        ...base,
        xAxis: { type: 'category', name: xLabel || '', data: categories },
        yAxis: { type: 'value', name: yLabel || '' },
        series: [{ name: detectedDataKey, type: 'line', areaStyle: {}, data: seriesData }],
      };
    }

    if (type === 'pie') {
      const seriesData = data.map((d, i) => ({
        name: toStr(d[detectedXKey]),
        value: toNum(d[detectedDataKey]),
        itemStyle: { color: colors[i % colors.length] },
      }));
      return {
        ...base,
        series: [{ type: 'pie', radius: '50%', data: seriesData }],
      };
    }

    if (type === 'scatter') {
      const seriesData = data.map((d) => [toNum(d[detectedXKey]), toNum(d[yKey])]);
      return {
        ...base,
        xAxis: { type: 'value', name: xLabel || '' },
        yAxis: { type: 'value', name: yLabel || '' },
        series: [{ name: detectedDataKey, type: 'scatter', data: seriesData }],
      };
    }

    return null;
  }, [type, data, detectedXKey, detectedDataKey, xLabel, yLabel, colors, legend, yKey, title]);

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
      )}
      <div className="h-64">
        {option ? (
          <ReactECharts option={option} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'canvas' }} theme="light" />
        ) : (
          <div className="flex items-center justify-center h-full bg-muted/30 rounded">
            <p className="text-sm text-muted-foreground">Unsupported chart type: {type}</p>
          </div>
        )}
      </div>
    </div>
  );
}
