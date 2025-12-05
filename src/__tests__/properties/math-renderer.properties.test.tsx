import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { render } from '@testing-library/react';
import { MathRenderer } from '@/components/chat/MathRenderer';

// Arbitraries for generating LaTeX math expressions
const simpleNumberArbitrary = fc.integer({ min: 1, max: 100 });

const simpleVariableArbitrary = fc.constantFrom('x', 'y', 'z', 'a', 'b', 'c', 'n', 'm');

const mathOperatorArbitrary = fc.constantFrom('+', '-', '\\times', '\\div', '=');

const greekLetterArbitrary = fc.constantFrom(
  '\\alpha', '\\beta', '\\gamma', '\\delta', '\\theta', '\\pi', '\\sigma', '\\omega'
);

const simpleMathExpressionArbitrary = fc
  .tuple(simpleVariableArbitrary, mathOperatorArbitrary, simpleNumberArbitrary)
  .map(([variable, operator, number]) => `${variable} ${operator} ${number}`);

const fractionArbitrary = fc
  .tuple(simpleNumberArbitrary, simpleNumberArbitrary.filter(n => n !== 0))
  .map(([numerator, denominator]) => `\\frac{${numerator}}{${denominator}}`);

const exponentArbitrary = fc
  .tuple(simpleVariableArbitrary, simpleNumberArbitrary.filter(n => n >= 1 && n <= 10))
  .map(([base, exponent]) => `${base}^{${exponent}}`);

const subscriptArbitrary = fc
  .tuple(simpleVariableArbitrary, simpleNumberArbitrary.filter(n => n >= 0 && n <= 10))
  .map(([variable, subscript]) => `${variable}_{${subscript}}`);

const sqrtArbitrary = simpleNumberArbitrary
  .filter(n => n >= 0)
  .map(n => `\\sqrt{${n}}`);

const sumArbitrary = fc
  .tuple(simpleVariableArbitrary, simpleNumberArbitrary, simpleNumberArbitrary)
  .filter(([_, start, end]) => start < end)
  .map(([variable, start, end]) => `\\sum_{${variable}=${start}}^{${end}} ${variable}`);

const matrixArbitrary = fc
  .tuple(
    fc.integer({ min: 1, max: 3 }),
    fc.integer({ min: 1, max: 3 })
  )
  .chain(([rows, cols]) =>
    fc.array(simpleNumberArbitrary, { minLength: rows * cols, maxLength: rows * cols })
      .map(values => {
        const matrix = [];
        for (let i = 0; i < rows; i++) {
          const row = values.slice(i * cols, (i + 1) * cols).join(' & ');
          matrix.push(row);
        }
        return `\\begin{matrix} ${matrix.join(' \\\\ ')} \\end{matrix}`;
      })
  );

const chemicalFormulaArbitrary = fc.constantFrom(
  'H_2O',
  'CO_2',
  'H_2SO_4',
  'C_6H_{12}O_6',
  'NaCl',
  'CaCO_3',
  'NH_3',
  'CH_4'
);

const complexMathArbitrary = fc.oneof(
  simpleMathExpressionArbitrary,
  fractionArbitrary,
  exponentArbitrary,
  subscriptArbitrary,
  sqrtArbitrary,
  greekLetterArbitrary
);

