'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { ChartDataPoint } from './ChartRenderer';

export interface DataTableProps {
  data: ChartDataPoint[];
  onChange: (data: ChartDataPoint[]) => void;
}

export function DataTable({ data, onChange }: DataTableProps) {
  const [editingData, setEditingData] = useState<ChartDataPoint[]>(data);

  // Get all unique keys from the data
  const keys = editingData.length > 0 
    ? Array.from(new Set(editingData.flatMap(row => Object.keys(row))))
    : ['name', 'value'];

  const handleCellChange = (rowIndex: number, key: string, value: string) => {
    const newData = [...editingData];
    // Try to parse as number, otherwise keep as string
    const parsedValue = !isNaN(Number(value)) && value !== '' ? Number(value) : value;
    newData[rowIndex] = { ...newData[rowIndex], [key]: parsedValue };
    setEditingData(newData);
    onChange(newData);
  };

  const handleAddRow = () => {
    const newRow: ChartDataPoint = {};
    keys.forEach(key => {
      newRow[key] = '';
    });
    const newData = [...editingData, newRow];
    setEditingData(newData);
    onChange(newData);
  };

  const handleDeleteRow = (rowIndex: number) => {
    const newData = editingData.filter((_, index) => index !== rowIndex);
    setEditingData(newData);
    onChange(newData);
  };

  const handleAddColumn = () => {
    const newKey = `column${keys.length + 1}`;
    const newData = editingData.map(row => ({ ...row, [newKey]: '' }));
    setEditingData(newData);
    onChange(newData);
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {keys.map((key) => (
                <th key={key} className="border border-border p-2 bg-muted text-left text-sm font-medium">
                  {key}
                </th>
              ))}
              <th className="border border-border p-2 bg-muted w-16"></th>
            </tr>
          </thead>
          <tbody>
            {editingData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {keys.map((key) => (
                  <td key={key} className="border border-border p-1">
                    <Input
                      value={row[key] ?? ''}
                      onChange={(e) => handleCellChange(rowIndex, key, e.target.value)}
                      className="h-8 text-sm"
                    />
                  </td>
                ))}
                <td className="border border-border p-1 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteRow(rowIndex)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleAddRow}>
          <Plus className="h-4 w-4 mr-2" />
          Add Row
        </Button>
        <Button variant="outline" size="sm" onClick={handleAddColumn}>
          <Plus className="h-4 w-4 mr-2" />
          Add Column
        </Button>
      </div>
    </div>
  );
}
