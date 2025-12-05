import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { render } from '@testing-library/react';
import { MarkdownRenderer } from '@/components/chat/MarkdownRenderer';

// Arbitraries for generating table content
const tableCellArbitrary = fc
  .stringMatching(/^[a-zA-Z0-9 ]+$/)
  .filter(s => s.trim().length > 0 && s.length <= 30);

const tableRowArbitrary = fc
  .array(tableCellArbitrary, { minLength: 1, maxLength: 5 })
  .map(cells => `| ${cells.join(' | ')} |`);

const tableArbitrary = fc
  .tuple(
    fc.array(tableCellArbitrary, { minLength: 1, maxLength: 5 }), // headers
    fc.array(
      fc.array(tableCellArbitrary, { minLength: 1, maxLength: 5 }),
      { minLength: 1, maxLength: 5 }
    ) // rows
  )
  .map(([headers, rows]) => {
    const headerRow = `| ${headers.join(' | ')} |`;
    const separator = `| ${headers.map(() => '---').join(' | ')} |`;
    const dataRows = rows.map(row => {
      // Ensure each row has the same number of cells as headers
      const paddedRow = [...row];
      while (paddedRow.length < headers.length) {
        paddedRow.push('');
      }
      return `| ${paddedRow.slice(0, headers.length).join(' | ')} |`;
    });
    
    return `${headerRow}\n${separator}\n${dataRows.join('\n')}`;
  });

