'use client';

import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface EChartsRendererProps {
  data: any;
  className?: string;
}

export const EChartsRenderer = React.memo(function EChartsRenderer({
  data,
  className,
}: EChartsRendererProps) {
  const chartOption = useMemo(() => {
    try {
      // Ensure data is valid ECharts option format
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid chart data format');
      }

      // Add default styling for better appearance
      const defaultOption = {
        backgroundColor: 'transparent',
        textStyle: {
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderColor: 'transparent',
          textStyle: {
            color: '#fff',
          },
        },
        ...data,
      };

      return defaultOption;
    } catch (error) {
      console.error('ECharts data parsing error:', error);
      return null;
    }
  }, [data]);

  if (!chartOption) {
    return (
      <div className={cn('my-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg', className)}>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-destructive mb-2">
              Invalid Chart Data
            </p>
            <p className="text-xs text-destructive/80">
              The chart data format is invalid or corrupted.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('my-4', className)}>
      <ReactECharts
        option={chartOption}
        style={{ height: '400px', width: '100%' }}
        opts={{ renderer: 'canvas' }}
        theme="light"
      />
    </div>
  );
});