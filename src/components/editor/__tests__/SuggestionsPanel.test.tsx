import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SuggestionsPanel } from '../SuggestionsPanel';
import type { ContextualSuggestion } from '@/lib/agent/types';

describe('SuggestionsPanel', () => {
  const mockSuggestions: ContextualSuggestion[] = [
    {
      id: '1',
      text: 'Add more details about the implementation.',
      type: 'expansion',
      location: {
        paragraphIndex: 2,
        headingContext: 'Implementation',
      },
      contextPreview: '...the basic structure...',
      relevanceScore: 0.85,
    },
    {
      id: '2',
      text: 'Consider adding a code example here.',
      type: 'example',
      location: {
        paragraphIndex: 5,
      },
      contextPreview: '...when working with async...',
      relevanceScore: 0.92,
    },
  ];

  it('renders suggestions list', () => {
    const onApply = vi.fn();
    
    render(
      <SuggestionsPanel
        suggestions={mockSuggestions}
        onApply={onApply}
      />
    );

    expect(screen.getByText('Suggestions')).toBeInTheDocument();
    expect(screen.getByText('2 suggestions available')).toBeInTheDocument();
  });

  it('displays suggestion details', () => {
    const onApply = vi.fn();
    
    render(
      <SuggestionsPanel
        suggestions={mockSuggestions}
        onApply={onApply}
      />
    );

    expect(screen.getByText('Add more details about the implementation.')).toBeInTheDocument();
    expect(screen.getByText('Consider adding a code example here.')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
  });

  it('shows context preview', () => {
    const onApply = vi.fn();
    
    render(
      <SuggestionsPanel
        suggestions={mockSuggestions}
        onApply={onApply}
      />
    );

    expect(screen.getByText(/...the basic structure.../)).toBeInTheDocument();
    expect(screen.getByText(/...when working with async.../)).toBeInTheDocument();
  });

  it('calls onApply when apply button is clicked', async () => {
    const onApply = vi.fn().mockResolvedValue(undefined);
    
    render(
      <SuggestionsPanel
        suggestions={mockSuggestions}
        onApply={onApply}
      />
    );

    const applyButtons = screen.getAllByText('Apply Suggestion');
    fireEvent.click(applyButtons[0]);

    await waitFor(() => {
      expect(onApply).toHaveBeenCalledWith('1');
    });
  });

  it('shows loading state when applying', async () => {
    const onApply = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(
      <SuggestionsPanel
        suggestions={mockSuggestions}
        onApply={onApply}
      />
    );

    const applyButtons = screen.getAllByText('Apply Suggestion');
    fireEvent.click(applyButtons[0]);

    expect(screen.getByText('Applying...')).toBeInTheDocument();
  });

  it('marks suggestion as applied after successful application', async () => {
    const onApply = vi.fn().mockResolvedValue(undefined);
    
    render(
      <SuggestionsPanel
        suggestions={mockSuggestions}
        onApply={onApply}
      />
    );

    const applyButtons = screen.getAllByText('Apply Suggestion');
    fireEvent.click(applyButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Applied')).toBeInTheDocument();
    });
  });

  it('filters suggestions by type', async () => {
    const onApply = vi.fn();
    
    render(
      <SuggestionsPanel
        suggestions={mockSuggestions}
        onApply={onApply}
      />
    );

    // Open filter dropdown
    const filterButton = screen.getByRole('button', { name: '' }); // Filter icon button
    fireEvent.click(filterButton);

    // Uncheck 'example' type
    const exampleCheckbox = screen.getByText('Example');
    fireEvent.click(exampleCheckbox);

    // Should only show 1 suggestion now
    await waitFor(() => {
      expect(screen.getByText('1 suggestion available')).toBeInTheDocument();
    });
  });

  it('shows empty state when no suggestions', () => {
    const onApply = vi.fn();
    
    render(
      <SuggestionsPanel
        suggestions={[]}
        onApply={onApply}
      />
    );

    expect(screen.getByText(/No suggestions yet/)).toBeInTheDocument();
  });

  it('displays location context correctly', () => {
    const onApply = vi.fn();
    
    render(
      <SuggestionsPanel
        suggestions={mockSuggestions}
        onApply={onApply}
      />
    );

    expect(screen.getByText('In "Implementation"')).toBeInTheDocument();
    expect(screen.getByText('Paragraph 6')).toBeInTheDocument();
  });
});