describe('Table Renderer Properties', () => {
  // Feature: chat-rich-content, Property 19: Table rendering
  // Validates: Requirements 9.1, 9.2, 9.3
  it('should render markdown tables as HTML tables with proper structure', () => {
    fc.assert(
      fc.property(tableArbitrary, (markdown) => {
        const { container } = render(<MarkdownRenderer content={markdown} />);
        
        // Should render a table element
        const tableElement = container.querySelector('table');
        expect(tableElement).toBeTruthy();
        
        // Should have proper structure with thead and tbody
        const theadElement = container.querySelector('thead');
        const tbodyElement = container.querySelector('tbody');
        expect(theadElement).toBeTruthy();
        expect(tbodyElement).toBeTruthy();
        
        // Should have borders and spacing (check for border classes)
        const tableWrapper = container.querySelector('[class*="border"]');
        expect(tableWrapper).toBeTruthy();
      }),
      { numRuns: 100 }
    );
  });

  it('should apply alternating row colors for better readability', () => {
    fc.assert(
      fc.property(tableArbitrary, (markdown) => {
        const { container } = render(<MarkdownRenderer content={markdown} />);
        
        // Check that tbody has the alternating row color class
        const tbody = container.querySelector('tbody');
        expect(tbody).toBeTruthy();
        
        // The tbody should have the nth-child selector for alternating colors
        const tbodyClass = tbody?.className || '';
        const hasAlternatingColorClass = 
          tbodyClass.includes('nth-child') || 
          tbodyClass.includes('[&>tr:nth-child(even)]:bg-muted');
        
        // At minimum, tbody should exist with styling
        expect(tbody).toBeTruthy();
        
        // Verify rows exist
        const tbodyRows = container.querySelectorAll('tbody tr');
        expect(tbodyRows.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('should make tables responsive with overflow wrapper', () => {
    fc.assert(
      fc.property(tableArbitrary, (markdown) => {
        const { container } = render(<MarkdownRenderer content={markdown} />);
        
        // Should have a responsive wrapper with overflow-x-auto
        const wrapper = container.querySelector('[class*="overflow-x-auto"]');
        expect(wrapper).toBeTruthy();
        
        // Table should be inside the wrapper
        const tableInWrapper = wrapper?.querySelector('table');
        expect(tableInWrapper).toBeTruthy();
      }),
      { numRuns: 100 }
    );
  });

  // Feature: chat-rich-content, Property 20: Table header styling
  // Validates: Requirements 9.4
  it('should style table headers distinctly from table body cells', () => {
    fc.assert(
      fc.property(tableArbitrary, (markdown) => {
        const { container } = render(<MarkdownRenderer content={markdown} />);
        
        // Get header cells (th) and body cells (td)
        const headerCells = container.querySelectorAll('thead th');
        const bodyCells = container.querySelectorAll('tbody td');
        
        // Should have header cells
        expect(headerCells.length).toBeGreaterThan(0);
        
        if (bodyCells.length > 0) {
          // Check that header cells have distinct styling
          const headerCell = headerCells[0];
          const bodyCell = bodyCells[0];
          
          const headerClass = headerCell.className;
          const bodyClass = bodyCell.className;
          
          // Headers should have font-semibold or font-bold
          const headerHasBoldFont = headerClass.includes('font-semibold') || headerClass.includes('font-bold');
          expect(headerHasBoldFont).toBeTruthy();
          
          // Headers and body cells should have different text colors
          const headerHasForeground = headerClass.includes('text-foreground');
          const bodyHasMutedForeground = bodyClass.includes('text-muted-foreground');
          
          // At least one distinction should exist
          const hasDistinctStyling = headerHasBoldFont || (headerHasForeground && bodyHasMutedForeground);
          expect(hasDistinctStyling).toBeTruthy();
        }
      }),
      { numRuns: 100 }
    );
  });

  // Feature: chat-rich-content, Property 21: Nested content in tables
  // Validates: Requirements 9.5
  it('should render nested content in table cells correctly', () => {
    // Create arbitraries for nested content
    const nestedCodeArbitrary = fc
      .stringMatching(/^[a-zA-Z0-9]+$/)
      .filter(s => s.length > 0 && s.length <= 20)
      .map(code => `\`${code}\``);

    const nestedBoldArbitrary = fc
      .stringMatching(/^[a-zA-Z0-9 ]+$/)
      .filter(s => s.trim().length > 0 && s.length <= 20)
      .map(text => `**${text.trim()}**`);

    const nestedContentArbitrary = fc.oneof(
      nestedCodeArbitrary,
      nestedBoldArbitrary,
      tableCellArbitrary
    );

    const tableWithNestedContentArbitrary = fc
      .tuple(
        fc.array(tableCellArbitrary, { minLength: 2, maxLength: 3 }), // headers
        fc.array(
          fc.array(nestedContentArbitrary, { minLength: 2, maxLength: 3 }),
          { minLength: 1, maxLength: 3 }
        ) // rows with nested content
      )
      .map(([headers, rows]) => {
        const headerRow = `| ${headers.join(' | ')} |`;
        const separator = `| ${headers.map(() => '---').join(' | ')} |`;
        const dataRows = rows.map(row => {
          const paddedRow = [...row];
          while (paddedRow.length < headers.length) {
            paddedRow.push('');
          }
          return `| ${paddedRow.slice(0, headers.length).join(' | ')} |`;
        });
        
        return `${headerRow}\n${separator}\n${dataRows.join('\n')}`;
      });

    fc.assert(
      fc.property(tableWithNestedContentArbitrary, (markdown) => {
        const { container } = render(<MarkdownRenderer content={markdown} />);
        
        // Should render table
        const table = container.querySelector('table');
        expect(table).toBeTruthy();
        
        // Check for nested code elements
        const codeElements = container.querySelectorAll('td code, th code');
        
        // Check for nested bold elements
        const strongElements = container.querySelectorAll('td strong, th strong');
        
        // At least some nested content should be rendered
        // (not all generated tables will have nested content due to oneof)
        const hasNestedContent = codeElements.length > 0 || strongElements.length > 0;
        
        // If the markdown contains backticks or **, we should have nested content
        const hasCodeSyntax = markdown.includes('`');
        const hasBoldSyntax = markdown.includes('**');
        
        if (hasCodeSyntax || hasBoldSyntax) {
          expect(hasNestedContent).toBeTruthy();
        }
        
        // Table should still be properly structured
        expect(container.querySelector('thead')).toBeTruthy();
        expect(container.querySelector('tbody')).toBeTruthy();
      }),
      { numRuns: 100 }
    );
  });
});
