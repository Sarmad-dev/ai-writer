import type { WorkflowState, GraphData } from '../types';

/**
 * Graph Generation Node
 * Detects statistical data in content and creates graph configurations
 * 
 * This node:
 * 1. Analyzes generated content for statistical data
 * 2. Identifies appropriate chart types
 * 3. Extracts data and creates graph configurations
 * 4. Prepares graphs for embedding in content
 */
export async function graphGenerationNode(state: WorkflowState): Promise<Partial<WorkflowState>> {
  try {
    const { generatedContent } = state;

    // Detect statistical data in the content
    const detectedGraphs = detectStatisticalData(generatedContent);

    // Generate graph configurations
    const graphs: GraphData[] = detectedGraphs.map((detected, index) => 
      createGraphConfig(detected, index)
    );

    return {
      graphs,
      metadata: {
        ...state.metadata,
        nodeHistory: [...state.metadata.nodeHistory, 'detectGraphs'],
        graphsDetected: graphs.length,
      },
    };
  } catch (error) {
    console.error('Error in graph generation node:', error);
    // Don't fail the workflow, just continue without graphs
    return {
      graphs: [],
      metadata: {
        ...state.metadata,
        nodeHistory: [...state.metadata.nodeHistory, 'detectGraphs'],
        graphError: error instanceof Error ? error.message : 'Failed to generate graphs',
      },
    };
  }
}

interface DetectedData {
  type: 'table' | 'list' | 'comparison';
  data: Record<string, string | number>[];
  context: string;
  suggestedChartType: GraphData['type'];
}

/**
 * Detects statistical data in markdown content
 */
function detectStatisticalData(content: string): DetectedData[] {
  const detected: DetectedData[] = [];

  // Detect markdown tables
  const tableRegex = /\|(.+)\|[\r\n]+\|[-:\s|]+\|[\r\n]+((?:\|.+\|[\r\n]+)+)/g;
  let match;

  while ((match = tableRegex.exec(content)) !== null) {
    const headers = match[1].split('|').map(h => h.trim()).filter(h => h);
    const rows = match[2].trim().split('\n');

    const data: Record<string, string | number>[] = [];
    
    for (const row of rows) {
      const cells = row.split('|').map(c => c.trim()).filter(c => c);
      if (cells.length === headers.length) {
        const rowData: Record<string, string | number> = {};
        headers.forEach((header, i) => {
          const value = cells[i];
          // Try to parse as number
          const numValue = parseFloat(value.replace(/[,%$]/g, ''));
          rowData[header] = isNaN(numValue) ? value : numValue;
        });
        data.push(rowData);
      }
    }

    if (data.length > 0) {
      detected.push({
        type: 'table',
        data,
        context: match[0],
        suggestedChartType: suggestChartType(data, headers),
      });
    }
  }

  // Detect numbered lists with data patterns
  const listRegex = /(?:^|\n)(?:\d+\.|[-*])\s+([^:\n]+):\s*([0-9,.%$]+)/gm;
  const listData: Record<string, string | number>[] = [];
  
  while ((match = listRegex.exec(content)) !== null) {
    const label = match[1].trim();
    const value = parseFloat(match[2].replace(/[,%$]/g, ''));
    
    if (!isNaN(value)) {
      listData.push({
        label,
        value,
      });
    }
  }

  if (listData.length >= 2) {
    detected.push({
      type: 'list',
      data: listData,
      context: 'Detected from list',
      suggestedChartType: 'BAR',
    });
  }

  return detected;
}

/**
 * Suggests appropriate chart type based on data characteristics
 */
function suggestChartType(
  data: Record<string, string | number>[],
  headers: string[]
): GraphData['type'] {
  // If we have time-series data (dates, years, months), use line chart
  const hasTimeSeries = headers.some(h => 
    /year|month|date|time|quarter|q[1-4]/i.test(h)
  );
  
  if (hasTimeSeries) {
    return 'LINE';
  }

  // If we have percentage data that sums to ~100, use pie chart
  const numericHeaders = headers.filter(h => {
    return data.some(row => typeof row[h] === 'number');
  });

  if (numericHeaders.length === 1) {
    const values = data.map(row => row[numericHeaders[0]] as number);
    const sum = values.reduce((a, b) => a + b, 0);
    
    if (Math.abs(sum - 100) < 5 && data.length <= 8) {
      return 'PIE';
    }
  }

  // If we have multiple numeric columns, use area chart
  if (numericHeaders.length > 2) {
    return 'AREA';
  }

  // Default to bar chart
  return 'BAR';
}

/**
 * Creates a graph configuration from detected data
 */
function createGraphConfig(detected: DetectedData, index: number): GraphData {
  const headers = Object.keys(detected.data[0] || {});
  
  return {
    id: `graph-${index}`,
    type: detected.suggestedChartType,
    data: detected.data,
    config: {
      title: `Chart ${index + 1}`,
      xAxisLabel: headers[0] || 'Category',
      yAxisLabel: headers[1] || 'Value',
      colors: generateColors(detected.data.length),
      legend: true,
    },
  };
}

/**
 * Generates color palette for charts
 */
function generateColors(count: number): string[] {
  const baseColors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#f97316', // orange
  ];

  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }

  return colors;
}
