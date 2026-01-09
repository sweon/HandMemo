import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import 'katex/dist/katex.min.css';
import styled from 'styled-components';
import { fabric } from 'fabric';

const MarkdownContainer = styled.div<{ $tableHeaderBg?: string }>`
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text};

  h1, h2, h3, h4, h5, h6 {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    font-weight: 600;
  }

  p {
    margin-bottom: 1em;
  }

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  blockquote {
    border-left: 4px solid ${({ theme }) => theme.colors.border};
    padding-left: 1rem;
    margin-left: 0;
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  code {
    background: ${({ theme }) => theme.colors.surface};
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
    font-size: 0.9em;
  }

  pre {
    background: ${({ theme }) => theme.colors.surface};
    padding: 1rem;
    border-radius: 6px;
    overflow-x: auto;
    
    code {
      background: transparent;
      padding: 0;
      color: inherit;
      font-size: 1em;
    }
  }

  ul, ol {
    padding-left: 1.5em;
  }

  img {
    max-width: 100%;
    border-radius: 6px;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 1em;
    
    th, td {
      border: 1px solid ${({ theme }) => theme.colors.border};
      padding: 0.5rem;
      text-align: left;
    }

    th {
      background: ${({ theme, $tableHeaderBg }) => $tableHeaderBg || theme.colors.surface};
      font-weight: 600;
    }
  }

  /* Katex adjustments if needed */
  }
`;


const FabricPreview = ({ json }: { json: string }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = new fabric.StaticCanvas(canvasRef.current);

    try {
      const data = JSON.parse(json);
      canvas.loadFromJSON(data, () => {
        const originalWidth = data.width || 800;
        const originalHeight = data.height || 600;

        const resizeCanvas = () => {
          if (!containerRef.current) return;
          // Force full width of container minus potentially borders/padding
          const containerWidth = containerRef.current.getBoundingClientRect().width;

          // Calculate scale to FIT the container if original is larger OR if we want it responsive
          // Usually on phone we always want it to take max width available if possible
          // But if original is small, maybe not stretch? Let's assume shrinking only for now to avoid pixelation
          // or maybe stretch to fit container if it's too small?
          // Safest: Scale DOWN if too big. Scale 1 if fits.
          // User complaint: "Right side cut off". Means scale was too BIG.
          // containerWidth might be reported larger than viewport initially or logic flaw?
          // Let's use `Math.min` carefully.

          const scale = containerWidth < originalWidth ? containerWidth / originalWidth : 1;

          canvas.setWidth(originalWidth * scale);
          canvas.setHeight(originalHeight * scale);
          canvas.setZoom(scale);
          canvas.renderAll();
        };

        // Initial sizing
        resizeCanvas();

        // Responsive resizing
        window.addEventListener('resize', resizeCanvas);

        // Cleanup listener on dispose (but we dispose canvas completely below)
        // We need to attach listener cleanup to the effect cleanup
        (canvas as any).__resizeListener = resizeCanvas;
      });
    } catch (e) {
      console.error('Fabric load error:', e);
    }

    return () => {
      if ((canvas as any).__resizeListener) {
        window.removeEventListener('resize', (canvas as any).__resizeListener);
      }
      canvas.dispose();
    };
  }, [json]);

  return (
    <div ref={containerRef} style={{ width: '100%', overflow: 'hidden', margin: '1em 0', border: '1px solid #eee', borderRadius: '8px' }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export const MarkdownView: React.FC<{ content: string; tableHeaderBg?: string }> = ({ content, tableHeaderBg }) => {
  return (
    <MarkdownContainer $tableHeaderBg={tableHeaderBg}>
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ node, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            // Check if it's a fabric block
            if (!props.inline && match && match[1] === 'fabric') {
              return <FabricPreview json={String(children).replace(/\n$/, '')} />;
            }
            return <code className={className} {...props}>{children}</code>;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </MarkdownContainer>
  );
};
