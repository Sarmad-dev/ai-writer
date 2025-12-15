"use client";

import { NodeViewWrapper } from '@tiptap/react';
import { useEffect, useRef, useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export const MathNodeView = ({ node, updateAttributes, deleteNode }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [latex, setLatex] = useState(node.attrs.latex || '');
  const [error, setError] = useState<string | null>(null);
  const mathRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isBlock = node.type.name === 'blockMath';
  const display = isBlock ? 'block' : node.attrs.display === 'block' ? 'block' : 'inline';

  useEffect(() => {
    if (!isEditing && mathRef.current && latex) {
      try {
        katex.render(latex, mathRef.current, {
          displayMode: display === 'block',
          throwOnError: false,
          errorColor: '#cc0000',
          strict: false,
          trust: false,
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid LaTeX');
      }
    }
  }, [latex, isEditing, display]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (latex.trim()) {
      updateAttributes({ latex: latex.trim() });
      setIsEditing(false);
    } else {
      deleteNode();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (node.attrs.latex) {
        setLatex(node.attrs.latex);
        setIsEditing(false);
      } else {
        deleteNode();
      }
    }
  };

  if (isEditing) {
    return (
      <NodeViewWrapper
        className={`math-node-wrapper ${display === 'block' ? 'math-block' : 'math-inline'}`}
        data-editing="true"
      >
        <div className="math-editor">
          <input
            ref={inputRef}
            type="text"
            value={latex}
            onChange={(e) => setLatex(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            placeholder="Enter LaTeX equation..."
            className="math-input"
          />
          <div className="math-hint">
            Press Enter to save, Esc to cancel
          </div>
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper
      className={`math-node-wrapper ${display === 'block' ? 'math-block' : 'math-inline'}`}
      onClick={() => setIsEditing(true)}
      data-display={display}
    >
      <div
        ref={mathRef}
        className={`math-content ${error ? 'math-error' : ''}`}
        title={error || 'Click to edit'}
      />
      {error && <div className="math-error-message">{error}</div>}
    </NodeViewWrapper>
  );
};
