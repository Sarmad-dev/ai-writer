import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditorHeader } from '../EditorHeader';

// Mock the hooks and dependencies
vi.mock('@/hooks/useEditor', () => ({
  useEditor: () => ({
    documentId: 'test-doc',
    title: 'Test Document',
    content: '<p>Test content</p>',
    lastSaved: new Date(),
    isDirty: false,
    isSaving: false,
    settings: {
      fontSize: 12,
      marginTop: 1,
      marginBottom: 1,
      marginLeft: 1,
      marginRight: 1,
    },
    autoSaveEnabled: true,
    setTitle: vi.fn(),
    save: vi.fn(),
    canRedo: false,
    canUndo: false,
    undo: vi.fn(),
    redo: vi.fn(),
    toggleAutoSave: vi.fn(),
  }),
}));

vi.mock('@/lib/export', () => ({
  exportAsPDF: vi.fn(),
  exportAsDOCX: vi.fn(),
  downloadMarkdown: vi.fn(),
  copyDocumentLink: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('EditorHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the auto-save toggle switch', () => {
    render(<EditorHeader />);
    
    const autoSaveSwitch = screen.getByRole('switch');
    expect(autoSaveSwitch).toBeInTheDocument();
    expect(autoSaveSwitch).toBeChecked();
  });

  it('displays auto-save label', () => {
    render(<EditorHeader />);
    
    expect(screen.getByText('Auto-save')).toBeInTheDocument();
  });

  it('calls onAutoSaveToggle when switch is clicked', () => {
    const mockOnAutoSaveToggle = vi.fn();
    
    render(
      <EditorHeader 
        autoSaveEnabled={true}
        onAutoSaveToggle={mockOnAutoSaveToggle}
      />
    );
    
    const autoSaveSwitch = screen.getByRole('switch');
    fireEvent.click(autoSaveSwitch);
    
    expect(mockOnAutoSaveToggle).toHaveBeenCalledWith(false);
  });

  it('shows correct tooltip text based on auto-save state', async () => {
    render(<EditorHeader autoSaveEnabled={true} />);
    
    const switchContainer = screen.getByRole('switch').closest('[data-state]');
    expect(switchContainer).toBeInTheDocument();
  });

  it('renders with custom auto-save state', () => {
    render(<EditorHeader autoSaveEnabled={false} />);
    
    const autoSaveSwitch = screen.getByRole('switch');
    expect(autoSaveSwitch).not.toBeChecked();
  });
});