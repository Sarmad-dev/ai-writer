'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TableRendererProps {
  children?: React.ReactNode;
  className?: string;
}

export const TableRenderer = React.memo(function TableRenderer({
  children,
  className,
}: TableRendererProps) {
  return (
    <div className={cn('my-4 overflow-x-auto', className)} role="region" aria-label="Data table" tabIndex={0}>
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden border border-border rounded-lg">
          <table className="min-w-full divide-y divide-border">
            {children}
          </table>
        </div>
      </div>
    </div>
  );
});

interface TableHeadProps {
  children?: React.ReactNode;
}

export const TableHead = React.memo(function TableHead({ children }: TableHeadProps) {
  return (
    <thead className="bg-muted/50">
      {children}
    </thead>
  );
});

interface TableBodyProps {
  children?: React.ReactNode;
}

export const TableBody = React.memo(function TableBody({ children }: TableBodyProps) {
  return (
    <tbody className="bg-background divide-y divide-border [&>tr:nth-child(even)]:bg-muted/20">
      {children}
    </tbody>
  );
});

interface TableRowProps {
  children?: React.ReactNode;
}

export const TableRow = React.memo(function TableRow({ 
  children,
}: TableRowProps) {
  return (
    <tr>
      {children}
    </tr>
  );
});

interface TableCellProps {
  children?: React.ReactNode;
  isHeader?: boolean;
  align?: 'left' | 'center' | 'right' | 'justify' | 'char';
}

export const TableCell = React.memo(function TableCell({ 
  children, 
  isHeader = false,
  align,
}: TableCellProps) {
  const Tag = isHeader ? 'th' : 'td';
  
  // Map HTML align values to Tailwind classes
  const alignClass = align === 'center' ? 'text-center' 
    : align === 'right' ? 'text-right'
    : 'text-left'; // default to left for 'left', 'justify', 'char', or undefined
  
  return (
    <Tag
      className={cn(
        'px-4 py-3 text-sm',
        isHeader && 'font-semibold text-foreground',
        !isHeader && 'text-muted-foreground',
        alignClass
      )}
      scope={isHeader ? 'col' : undefined}
    >
      {children}
    </Tag>
  );
});