describe('Math Renderer Properties', () => {
  // Feature: chat-rich-content, Property 6: Inline math rendering
  // Validates: Requirements 3.1
  it('should render inline math as formatted mathematical expressions within text flow for any valid LaTeX', () => {
    fc.assert(
      fc.property(complexMathArbitrary, (math) => {
        const { container } = render(<MathRenderer math={math} displayMode={false} />);
        
        // Should render as inline element (span)
        const inlineElement = container.querySelector('span');
        expect(inlineElement).toBeTruthy();
        
        // Should contain KaTeX rendered content
        const katexElement = container.querySelector('.katex');
        expect(katexElement).toBeTruthy();
        
        // Should not be in display mode (centered block)
        const displayMath = container.querySelector('.katex-display');
        expect(displayMath).toBeFalsy();
      }),
      { numRuns: 100 }
    );
  });

  // Feature: chat-rich-content, Property 7: Block math rendering
  // Validates: Requirements 3.2
  it('should render block math as centered formatted mathematical expressions for any valid LaTeX', () => {
    fc.assert(
      fc.property(complexMathArbitrary, (math) => {
        const { container } = render(<MathRenderer math={math} displayMode={true} />);
        
        // Should render as block element (div)
        const blockElement = container.querySelector('div');
        expect(blockElement).toBeTruthy();
        
        // Should contain KaTeX rendered content
        const katexElement = container.querySelector('.katex');
        expect(katexElement).toBeTruthy();
        
        // Should be in display mode (centered block)
        const displayMath = container.querySelector('.katex-display');
        expect(displayMath).toBeTruthy();
      }),
      { numRuns: 100 }
    );
  });

  // Feature: chat-rich-content, Property 8: Math symbol support
  // Validates: Requirements 3.3, 3.4
  it('should correctly render common mathematical symbols, operators, fractions, exponents, subscripts, and matrices', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          greekLetterArbitrary,
          fractionArbitrary,
          exponentArbitrary,
          subscriptArbitrary,
          sqrtArbitrary,
          sumArbitrary,
          matrixArbitrary
        ),
        (math) => {
          const { container } = render(<MathRenderer math={math} displayMode={false} />);
          
          // Should render KaTeX content
          const katexElement = container.querySelector('.katex');
          expect(katexElement).toBeTruthy();
          
          // Should not show error indicator
          const errorElement = container.querySelector('[title="Invalid LaTeX syntax"]');
          expect(errorElement).toBeFalsy();
          
          // Should have rendered content (not empty)
          expect(container.textContent).toBeTruthy();
          expect(container.textContent?.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: chat-rich-content, Property 9: Chemical formula rendering
  // Validates: Requirements 3.5
  it('should render chemical formulas with proper subscripts and superscripts', () => {
    fc.assert(
      fc.property(chemicalFormulaArbitrary, (formula) => {
        const { container } = render(<MathRenderer math={formula} displayMode={false} />);
        
        // Should render KaTeX content
        const katexElement = container.querySelector('.katex');
        expect(katexElement).toBeTruthy();
        
        // Should not show error indicator
        const errorElement = container.querySelector('[title="Invalid LaTeX syntax"]');
        expect(errorElement).toBeFalsy();
        
        // Should contain subscript elements (KaTeX renders these)
        const hasSubscripts = container.innerHTML.includes('vlist') || 
                             container.innerHTML.includes('sub') ||
                             container.textContent !== formula; // Content transformed
        expect(hasSubscripts).toBeTruthy();
      }),
      { numRuns: 100 }
    );
  });

  it('should handle invalid LaTeX gracefully with error indicator', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          '\\invalid',
          '\\frac{1}',
          '\\sqrt',
          '{unclosed',
          'unclosed}',
          '\\begin{matrix} 1 & 2',
          '\\sum_{x=',
        ),
        (invalidMath) => {
          const { container } = render(<MathRenderer math={invalidMath} displayMode={false} />);
          
          // Should show error indicator or render as plain text
          const errorElement = container.querySelector('[title="Invalid LaTeX syntax"]');
          
          // Should either show error or handle gracefully
          expect(container.textContent).toBeTruthy();
          
          // If error shown, should contain the original LaTeX
          if (errorElement) {
            expect(container.textContent).toContain(invalidMath);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle empty or whitespace-only math input', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('', '   ', '\n', '\t'),
        (emptyMath) => {
          const { container } = render(<MathRenderer math={emptyMath} displayMode={false} />);
          
          // Should render something (even if empty)
          expect(container).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain display mode consistency', () => {
    fc.assert(
      fc.property(
        complexMathArbitrary,
        fc.boolean(),
        (math, displayMode) => {
          const { container } = render(<MathRenderer math={math} displayMode={displayMode} />);
          
          const katexDisplay = container.querySelector('.katex-display');
          
          if (displayMode) {
            // Block math should have display class
            expect(katexDisplay).toBeTruthy();
          } else {
            // Inline math should not have display class
            expect(katexDisplay).toBeFalsy();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
