import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GrammarPanel } from '../GrammarPanel';
import type { GrammarIssue } from '@/lib/agent/types';

describe('GrammarPanel', () => {
  const mockIssues: GrammarIssue[] = [
    {
      id: '1',
      type: 'grammar',
      problematicText: 'They was going',
      explanation: 'Subject-verb agreement error',
      correction: 'They were going',
      location: { paragraphIndex: 0 },
      severity: 'error',
    },
    {
      id: '2',
      type: 'spelling',
      problematicText: 'recieve',
      explanation: 'Incorrect spelling',
      correction: 'receive',
      location: { paragraphIndex: 1 },
      severity: 'error',
    },
    {
      id: '3',
      type: 'style',
      problematicText: 'very very good',
      explanation: 'Repetitive word usage',
      correction: 'excellent',
      location: { paragraphIndex: 2 },
      severity: 'suggestion',
    },
  ];

  it('renders grammar issues grouped by severity', () => {
    const onApply = vi.fn();
    
    render(
      <GrammarPanel
        issues={mockIssues}
        onApply={onApply}
      />
    );
    
    // Check that severity groups are displayed
    expect(screen.getByText(/Errors \(2\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Suggestions \(1\)/i)).toBeInTheDocument();
  });

  it('displays issue details correctly', () => {
    const onApply = vi.fn();
    
    render(
      <GrammarPanel
        issues={mockIssues}
        onApply={onApply}
      />
    );
    
    // Check that problematic text is shown
    expect(screen.getByText('They was going')).toBeInTheDocument();
    expect(screen.getByText('recieve')).toBeInTheDocument();
    
    // Check that corrections are shown
    expect(screen.getByText('They were going')).toBeInTheDocument();
    expect(screen.getByText('receive')).toBeInTheDocument();
  });

  it('shows correct severity badges', () => {
    const onApply = vi.fn();
    
    render(
      <GrammarPanel
        issues={mockIssues}
        onApply={onApply}
      />
    );
    
    // Check for severity badges
    const errorBadges = screen.getAllByText('Error');
    expect(errorBadges.length).toBeGreaterThan(0);
    
    const suggestionBadges = screen.getAllByText('Suggestion');
    expect(suggestionBadges.length).toBeGreaterThan(0);
  });

  it('shows type badges for each issue', () => {
    const onApply = vi.fn();
    
    render(
      <GrammarPanel
        issues={mockIssues}
        onApply={onApply}
      />
    );
    
    // Check for type badges (using getAllByText since "Grammar" appears in header too)
    const grammarBadges = screen.getAllByText(/Grammar/);
    expect(grammarBadges.length).toBeGreaterThan(0);
    
    expect(screen.getByText(/Spelling/)).toBeInTheDocument();
    expect(screen.getByText(/Style/)).toBeInTheDocument();
  });

  it('calls onApply when fix button is clicked', async () => {
    const onApply = vi.fn().mockResolvedValue(undefined);
    
    render(
      <GrammarPanel
        issues={mockIssues}
        onApply={onApply}
      />
    );
    
    // Find and click the first fix button
    const fixButtons = screen.getAllByText('Fix Issue');
    fireEvent.click(fixButtons[0]);
    
    await waitFor(() => {
      expect(onApply).toHaveBeenCalledWith('1');
    });
  });

  it('shows explanation when expanded', async () => {
    const onApply = vi.fn();
    
    render(
      <GrammarPanel
        issues={mockIssues}
        onApply={onApply}
      />
    );
    
    // Initially, explanation should not be visible
    expect(screen.queryByText('Subject-verb agreement error')).not.toBeInTheDocument();
    
    // Click to expand
    const explanationButtons = screen.getAllByText('Explanation');
    fireEvent.click(explanationButtons[0]);
    
    // Now explanation should be visible
    await waitFor(() => {
      expect(screen.getByText('Subject-verb agreement error')).toBeInTheDocument();
    });
  });

  it('disables fix button while applying', async () => {
    const onApply = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(
      <GrammarPanel
        issues={mockIssues}
        onApply={onApply}
      />
    );
    
    // Find and click the first fix button
    const fixButtons = screen.getAllByText('Fix Issue');
    const firstButton = fixButtons[0];
    
    fireEvent.click(firstButton);
    
    // Button should be disabled while applying
    await waitFor(() => {
      expect(firstButton).toBeDisabled();
    });
  });

  it('shows empty state when no issues', () => {
    const onApply = vi.fn();
    
    render(
      <GrammarPanel
        issues={[]}
        onApply={onApply}
      />
    );
    
    expect(screen.getByText(/No grammar issues detected/i)).toBeInTheDocument();
  });

  it('shows correct count in header', () => {
    const onApply = vi.fn();
    
    render(
      <GrammarPanel
        issues={mockIssues}
        onApply={onApply}
      />
    );
    
    // Check error count
    expect(screen.getByText(/2 errors/i)).toBeInTheDocument();
    // Check suggestion count
    expect(screen.getByText(/1 suggestion/i)).toBeInTheDocument();
  });
});
