import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import styled from 'styled-components';
import { fabric } from 'fabric';
import { FiX, FiCheck, FiTrash2, FiEdit2, FiRotateCcw, FiZap } from 'react-icons/fi';
import { useLanguage } from '../../contexts/LanguageContext';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  touch-action: none;
`;

const ModalContainer = styled.div`
  width: 95vw;
  height: 90vh;
  max-width: 1280px;
  max-height: 1000px;
  background: #ffffff; /* Always white canvas for consistency */
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
`;

const Header = styled.div`
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
  color: #333;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
`;

const Toolbar = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f1f3f5;
  border-bottom: 1px solid #e0e0e0;
  align-items: center;
  overflow-x: auto;
`;

const ToolButton = styled.button<{ $active?: boolean }>`
  background: ${({ $active }) => $active ? '#e9ecef' : 'transparent'};
  border: 1px solid ${({ $active }) => $active ? '#adb5bd' : 'transparent'};
  color: #333;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  
  &:hover {
    background: #e9ecef;
  }
`;

const ColorButton = styled.div<{ $color: string; $selected?: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
  border: 2px solid ${({ $selected }) => $selected ? '#333' : 'transparent'};
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  &:hover {
    transform: scale(1.1);
  }
`;

const Separator = styled.div`
  width: 1px;
  height: 24px;
  background: #dee2e6;
  margin: 0 0.5rem;
`;

const CanvasWrapper = styled.div`
  flex: 1;
  width: 100%;
  height: 100%;
  background: #ffffff;
  overflow: auto;
  position: relative;
  /* Touch action handling for mobile drawing */
  touch-action: none; 
`;

const FooterButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  background: ${({ $primary }) => ($primary ? '#333' : 'transparent')};
  color: ${({ $primary }) => ($primary ? 'white' : '#333')};
  border: 1px solid ${({ $primary }) => ($primary ? '#333' : '#ced4da')};

  &:hover {
    opacity: 0.9;
  }
`;

interface FabricCanvasModalProps {
    initialData?: string;
    onSave: (data: string) => void;
    onClose: () => void;
}

const COLORS = ['#000000', '#e03131', '#2f9e44', '#1971c2', '#f08c00', '#9c36b5'];
const BRUSH_SIZES = [2, 5, 10, 20];

export const FabricCanvasModal: React.FC<FabricCanvasModalProps> = ({ initialData, onSave, onClose }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
    const { t } = useLanguage();

    const [activeTool, setActiveTool] = useState<'pen' | 'eraser'>('pen');
    const [color, setColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(2);

    useLayoutEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        // Destroy existing if any
        if (fabricCanvasRef.current) {
            fabricCanvasRef.current.dispose();
        }

        // Measure container
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        // Initialize Fabric Canvas
        // Use low pixelRatio on very high res devices if needed, but lets try default first (auto retinascaling)
        // For safety on Android "Ultra", maybe we can limit cached rendering
        const canvas = new fabric.Canvas(canvasRef.current, {
            width,
            height,
            backgroundColor: '#ffffff',
            isDrawingMode: true,
            enableRetinaScaling: true // Default is true, good for quality. If memory issues, set false.
        });

        // Configure Brush
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.width = brushSize;
        canvas.freeDrawingBrush.color = color;

        fabricCanvasRef.current = canvas;

        // Load initial data
        if (initialData) {
            try {
                const json = JSON.parse(initialData);
                canvas.loadFromJSON(json, () => {
                    canvas.renderAll();
                    // Optional: handle scaling if canvas size differs from saved size
                    // For now, assume relative compatibility or just render
                });
            } catch (e) {
                console.error("Failed to load fabric JSON", e);
            }
        }

        return () => {
            canvas.dispose();
            fabricCanvasRef.current = null;
        };
    }, []);

    // Update brush settings when state changes
    useEffect(() => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        if (activeTool === 'pen') {
            canvas.isDrawingMode = true;
            canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
            canvas.freeDrawingBrush.color = color;
            canvas.freeDrawingBrush.width = brushSize;
        } else if (activeTool === 'eraser') {
            // Simple eraser: White pencil
            // A true eraser in Fabric requires 'destination-out' compositing or custom brush
            // but 'white brush' is standard for whiteboards.
            canvas.isDrawingMode = true;
            canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
            canvas.freeDrawingBrush.color = '#ffffff';
            canvas.freeDrawingBrush.width = brushSize * 3; // Wider eraser
        }
    }, [activeTool, color, brushSize]);

    const handleClear = () => {
        if (!fabricCanvasRef.current) return;
        fabricCanvasRef.current.clear();
        fabricCanvasRef.current.setBackgroundColor('#ffffff', () => {
            fabricCanvasRef.current?.renderAll();
        });
    };

    const handleUndo = () => {
        // Basic undo is hard in Fabric without a stack. 
        // Implementing a simple "remove last added object" for the MVP
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        // We can access canvas._objects or getObjects()
        const objects = canvas.getObjects();
        if (objects.length > 0) {
            canvas.remove(objects[objects.length - 1]);
        }
    };

    const handleSave = () => {
        if (!fabricCanvasRef.current) return;
        // Export to JSON
        const json = JSON.stringify(fabricCanvasRef.current.toJSON());
        onSave(json);
    };

    return (
        <ModalOverlay onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
        }}>
            <ModalContainer>
                <Header>
                    <Title>{t.drawing?.title || 'Drawing'}</Title>
                    <FooterButtons>
                        <ActionButton onClick={onClose}>
                            <FiX /> {t.drawing?.cancel || 'Cancel'}
                        </ActionButton>
                        <ActionButton $primary onClick={handleSave}>
                            <FiCheck /> {t.drawing?.insert || 'Insert'}
                        </ActionButton>
                    </FooterButtons>
                </Header>

                <Toolbar>
                    {/* Tools */}
                    <ToolButton $active={activeTool === 'pen'} onClick={() => setActiveTool('pen')}>
                        <FiEdit2 />
                    </ToolButton>
                    <ToolButton $active={activeTool === 'eraser'} onClick={() => setActiveTool('eraser')}>
                        <FiZap /> {/* Using Zap icon for eraser or similar */}
                    </ToolButton>

                    <Separator />

                    {/* Action */}
                    <ToolButton onClick={handleUndo} title="Undo Last Stroke">
                        <FiRotateCcw />
                    </ToolButton>
                    <ToolButton onClick={handleClear} title="Clear All">
                        <FiTrash2 />
                    </ToolButton>

                    <Separator />

                    {/* Colors */}
                    {COLORS.map(c => (
                        <ColorButton
                            key={c}
                            $color={c}
                            $selected={color === c && activeTool === 'pen'}
                            onClick={() => {
                                setColor(c);
                                setActiveTool('pen');
                            }}
                        />
                    ))}

                    <Separator />

                    {/* Sizes */}
                    {BRUSH_SIZES.map(s => (
                        <ToolButton
                            key={s}
                            $active={brushSize === s}
                            onClick={() => setBrushSize(s)}
                            style={{ width: 30, fontSize: '0.8rem' }}
                        >
                            <div style={{
                                width: s,
                                height: s,
                                borderRadius: '50%',
                                background: '#333'
                            }} />
                        </ToolButton>
                    ))}
                </Toolbar>

                <CanvasWrapper ref={containerRef}>
                    <canvas ref={canvasRef} />
                </CanvasWrapper>
            </ModalContainer>
        </ModalOverlay>
    );
};
