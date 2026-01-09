import React, { useState, useRef } from 'react';
import SimpleMDE from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css';
import { renderToStaticMarkup } from 'react-dom/server';
import styled from 'styled-components';
import { FabricCanvasModal } from './FabricCanvasModal';

// Custom styles for the editor to match theme
const EditorWrapper = styled.div`
  .EasyMDEContainer {
    .editor-toolbar {
      background: ${({ theme }) => theme.colors.surface};
      border-color: ${({ theme }) => theme.colors.border};
      i {
        color: ${({ theme }) => theme.colors.text};
      }
      button:hover {
        background: ${({ theme }) => theme.colors.border};
      }
      button.active {
        background: ${({ theme }) => theme.colors.border};
      }
    }
    
    .CodeMirror {
      background: ${({ theme }) => theme.colors.background};
      color: ${({ theme }) => theme.colors.text};
      border-color: ${({ theme }) => theme.colors.border};
    }
    
    .CodeMirror-cursor {
      border-left: 1px solid #d1d5db !important; /* Light gray cursor */
    }
    
    .editor-preview {
      background: ${({ theme }) => theme.colors.background};
      color: ${({ theme }) => theme.colors.text};
      
      /* Markdown Styles */
      blockquote {
        border-left-color: ${({ theme }) => theme.colors.border};
        color: ${({ theme }) => theme.colors.textSecondary};
      }
      a {
        color: ${({ theme }) => theme.colors.primary};
      }
      pre {
        background: ${({ theme }) => theme.colors.surface};
      }
      code {
        background: ${({ theme }) => theme.colors.surface};
      }
    }
    
    .editor-statusbar {
      color: ${({ theme }) => theme.colors.textSecondary};
    }
  }
`;

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ value, onChange }) => {
  const [isDrawingOpen, setIsDrawingOpen] = useState(false);
  const [initialDrawingData, setInitialDrawingData] = useState<string | undefined>(undefined);
  const cmRef = useRef<any>(null); // CodeMirror instance

  // Stable reference to the handler for the toolbar
  const handleDrawingRef = useRef<() => void>(() => { });

  const handleDrawing = () => {
    if (!cmRef.current) return;
    const cm = cmRef.current;
    const cursor = cm.getCursor();

    // Check if we are inside a fabric block to edit it
    // Simple logic: iterate lines around cursor
    let startLine = -1;
    let endLine = -1;

    // Look up for start
    for (let i = cursor.line; i >= 0; i--) {
      const text = cm.getLine(i);
      if (text.trim().startsWith('```fabric')) {
        startLine = i;
        break;
      }
      if (text.trim().startsWith('```') && i !== cursor.line) { // Hit another block end?
        // Only if we didn't start inside one. Rough heuristic.
        // Better: EasyMDE doesn't give AST easily. 
        // We'll assume if we find ```fabric above without ``` in between.
      }
    }

    // Look down for end
    if (startLine !== -1) {
      for (let i = cursor.line; i < cm.lineCount(); i++) {
        const text = cm.getLine(i);
        if (text.trim() === '```') {
          endLine = i;
          break;
        }
      }
    }

    if (startLine !== -1 && endLine !== -1 && cursor.line >= startLine && cursor.line <= endLine) {
      // Editing existing
      const lines = [];
      for (let i = startLine + 1; i < endLine; i++) {
        lines.push(cm.getLine(i));
      }
      let jsonStr = lines.join('\n').trim();
      // Remove trailing commas or weird formatting if any? no, it should be valid JSON
      if (jsonStr) {
        setInitialDrawingData(jsonStr);
      } else {
        setInitialDrawingData(undefined);
      }
    } else {
      // New Drawing
      setInitialDrawingData(undefined);
    }

    setIsDrawingOpen(true);
  };

  handleDrawingRef.current = handleDrawing;

  const handleSaveDrawing = (json: string) => {
    if (!cmRef.current) return;
    const cm = cmRef.current;
    const cursor = cm.getCursor();

    // If we were editing, replace the block.
    // Reuse the detection logic or store 'editRange' state?
    // Re-detection is safer as cursor might have moved if we didn't lock? 
    // Modal blocks interaction so cursor shouldn't move.

    let startLine = -1;
    let endLine = -1;
    // Look up for start
    for (let i = cursor.line; i >= 0; i--) {
      if (cm.getLine(i).trim().startsWith('```fabric')) {
        startLine = i;
        break;
      }
    }
    if (startLine !== -1) {
      for (let i = startLine + 1; i < cm.lineCount(); i++) {
        if (cm.getLine(i).trim() === '```') {
          endLine = i;
          break;
        }
      }
    }

    const newBlock = `\`\`\`fabric\n${json}\n\`\`\``;

    if (startLine !== -1 && endLine !== -1 && cursor.line >= startLine && cursor.line <= endLine) {
      // Replace existing
      cm.replaceRange(newBlock, { line: startLine, ch: 0 }, { line: endLine, ch: 3 });
    } else {
      // Insert new
      cm.replaceRange(`\n${newBlock}\n`, cursor);
    }

    setIsDrawingOpen(false);
    onChange(cm.getValue()); // Ensure sync
  };

  const customRenderer = (plainText: string) => {
    // Basic Custom Render to show placeholders for Fabric
    // We can't render canvas here easily in static markup string.

    // Replace ```fabric ... ``` with <div class="fabric-placeholder">Drawing</div>
    const processedText = plainText.replace(/```fabric\s*([\s\S]*?)\s*```/g, () => {
      return `<div style="background: #f0f0f0; border: 1px dashed #ccc; padding: 20px; text-align: center; border-radius: 8px; margin: 10px 0; color: #555;">
          🎨 Drawing Object<br/>
          <span style="font-size: 0.8em; color: #888;">(Click "Insert Drawing" toolbar button to edit)</span>
        </div>`;
    });

    return renderToStaticMarkup(
      <div style={{ padding: '10px' }}>
        <ReactMarkdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
        >
          {processedText}
        </ReactMarkdown>
      </div>
    );
  };

  const options = React.useMemo(() => ({
    spellChecker: false,
    placeholder: "Type here... (Markdown + Math supported)",
    previewRender: customRenderer,
    toolbar: [
      "bold", "italic", "heading", "|",
      "quote", "unordered-list", "ordered-list", "|",
      "link", "image", "|",
      // Custom Drawing Button
      {
        name: "drawing",
        action: () => handleDrawingRef.current(),
        className: "fa fa-pencil",
        title: "Insert/Edit Drawing",
      },
      "|",
      "preview", "side-by-side", "fullscreen", "|",
      "guide"
    ] as any,
    status: false,
    maxHeight: "500px",
  }), []);

  return (
    <>
      <EditorWrapper>
        <SimpleMDE
          value={value}
          onChange={onChange}
          options={options}
          getCodemirrorInstance={(cm) => { cmRef.current = cm; }}
        />
      </EditorWrapper>
      {isDrawingOpen && (
        <FabricCanvasModal
          initialData={initialDrawingData}
          onSave={handleSaveDrawing}
          onClose={() => setIsDrawingOpen(false)}
        />
      )}
    </>
  );
};
