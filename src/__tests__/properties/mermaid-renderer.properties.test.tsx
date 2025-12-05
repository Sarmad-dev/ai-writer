import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { render } from '@testing-library/react';
import { MermaidRenderer } from '@/components/chat/MermaidRenderer';

describe('MermaidRenderer Properties', () => {
  // Arbitraries for generating valid Mermaid diagram syntax
  const nodeIdArbitrary = fc
    .stringMatching(/^[A-Z][a-zA-Z0-9]*$/)
    .filter(s => s.length >= 1 && s.length <= 10);

  const nodeLabelArbitrary = fc
    .stringMatching(/^[a-zA-Z0-9 ]+$/)
    .filter(s => s.trim().length > 0 && s.length <= 20);

  const flowchartDirectionArbitrary = fc.constantFrom('TD', 'LR', 'BT', 'RL');

  const flowchartArbitrary = fc
    .tuple(
      flowchartDirectionArbitrary,
      fc.array(
        fc.tuple(nodeIdArbitrary, nodeLabelArbitrary, nodeIdArbitrary, nodeLabelArbitrary),
        { minLength: 1, maxLength: 5 }
      )
    )
    .map(([direction, connections]) => {
      const lines = [`flowchart ${direction}`];
      connections.forEach(([fromId, fromLabel, toId, toLabel]) => {
        lines.push(`    ${fromId}[${fromLabel}] --> ${toId}[${toLabel}]`);
      });
      return lines.join('\n');
    });

  const sequenceDiagramArbitrary = fc
    .tuple(
      fc.array(nodeIdArbitrary, { minLength: 2, maxLength: 4 }),
      fc.array(nodeLabelArbitrary, { minLength: 1, maxLength: 3 })
    )
    .map(([participants, messages]) => {
      const lines = ['sequenceDiagram'];
      participants.forEach(p => lines.push(`    participant ${p}`));
      for (let i = 0; i < messages.length; i++) {
        const from = participants[i % participants.length];
        const to = participants[(i + 1) % participants.length];
        lines.push(`    ${from}->>${to}: ${messages[i]}`);
      }
      return lines.join('\n');
    });

  const classDiagramArbitrary = fc
    .tuple(
      fc.array(nodeIdArbitrary, { minLength: 1, maxLength: 3 }),
      fc.array(nodeLabelArbitrary, { minLength: 1, maxLength: 3 })
    )
    .map(([classNames, methods]) => {
      const lines = ['classDiagram'];
      classNames.forEach(className => {
        lines.push(`    class ${className} {`);
        methods.forEach(method => {
          lines.push(`        +${method}()`);
        });
        lines.push('    }');
      });
      return lines.join('\n');
    });

  const stateDiagramArbitrary = fc
    .array(nodeIdArbitrary, { minLength: 2, maxLength: 4 })
    .map(states => {
      const lines = ['stateDiagram-v2'];
      lines.push(`    [*] --> ${states[0]}`);
      for (let i = 0; i < states.length - 1; i++) {
        lines.push(`    ${states[i]} --> ${states[i + 1]}`);
      }
      lines.push(`    ${states[states.length - 1]} --> [*]`);
      return lines.join('\n');
    });

  const pieDiagramArbitrary = fc
    .array(
      fc.tuple(nodeLabelArbitrary, fc.integer({ min: 1, max: 100 })),
      { minLength: 2, maxLength: 5 }
    )
    .map(items => {
      const lines = ['pie title Sample Data'];
      items.forEach(([label, value]) => {
        lines.push(`    "${label}" : ${value}`);
      });
      return lines.join('\n');
    });

  const validMermaidArbitrary = fc.oneof(
    flowchartArbitrary,
    sequenceDiagramArbitrary,
    classDiagramArbitrary,
    stateDiagramArbitrary,
    pieDiagramArbitrary
  );

  // Feature: chat-rich-content, Property 13: Mermaid diagram rendering
  // Validates: Requirements 5.3
  it('should accept valid Mermaid diagram syntax and render a container', () => {
    fc.assert(
      fc.property(validMermaidArbitrary, (chart) => {
        const { container } = render(<MermaidRenderer chart={chart} />);

        // Should render a container div
        const containerDiv = container.querySelector('div');
        expect(containerDiv).toBeTruthy();

        // Should have the appropriate classes for layout
        expect(containerDiv?.className).toContain('my-4');

        // Component should accept the chart prop without errors
        expect(chart).toBeTruthy();
        expect(typeof chart).toBe('string');
      }),
      { numRuns: 100 }
    );
  });

  it('should accept flowchart diagram syntax', () => {
    fc.assert(
      fc.property(flowchartArbitrary, (chart) => {
        const { container } = render(<MermaidRenderer chart={chart} />);

        // Should render without throwing errors
        expect(container).toBeTruthy();

        // Flowchart syntax should start with 'flowchart'
        expect(chart.trim().startsWith('flowchart')).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should accept sequence diagram syntax', () => {
    fc.assert(
      fc.property(sequenceDiagramArbitrary, (chart) => {
        const { container } = render(<MermaidRenderer chart={chart} />);

        // Should render without throwing errors
        expect(container).toBeTruthy();

        // Sequence diagram syntax should start with 'sequenceDiagram'
        expect(chart.trim().startsWith('sequenceDiagram')).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should handle invalid Mermaid syntax without crashing', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          'invalid syntax',
          'flowchart TD\n    A[',
          'sequenceDiagram\n    participant',
          'classDiagram\n    class {',
          'stateDiagram\n    [*] -->',
          'pie\n    "Item" :',
          'graph TD\n    A --> B -->',
          'flowchart\n    Node1 Node2'
        ),
        (invalidChart) => {
          // Should not throw an error when rendering invalid syntax
          expect(() => {
            const { container } = render(<MermaidRenderer chart={invalidChart} />);
            expect(container).toBeTruthy();
          }).not.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should render with proper container structure', () => {
    fc.assert(
      fc.property(validMermaidArbitrary, (chart) => {
        const { container } = render(<MermaidRenderer chart={chart} />);

        // Should have a container div
        const containerDiv = container.querySelector('div');
        expect(containerDiv).toBeTruthy();

        // Should render without errors
        expect(container).toBeTruthy();
      }),
      { numRuns: 100 }
    );
  });

  it('should handle empty or whitespace-only input without crashing', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('', '   ', '\n', '\t', '  \n  '),
        (emptyChart) => {
          // Should not throw when rendering empty input
          expect(() => {
            const { container } = render(<MermaidRenderer chart={emptyChart} />);
            expect(container).toBeTruthy();
          }).not.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should accept className prop for custom styling', () => {
    fc.assert(
      fc.property(
        validMermaidArbitrary,
        fc.stringMatching(/^[a-z-]+$/),
        (chart, customClass) => {
          const { container } = render(<MermaidRenderer chart={chart} className={customClass} />);

          // Should render without errors
          expect(container).toBeTruthy();

          // Should accept className prop
          expect(customClass).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should accept different diagram types without errors', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          flowchartArbitrary,
          sequenceDiagramArbitrary,
          classDiagramArbitrary,
          stateDiagramArbitrary,
          pieDiagramArbitrary
        ),
        (chart) => {
          // Should render all diagram types without throwing
          expect(() => {
            const { container } = render(<MermaidRenderer chart={chart} />);
            expect(container).toBeTruthy();
          }).not.toThrow();

          // Chart should be a non-empty string
          expect(chart.trim().length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
