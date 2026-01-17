import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import styled from 'styled-components';
import { fabric } from 'fabric';
import { FiX, FiCheck, FiMousePointer, FiMinus, FiSquare, FiCircle, FiTriangle, FiType, FiArrowDown, FiSettings, FiRotateCcw, FiRotateCw, FiDownload, FiTrash2, FiHelpCircle, FiEdit2 } from 'react-icons/fi';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { HexColorPicker } from 'react-colorful';
import { useLanguage } from '../../contexts/LanguageContext';
import { useExitGuard } from '../../contexts/ExitGuardContext';


// Pixel Eraser Icon - 3D pink block eraser
const PixelEraserIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 14L14 3L22 7L13 18L5 14Z" fill="#ffc9c9" />
        <path d="M5 14L5 19L13 23L13 18" fill="#fa5252" />
        <path d="M13 23L22 12L22 7" fill="#e03131" />
    </svg>
);

// Object Eraser Icon - 3D blue block eraser with indicator
const ObjectEraserIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 14L14 3L22 7L13 18L5 14Z" fill="#e7f5ff" />
        <path d="M5 14L5 19L13 23L13 18" fill="#339af0" />
        <path d="M13 23L22 12L22 7" fill="#1c7ed6" />
        <circle cx="13" cy="11" r="2.5" fill="#f03e3e" stroke="#f03e3e" strokeWidth="1" />
    </svg>
);

const EllipseIcon = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="12" rx="9" ry="5" />
    </svg>
);

const SprayBrushIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="16" cy="8" r="1" fill="currentColor" stroke="none" />
        <circle cx="8" cy="16" r="1" fill="currentColor" stroke="none" />
        <circle cx="17" cy="16" r="0.8" fill="currentColor" stroke="none" />
        <circle cx="7" cy="8" r="0.8" fill="currentColor" stroke="none" />
        <circle cx="12" cy="6" r="0.5" fill="currentColor" stroke="none" />
        <circle cx="12" cy="18" r="0.5" fill="currentColor" stroke="none" />
        <circle cx="6" cy="12" r="0.5" fill="currentColor" stroke="none" />
        <circle cx="18" cy="12" r="0.5" fill="currentColor" stroke="none" />
    </svg>
);

const CircleBrushIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="9" r="4" />
        <circle cx="15" cy="15" r="5" />
    </svg>
);

const HighlighterIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="16" width="16" height="4" rx="1" />
        <path d="M17 16L14 3H10L7 16" />
    </svg>
);

const GlowIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2V4M12 20V22M4 12H2M22 12H20M19.07 4.93L17.66 6.34M6.34 17.66L4.93 19.07M19.07 19.07L17.66 17.66M6.34 6.34L4.93 4.93" />
    </svg>
);

const DiamondIcon = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 12L12 22L22 12L12 2Z" />
    </svg>
);

const PentagonIcon = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 10L5 21H19L22 10L12 2Z" />
    </svg>
);

const HexagonIcon = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" />
    </svg>
);

const OctagonIcon = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 2L2 7V17L7 22H17L22 17V7L17 2H7Z" />
    </svg>
);

const StarIcon = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
);

const BackgroundIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="21" y2="15" />
        <line x1="9" y1="3" x2="9" y2="21" />
        <line x1="15" y1="3" x2="15" y2="21" />
    </svg>
);

const VerticalExpandIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 4v16" />
        <path d="M8 8l4-4 4 4" />
        <path d="M8 16l4 4 4-4" />
    </svg>
);

const PenIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19l7-7 3 3-7 7-3-3z" />
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        <path d="M2 2l5.5 5.5" />
    </svg>
);

const CarbonIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18.3 3a2.5 2.5 0 0 1 2.8 3.8l-2.4 2.9a12 12 0 0 1-5 2.5l-6-5a12 12 0 0 1 2.5-5z" fill="currentColor" opacity="0.2" />
        <path d="M12.5 7.5L5.5 14" strokeWidth="1.5" />
        <path d="M16 4.5L8.5 11.5" strokeWidth="1.5" />
        <path d="M13.7 12.2a12 12 0 0 1-5 2.5l-5 6 6-5a12 12 0 0 1 2.5-5" />
    </svg>
);
const HatchIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="7" y1="3" x2="3" y2="7" />
        <line x1="14" y1="3" x2="3" y2="14" />
        <line x1="21" y1="3" x2="3" y2="21" />
        <line x1="21" y1="10" x2="10" y2="21" />
        <line x1="21" y1="17" x2="17" y2="21" />
    </svg>
);

const PaletteIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13.5" cy="6.5" r=".5" />
        <circle cx="17.5" cy="10.5" r=".5" />
        <circle cx="8.5" cy="7.5" r=".5" />
        <circle cx="6.5" cy="12.5" r=".5" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.6-.7 1.6-1.6 0-.4-.2-.8-.5-1.1-.3-.3-.4-.7-.4-1.1 0-.9.7-1.6 1.6-1.6H17c2.8 0 5-2.2 5-5 0-5.3-4.5-9.7-10-9.7z" />
    </svg>
);
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
  width: 100vw;
  height: 100vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
`;


const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  padding: 1px 4px;
  background: #f1f3f5;
  border-bottom: 1px solid #e0e0e0;
  align-items: center;
`;

const ToolButton = styled.button<{ $active?: boolean; disabled?: boolean }>`
  background: ${({ $active }) => $active ? '#e9ecef' : 'transparent'};
  border: 1px solid ${({ $active }) => $active ? '#adb5bd' : 'transparent'};
  color: #333;
  padding: 2px;
  border-radius: 3px;
  cursor: ${({ disabled }) => disabled ? 'default' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  min-width: 22px;
  height: 22px;
  touch-action: manipulation;
  opacity: ${({ disabled }) => disabled ? 0.3 : 1};
  pointer-events: ${({ disabled }) => disabled ? 'none' : 'auto'};
  
  &:hover {
    background: ${({ disabled }) => disabled ? 'transparent' : '#e9ecef'};
  }
`;

const ToolGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1px;
  align-items: center;
`;

const ColorButton = styled.div<{ $color: string; $selected?: boolean }>`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
  border: 2px solid ${({ $selected }) => $selected ? '#333' : 'transparent'};
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  touch-action: manipulation;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const CanvasWrapper = styled.div<{ $bgColor?: string }>`
  flex: 1;
  width: 100%;
  height: 100%;
  background: ${({ $bgColor }) => $bgColor || '#ffffff'};
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  display: flex;
  justify-content: center;
  
  /* Fabric container */
  .canvas-container {
    margin: 0;
  }

  /* Default: larger screens */
  &::-webkit-scrollbar {
    width: 32px;
  }
  &::-webkit-scrollbar-thumb {
    border-radius: 16px;
  }

  @media (max-width: 1280px) {
    &::-webkit-scrollbar {
      width: 16px;
    }
    &::-webkit-scrollbar-thumb {
      border-radius: 8px;
    }
  }
`;


const CompactActionButton = styled.button<{ $primary?: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $primary }) => ($primary ? '#333' : '#ffffff')};
  color: ${({ $primary }) => ($primary ? '#ffffff' : '#333')};
  border: 1px solid ${({ $primary }) => ($primary ? '#333' : '#ced4da')};
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;

  &:hover {
    background: ${({ $primary }) => ($primary ? '#000000' : '#f8f9fa')};
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.9);
  }
`;

const DashPreview = styled.div<{ $dash: number[] | null }>`
  width: 100%;
  height: 2px;
  background: transparent;
  border-top: 2px ${({ $dash }) => $dash ? 'dashed' : 'solid'} #333;
  ${({ $dash }) => $dash && `border-image: repeating-linear-gradient(to right, #333, #333 ${$dash[0]}px, transparent ${$dash[0]}px, transparent ${$dash[0] + $dash[1]}px) 1;`}
  /* Simple fallback for complex dashes */
  ${({ $dash }) => $dash && $dash.length > 2 && `border-top: 2px dashed #333;`}
`;

const BrushSample = styled.div<{ $type: string; $color: string; $size?: number }>`
  height: ${({ $size }) => $size ? Math.max(2, Math.min(24, $size)) : 12}px;
  flex: 1;
  margin-left: 12px;
  border-radius: 2px;
  position: relative;
  background: ${({ $type, $color }) => {
        if ($type === 'pen') return $color;
        if ($type === 'highlighter') {
            if ($color.startsWith('#')) {
                const r = parseInt($color.slice(1, 3), 16);
                const g = parseInt($color.slice(3, 5), 16);
                const b = parseInt($color.slice(5, 7), 16);
                return `rgba(${r}, ${g}, ${b}, 0.3)`;
            }
            return $color.replace('rgb', 'rgba').replace(')', ', 0.3)');
        }
        if ($type === 'carbon') return `radial-gradient(${$color}, transparent)`;
        if ($type === 'hatch') return `repeating-linear-gradient(45deg, ${$color}, ${$color} 1px, transparent 1px, transparent 4px)`;
        return $color;
    }};

  ${({ $type, $color }) => $type === 'glow' && `
    box-shadow: 0 0 8px ${$color};
    border: 1px solid white;
  `}

  ${({ $type }) => $type === 'spray' && `
    background-size: 4px 4px;
  `}

  ${({ $type }) => $type === 'circle' && `
    background-size: 8px 8px;
  `}
`;

const DashOption = styled.button<{ $active: boolean }>`
  width: 100%;
  height: 24px;
  padding: 4px 8px;
  border: 1px solid ${({ $active }) => $active ? '#333' : '#e0e0e0'};
  background: ${({ $active }) => $active ? '#f1f3f5' : 'white'};
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  &:hover {
    background: #f8f9fa;
  }
`;

const Backdrop = styled.div<{ $centered?: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 10000;
  display: flex;
  align-items: ${({ $centered = true }) => $centered ? 'center' : 'flex-start'};
  justify-content: center;
`;

const CompactModal = styled.div<{ $anchor?: { top: number } }>`
  background: white;
  padding: 0.4rem;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 65px;

  ${({ $anchor }) => $anchor && `
    position: fixed;
    top: ${$anchor.top}px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10001;
  `}
`;

const CompactModalFooter = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: 0.25rem;
`;

const CompactModalButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid #dee2e6;
  background: ${({ $variant }) => $variant === 'primary' ? '#333' : 'white'};
  color: ${({ $variant }) => $variant === 'primary' ? 'white' : '#495057'};

  &:hover {
    background: ${({ $variant }) => $variant === 'primary' ? '#222' : '#f8f9fa'};
  }
`;

const ColorInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

const CustomRangeInput = styled.input<{ $size: number; $opacityValue?: number }>`
  appearance: none;
  width: 100%;
  margin: 0.2rem 0;
  cursor: pointer;
  background: transparent;

  &::-webkit-slider-runnable-track {
    width: 100%;
    height: ${({ $size }) => Math.min($size, 100)}px;
    background: ${({ $opacityValue }) => $opacityValue !== undefined ? 'linear-gradient(to right, #eee, #333)' : '#dee2e6'};
    border-radius: ${({ $size }) => Math.min($size, 100) / 2}px;
  }

  &::-webkit-slider-thumb {
    appearance: none;
    height: ${({ $size }) => Math.max(Math.min($size, 100) + 10, 24)}px;
    width: ${({ $size }) => Math.max(Math.min($size, 100) + 10, 24)}px;
    border-radius: 50%;
    background: #333;
    opacity: ${({ $opacityValue }) => $opacityValue !== undefined ? Math.max($opacityValue / 100, 0.1) : 1};
    cursor: pointer;
    margin-top: ${({ $size }) => (Math.min($size, 100) / 2) - (Math.max(Math.min($size, 100) + 10, 24) / 2)}px;
    border: 2px solid white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }

  &::-moz-range-track {
    width: 100%;
    height: ${({ $size }) => Math.min($size, 100)}px;
    background: ${({ $opacityValue }) => $opacityValue !== undefined ? 'linear-gradient(to right, #eee, #333)' : '#dee2e6'};
    border-radius: ${({ $size }) => Math.min($size, 100) / 2}px;
  }

  &::-moz-range-thumb {
    height: ${({ $size }) => Math.max(Math.min($size, 100) + 10, 24)}px;
    width: ${({ $size }) => Math.max(Math.min($size, 100) + 10, 24)}px;
    border-radius: 50%;
    background: #333;
    opacity: ${({ $opacityValue }) => $opacityValue !== undefined ? Math.max($opacityValue / 100, 0.1) : 1};
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }

  &:focus {
    outline: none;
  }
`;

const CustomNumberInput = styled.input`
  width: 60px;
  padding: 0.2rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
  text-align: center;
  outline: none;

  &:focus {
    border-color: #333;
  }
`;

interface FabricCanvasModalProps {
    initialData?: string;
    onSave: (data: string) => void;
    onClose: () => void;
}

const INITIAL_PALETTES: string[][] = [
    ['#000000', '#e03131', '#2f9e44', '#1971c2', '#f08c00', '#F9DE4B'], // 1. Default
    ['#000000', '#0000FF', '#FF0000', '#008000', '#808080', '#FFA500'], // 2. Classic Office
    ['#5d5d5d', '#ff9aa2', '#ffb7b2', '#ffdac1', '#e2f0cb', '#b5ead7'], // 3. Soft/Pastel
    ['#001219', '#005f73', '#0a9396', '#94d2bd', '#e9d8a6', '#ee9b00'], // 4. Deep Marine
    ['#370617', '#9d0208', '#d00000', '#dc2f02', '#e85d04', '#f48c06'], // 5. Sunset
    ['#004b23', '#007200', '#008000', '#38b000', '#70e000', '#9ef01a'], // 6. Forest
    ['#240046', '#5a189a', '#9d4edd', '#ff006e', '#fb5607', '#ffbe0b'], // 7. Lavender/Violet
    ['#230f0d', '#3d1b19', '#5e2c28', '#893f39', '#b1584d', '#d28476'], // 8. Coffee/Brown
    ['#000000', '#212529', '#343a40', '#495057', '#6c757d', '#adb5bd'], // 9. Monochrome
    ['#ccff00', '#ffcf00', '#ff0099', '#6e00ff', '#00eaff', '#00ff00'], // 10. Highlighter Tint
];
const INITIAL_BRUSH_SIZES = [1, 2, 4, 8, 16];
const DASH_OPTIONS: (number[] | undefined)[] = [
    undefined,
    [5, 5],
    [10, 5],
    [2, 2],
    [15, 5, 5, 5],
    [20, 10],
    [5, 10]
];
const ENGLISH_FONTS = ['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Impact', 'Comic Sans MS'];
const KOREAN_FONTS = ['Noto Sans KR', 'Nanum Gothic', 'Nanum Myeongjo', 'Malgun Gothic', 'Apple SD Gothic Neo'];
const INITIAL_SHAPE_OPACITY = 100;
const INITIAL_SHAPE_DASH = 0; // Index in DASH_OPTIONS

type ShapeStyle = {
    dashArray: number[] | undefined;
    opacity: number;
    headSize?: number;
    stroke?: string;
    strokeWidth?: number;
};

const DEFAULT_SHAPE_STYLE: ShapeStyle = {
    dashArray: DASH_OPTIONS[INITIAL_SHAPE_DASH],
    opacity: INITIAL_SHAPE_OPACITY,
    headSize: 20,
    stroke: '#000000',
    strokeWidth: 2
};

// Helper to get icon for config item
const getToolbarItemIcon = (item: ToolbarItem, colors: string[], brushSizes: number[]) => {
    if (item.type === 'tool') {
        switch (item.toolId) {
            case 'select': return <FiMousePointer size={16} />;
            case 'pen': return <PenIcon />;
            case 'line': return <FiMinus size={16} style={{ transform: 'rotate(-45deg)' }} />;
            case 'arrow': return <FiArrowDown size={16} style={{ transform: 'rotate(-135deg)' }} />;
            case 'rect': return <FiSquare size={16} />;
            case 'circle': return <FiCircle size={16} />;
            case 'ellipse': return <EllipseIcon />;
            case 'triangle': return <FiTriangle size={16} />;
            case 'diamond': return <DiamondIcon />;
            case 'pentagon': return <PentagonIcon />;
            case 'hexagon': return <HexagonIcon />;
            case 'octagon': return <OctagonIcon />;
            case 'star': return <StarIcon />;
            case 'text': return <FiType size={16} />;
            case 'eraser_pixel': return <PixelEraserIcon />;
            case 'eraser_object': return <ObjectEraserIcon />;
            default: return <span>{item.toolId}</span>;
        }
    } else if (item.type === 'action') {
        switch (item.actionId) {
            case 'undo': return <FiRotateCcw size={16} />;
            case 'redo': return <FiRotateCw size={16} />;
            case 'download_png': return <FiDownload size={16} />;
            case 'clear': return <FiTrash2 size={16} />;
            case 'extend_height': return <VerticalExpandIcon />;
            case 'background': return <BackgroundIcon />;
            case 'palette': return <PaletteIcon />;
            default: return <span>{item.actionId}</span>;
        }
    } else if (item.type === 'color' && item.colorIndex !== undefined) {
        return (
            <ColorButton $color={colors[item.colorIndex] || '#000'} style={{ width: 14, height: 14, cursor: 'grab' }} />
        );
    } else if (item.type === 'size' && item.sizeIndex !== undefined) {
        const size = brushSizes[item.sizeIndex] || 2;
        return (
            <div style={{
                width: Math.min(size, 20),
                height: Math.min(size, 20),
                borderRadius: '50%',
                background: '#333'
            }} />
        );
    }
    return <span>?</span>;
};

type ToolbarItem = {
    id: string;
    type: 'tool' | 'action' | 'color' | 'size';
    toolId?: ToolType;
    actionId?: string;
    colorIndex?: number;
    sizeIndex?: number;
};

const INITIAL_TOOLBAR_ITEMS: ToolbarItem[] = [
    { id: 'select', type: 'tool', toolId: 'select' },
    { id: 'pen_1', type: 'tool', toolId: 'pen' },
    { id: 'pen_2', type: 'tool', toolId: 'pen' },
    { id: 'pen_3', type: 'tool', toolId: 'pen' },
    { id: 'line', type: 'tool', toolId: 'line' },
    { id: 'arrow_v2', type: 'tool', toolId: 'arrow' },
    { id: 'rect', type: 'tool', toolId: 'rect' },
    { id: 'ellipse', type: 'tool', toolId: 'ellipse' },
    { id: 'triangle', type: 'tool', toolId: 'triangle' },
    { id: 'text', type: 'tool', toolId: 'text' },
    { id: 'eraser_pixel', type: 'tool', toolId: 'eraser_pixel' },
    { id: 'eraser_object', type: 'tool', toolId: 'eraser_object' },
    { id: 'undo', type: 'action', actionId: 'undo' },
    { id: 'redo', type: 'action', actionId: 'redo' },
    { id: 'download_png', type: 'action', actionId: 'download_png' },
    { id: 'clear', type: 'action', actionId: 'clear' },
    { id: 'extend_height', type: 'action', actionId: 'extend_height' },
    { id: 'background', type: 'action', actionId: 'background' },
    { id: 'color-0', type: 'color', colorIndex: 0 },
    { id: 'color-1', type: 'color', colorIndex: 1 },
    { id: 'color-2', type: 'color', colorIndex: 2 },
    { id: 'color-3', type: 'color', colorIndex: 3 },
    { id: 'color-4', type: 'color', colorIndex: 4 },
    { id: 'color-5', type: 'color', colorIndex: 5 },
    { id: 'palette', type: 'action', actionId: 'palette' },
    { id: 'size-0', type: 'size', sizeIndex: 0 },
    { id: 'size-1', type: 'size', sizeIndex: 1 },
    { id: 'size-2', type: 'size', sizeIndex: 2 },
    { id: 'size-3', type: 'size', sizeIndex: 3 },
    { id: 'size-4', type: 'size', sizeIndex: 4 },
];

type ToolType = 'select' | 'pen' | 'eraser_pixel' | 'eraser_object' | 'line' | 'arrow' | 'rect' | 'circle' | 'text' | 'triangle' | 'ellipse' | 'diamond' | 'pentagon' | 'hexagon' | 'octagon' | 'star';
type BackgroundType = 'none' | 'lines' | 'grid' | 'dots';

const createBackgroundPattern = (type: BackgroundType, paperColor: string, opacity: number, patternSize: number, transparent: boolean = false) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return new fabric.Pattern({
            source: document.createElement('canvas') as any,
            repeat: 'repeat'
        });
    }

    const size = patternSize;
    canvas.width = size;
    canvas.height = size;

    if (!transparent) {
        // Fill background
        ctx.fillStyle = paperColor;
        ctx.fillRect(0, 0, size, size);
    }

    if (type === 'none') {
        return new fabric.Pattern({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            source: canvas as any,
            repeat: 'repeat'
        });
    }

    // Draw lines
    ctx.strokeStyle = `rgba(0, 0, 0, ${opacity})`;
    ctx.lineWidth = 1;

    if (type === 'lines') {
        ctx.beginPath();
        ctx.moveTo(0, size - 0.5);
        ctx.lineTo(size, size - 0.5);
        ctx.stroke();
    } else if (type === 'grid') {
        ctx.beginPath();
        ctx.moveTo(0, size - 0.5);
        ctx.lineTo(size, size - 0.5);
        ctx.moveTo(size - 0.5, 0);
        ctx.lineTo(size - 0.5, size);
        ctx.stroke();
    } else if (type === 'dots') {
        ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
        ctx.beginPath();
        ctx.arc(size - 0.5, size - 0.5, 1, 0, Math.PI * 2);
        ctx.fill();
    }

    const pattern = new fabric.Pattern({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        source: canvas as any,
        repeat: 'repeat'
    });

    return pattern;
};

const BackgroundOptionButton = styled.button<{ $active: boolean }>`
  padding: 6px 8px;
  font-size: 11px;
  text-align: left;
  background: ${({ $active }) => $active ? '#e9ecef' : 'transparent'};
  border: none;
  cursor: pointer;
  border-radius: 4px;
  width: 100%;
  
  &:hover {
    background: #f1f3f5;
  }
`;


const ConfigItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  margin: 2px;
  cursor: grab;
  color: #333; /* Ensure icon color is dark */
  /* Visual box removed for cleaner look on small screens */
`;

const ConfigArea = styled.div<{ $isDraggingOver: boolean }>`
  background: ${({ $isDraggingOver }) => $isDraggingOver ? '#f1f3f5' : '#f8f9fa'};
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  padding: 12px;
  min-height: 80px;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 4px;
  transition: background-color 0.2s;
`;

interface ToolbarConfiguratorProps {
    currentItems: ToolbarItem[];
    allItems: ToolbarItem[];
    colors: string[];
    brushSizes: number[];
    onSave: (items: ToolbarItem[]) => void;
    onClose: () => void;
}

const ToolbarConfigurator: React.FC<ToolbarConfiguratorProps> = ({ currentItems, allItems, onSave, onClose, colors, brushSizes }) => {
    const { t } = useLanguage();
    const [activeItems, setActiveItems] = useState<ToolbarItem[]>(currentItems);
    const [reservoirItems, setReservoirItems] = useState<ToolbarItem[]>(() => {
        return allItems.filter(item => !currentItems.some(curr => curr.id === item.id));
    });

    const onDragEnd = (result: DropResult) => {
        const { source, destination } = result;

        if (!destination) return;

        if (source.droppableId === destination.droppableId) {
            // Reordering
            const list = source.droppableId === 'active' ? activeItems : reservoirItems;
            const setList = source.droppableId === 'active' ? setActiveItems : setReservoirItems;

            const newList = Array.from(list);
            const [removed] = newList.splice(source.index, 1);
            newList.splice(destination.index, 0, removed);

            setList(newList);
        } else {
            // Moving between lists
            const sourceList = source.droppableId === 'active' ? activeItems : reservoirItems;
            const destList = destination.droppableId === 'active' ? activeItems : reservoirItems;
            const setSource = source.droppableId === 'active' ? setActiveItems : setReservoirItems;
            const setDest = destination.droppableId === 'active' ? setActiveItems : setReservoirItems;

            const newSource = Array.from(sourceList);
            const newDest = Array.from(destList);
            const [removed] = newSource.splice(source.index, 1);
            newDest.splice(destination.index, 0, removed);

            setSource(newSource);
            setDest(newDest);
        }
    };

    return (
        <ModalOverlay style={{ zIndex: 11000 }}>
            <ModalContainer style={{ width: '90vw', height: '80vh', maxWidth: '800px', maxHeight: '700px', overflow: 'hidden' }}>
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0 }}>{t.drawing?.customize_title || 'Customize Toolbar'}</h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <CompactModalButton
                                onClick={() => {
                                    setActiveItems(allItems);
                                    setReservoirItems([]);
                                }}
                                style={{ marginRight: 'auto' }}
                            >
                                {t.drawing?.reset_defaults || 'Reset to Default'}
                            </CompactModalButton>
                            <CompactModalButton onClick={onClose}>{t.drawing?.cancel || 'Cancel'}</CompactModalButton>
                            <CompactModalButton $variant="primary" onClick={() => onSave(activeItems)}>{t.drawing?.save_apply || 'Save & Apply'}</CompactModalButton>
                        </div>
                    </div>

                    <DragDropContext onDragEnd={onDragEnd}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
                            <div>
                                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#666' }}>{t.drawing?.active_toolbar || 'Active Toolbar'}</h4>
                                <Droppable droppableId="active" direction="horizontal">
                                    {(provided, snapshot) => (
                                        <ConfigArea
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            $isDraggingOver={snapshot.isDraggingOver}
                                            style={{
                                                minHeight: '66px',
                                                flexWrap: 'nowrap',
                                                overflowX: 'auto',
                                                alignItems: 'center',
                                                padding: '8px'
                                            }}
                                        >
                                            {activeItems.map((item, index) => (
                                                <Draggable key={item.id} draggableId={item.id} index={index}>
                                                    {(provided) => (
                                                        <ConfigItem
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                        >
                                                            {getToolbarItemIcon(item, colors, brushSizes)}
                                                        </ConfigItem>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </ConfigArea>
                                    )}
                                </Droppable>
                            </div>

                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#666' }}>{t.drawing?.available_tools || 'Available Tools'} ({t.drawing?.drag_to_remove || 'Drag here to remove'})</h4>
                                <Droppable droppableId="reservoir">
                                    {(provided, snapshot) => (
                                        <ConfigArea
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            $isDraggingOver={snapshot.isDraggingOver}
                                            style={{ flex: 1, alignContent: 'flex-start', overflowY: 'auto' }}
                                        >
                                            {reservoirItems.map((item, index) => (
                                                <Draggable key={item.id} draggableId={item.id} index={index}>
                                                    {(provided) => (
                                                        <ConfigItem
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                        >
                                                            {getToolbarItemIcon(item, colors, brushSizes)}
                                                        </ConfigItem>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </ConfigArea>
                                    )}
                                </Droppable>
                            </div>
                        </div>
                    </DragDropContext>
                </div>
            </ModalContainer>
        </ModalOverlay>
    );
};

export const FabricCanvasModal: React.FC<FabricCanvasModalProps> = ({ initialData, onSave, onClose: propsOnClose }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
    const { t, language } = useLanguage();

    // Guard State
    const { registerGuard, unregisterGuard } = useExitGuard();
    const isClosingRef = useRef(false);

    const handleActualClose = useRef(propsOnClose);
    handleActualClose.current = propsOnClose;

    const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);

    // Wrapper for onClose to handle history safe closing
    const onClose = () => {
        if (isClosingRef.current) {
            propsOnClose();
        } else {
            isClosingRef.current = true;
            window.history.back();
        }
    };

    useLayoutEffect(() => {
        // Push state to enable back button trapping, include isGuard to keep handler happy
        window.history.pushState({ fabricOpen: true, isGuard: true }, '');

        const guardId = 'fabric-canvas-guard-modal';
        registerGuard(guardId, () => {
            if (isClosingRef.current) {
                handleActualClose.current();
                return 'ALLOW' as any;
            }

            // Disable back button and show confirm
            setIsExitConfirmOpen(true);
            return 'PREVENT' as any;
        });

        // Direct popstate handler to ensure we intercept before AndroidExitHandler
        const handlePopState = (e: PopStateEvent) => {
            if (isClosingRef.current) return;

            // Re-push state to effectively cancel the back navigation
            e.preventDefault();
            window.history.pushState({ fabricOpen: true, isGuard: true }, '');

            // Show confirm
            setIsExitConfirmOpen(true);
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            unregisterGuard(guardId);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [registerGuard, unregisterGuard]);


    const [palettes, setPalettes] = useState<string[][]>(() => {
        const saved = localStorage.getItem('fabric_palettes');
        return saved ? JSON.parse(saved) : INITIAL_PALETTES;
    });
    const [activePaletteIndex, setActivePaletteIndex] = useState<number>(() => {
        const saved = localStorage.getItem('fabric_active_palette_index');
        return saved ? parseInt(saved) : 0;
    });

    const [availableColors, setAvailableColors] = useState<string[]>(() => {
        const savedColors = localStorage.getItem('fabric_colors');
        if (savedColors) return JSON.parse(savedColors);
        return palettes[activePaletteIndex] || INITIAL_PALETTES[0];
    });

    useEffect(() => {
        localStorage.setItem('fabric_palettes', JSON.stringify(palettes));
    }, [palettes]);

    useEffect(() => {
        localStorage.setItem('fabric_active_palette_index', activePaletteIndex.toString());
        // Sync current colors when palette changes
        const newColors = palettes[activePaletteIndex];
        setAvailableColors(newColors);
    }, [activePaletteIndex, palettes]);

    const [isPalettePickerOpen, setIsPalettePickerOpen] = useState(false);
    const [selectedPaletteIndex, setSelectedPaletteIndex] = useState(activePaletteIndex);
    const [editingPaletteIndex, setEditingPaletteIndex] = useState<number | null>(null);
    const [paletteTempColors, setPaletteTempColors] = useState<string[]>([]);
    const [paletteEditingColorIndex, setPaletteEditingColorIndex] = useState<number | null>(null);
    const [availableBrushSizes, setAvailableBrushSizes] = useState<number[]>(() => {
        const saved = localStorage.getItem('fabric_brush_sizes');
        return saved ? JSON.parse(saved) : INITIAL_BRUSH_SIZES;
    });
    const [toolbarItems, setToolbarItems] = useState<ToolbarItem[]>(() => {
        const saved = localStorage.getItem('fabric_toolbar_order');
        if (!saved) return INITIAL_TOOLBAR_ITEMS;

        let parsed: ToolbarItem[] = JSON.parse(saved);

        // Filter out any items that are no longer in INITIAL_TOOLBAR_ITEMS (migration)
        parsed = parsed.filter(p => INITIAL_TOOLBAR_ITEMS.some(i => i.id === p.id));

        // Check if all tools from INITIAL_TOOLBAR_ITEMS are present
        const missingItems = INITIAL_TOOLBAR_ITEMS.filter(initialItem =>
            !parsed.some(parsedItem => parsedItem.id === initialItem.id)
        );

        if (missingItems.length > 0) {
            // Insert missing items at their intended position
            const newItems = [...parsed];
            missingItems.forEach(item => {
                const intendedIndex = INITIAL_TOOLBAR_ITEMS.findIndex(i => i.id === item.id);
                newItems.splice(intendedIndex, 0, item);
            });
            return newItems;
        }
        return parsed;
    });
    const [activeTool, setActiveTool] = useState<ToolType>('pen');
    const [activeToolItemId, setActiveToolItemId] = useState<string | null>('pen_1');
    const activeToolRef = useRef(activeTool);
    useEffect(() => { activeToolRef.current = activeTool; }, [activeTool]);
    const [color, setColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(2);
    const savedBg = JSON.parse(localStorage.getItem('fabric_default_background_v2') || '{}');
    const [background, setBackground] = useState<BackgroundType>(savedBg.type || 'none');
    const [backgroundSize, setBackgroundSize] = useState(savedBg.size || 30);
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const [backgroundColorIntensity, setBackgroundColorIntensity] = useState(savedBg.intensity !== undefined ? savedBg.intensity : 0);
    const [backgroundColorType, setBackgroundColorType] = useState<'gray' | 'beige'>(savedBg.colorType || 'gray');
    const [lineOpacity, setLineOpacity] = useState(savedBg.opacity !== undefined ? savedBg.opacity : 0.1);
    const [isBgPickerOpen, setIsBgPickerOpen] = useState(false);
    const prevBackgroundStateRef = useRef<{ type: BackgroundType; color: string; opacity: number; size: number; intensity: number; colorType: 'gray' | 'beige' } | null>(null);


    const [isSizeEditOpen, setIsSizeEditOpen] = useState(false);
    const [tempSize, setTempSize] = useState(2);
    const [editingSizeIndex, setEditingSizeIndex] = useState<number | null>(null);

    const [penSlotSettings, setPenSlotSettings] = useState<Record<string, { brushType: string, color: string, size: number }>>(() => {
        const saved = localStorage.getItem('fabric_pen_slot_settings');
        return saved ? JSON.parse(saved) : {
            'pen_1': { brushType: 'pen', color: '#000000', size: 2 },
            'pen_2': { brushType: 'highlighter', color: '#ffeb3b', size: 10 },
            'pen_3': { brushType: 'pen', color: '#ff0000', size: 2 }
        };
    });
    const [activePenSlot, setActivePenSlot] = useState<string>('pen_1');

    // Save pen slot settings whenever they change
    useEffect(() => {
        localStorage.setItem('fabric_pen_slot_settings', JSON.stringify(penSlotSettings));
    }, [penSlotSettings]);

    const [shapeStyles, setShapeStyles] = useState<Record<string, ShapeStyle>>(() => {
        const saved = localStorage.getItem('fabric_shape_styles');
        return saved ? JSON.parse(saved) : {};
    });
    const [isShapeSettingsOpen, setIsShapeSettingsOpen] = useState(false);
    const [tempDashIndex, setTempDashIndex] = useState(0);
    const [tempShapeOpacity, setTempShapeOpacity] = useState(100);
    const [tempHeadSize, setTempHeadSize] = useState(20);
    const [editingShapeItemId, setEditingShapeItemId] = useState<string | null>(null);

    const [fontFamily, setFontFamily] = useState(() => localStorage.getItem('fabric_font_family') || 'Arial');
    const [fontWeight, setFontWeight] = useState<string | number>(() => {
        const s = localStorage.getItem('fabric_font_weight');
        return (s && !isNaN(Number(s))) ? Number(s) : (s || 'normal');
    });
    const [fontStyle, setFontStyle] = useState<'normal' | 'italic'>(() => (localStorage.getItem('fabric_font_style') as any) || 'normal');

    const [isFontEditOpen, setIsFontEditOpen] = useState(false);
    const [tempFontFamily, setTempFontFamily] = useState(fontFamily);
    const [tempFontWeight, setTempFontWeight] = useState(fontWeight);
    const [tempFontStyle, setTempFontStyle] = useState(fontStyle);

    const availableFonts = React.useMemo(() => {
        return language === 'ko' ? [...KOREAN_FONTS, ...ENGLISH_FONTS] : ENGLISH_FONTS;
    }, [language]);

    // Save customized settings
    useEffect(() => {
        localStorage.setItem('fabric_font_family', fontFamily);
        localStorage.setItem('fabric_font_weight', String(fontWeight));
        localStorage.setItem('fabric_font_style', fontStyle);
    }, [fontFamily, fontWeight, fontStyle]);

    // Save customized settings
    useEffect(() => {
        localStorage.setItem('fabric_colors', JSON.stringify(availableColors));
    }, [availableColors]);

    useEffect(() => {
        localStorage.setItem('fabric_brush_sizes', JSON.stringify(availableBrushSizes));
    }, [availableBrushSizes]);

    useEffect(() => {
        localStorage.setItem('fabric_toolbar_order', JSON.stringify(toolbarItems));
    }, [toolbarItems]);

    useEffect(() => {
        localStorage.setItem('fabric_shape_styles', JSON.stringify(shapeStyles));
    }, [shapeStyles]);

    const [brushType, setBrushType] = useState<'pen' | 'highlighter' | 'glow' | 'spray' | 'circle' | 'carbon' | 'hatch'>(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (localStorage.getItem('fabric_brush_type') as any) || 'pen';
    });
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [tempBrushType, setTempBrushType] = useState(brushType);
    const [palmRejection, setPalmRejection] = useState(() => {
        return localStorage.getItem('fabric_palm_rejection') === 'true';
    });
    const palmRejectionRef = useRef(palmRejection);
    useEffect(() => {
        palmRejectionRef.current = palmRejection;
        localStorage.setItem('fabric_palm_rejection', palmRejection ? 'true' : 'false');
    }, [palmRejection]);

    const [tempPalmRejection, setTempPalmRejection] = useState(palmRejection);

    const [isPenEditOpen, setIsPenEditOpen] = useState(false);
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const lastInteractionTimeRef = useRef(0);



    useEffect(() => {
        localStorage.setItem('fabric_brush_type', brushType);
    }, [brushType]);

    // Tool Settings Persistence
    const getToolKey = (tool: ToolType, bType: string) => {
        if (tool === 'pen') return bType;
        return tool;
    };

    const [toolSettings, setToolSettings] = useState<Record<string, { color: string, size: number }>>(() => {
        const saved = localStorage.getItem('fabric_tool_settings');
        return saved ? JSON.parse(saved) : {};
    });

    useEffect(() => {
        localStorage.setItem('fabric_tool_settings', JSON.stringify(toolSettings));
    }, [toolSettings]);

    // Load settings when tool changes
    useEffect(() => {
        const isShape = ['line', 'arrow', 'rect', 'circle', 'ellipse', 'triangle', 'diamond', 'pentagon', 'hexagon', 'octagon', 'star', 'text'].includes(activeTool);

        if (isShape) {
            // Provide explicit defaults for shapes to prevent inheriting previous tool's color
            // If we have saved styles, use them. If not, use DEFAULT_SHAPE_STYLE.
            const savedStyle = shapeStyles[activeTool];

            if (savedStyle) {
                // If saved style has color/width, use it. Otherwise fall back to defaults (NOT current state)
                const newColor = savedStyle.stroke || '#000000';
                const newSize = savedStyle.strokeWidth || 2;

                setColor(newColor);
                setBrushSize(newSize);
                // We don't overwrite shapeStyles here. It's already saved or we use ephemeral defaults.
            } else {
                // No saved style for this shape yet. Use hard defaults.
                setColor('#000000');
                setBrushSize(2);
                // Should we save this default immediately? Maybe not, let user choose.
                // But we MUST NOT use current state.
            }
        } else {
            // For non-shape tools (pen, etc.), use existing logic
            const key = getToolKey(activeTool, brushType);
            const settings = toolSettings[key];

            if (settings) {
                // Load saved settings
                setColor(settings.color);
                setBrushSize(settings.size);
            } else {
                // Initialize defaults if not found
                // Special defaults for certain tools
                if (activeTool === 'pen' && brushType === 'highlighter') {
                    const defaultHighlighter = '#ffeb3b'; // Yellowish default for highlighter
                    const defaultSize = 16;
                    setColor(defaultHighlighter);
                    setBrushSize(defaultSize);
                    setToolSettings(prev => ({ ...prev, [key]: { color: defaultHighlighter, size: defaultSize } }));
                } else if (activeTool === 'pen') {
                    // For standard pen, try to match last used or default
                    // If no settings, maybe just keep current or set to black?
                    // Let's keep current behavior for pen to allow continuity if switching types
                    setToolSettings(prev => ({ ...prev, [key]: { color, size: brushSize } }));
                }
            }
        }
        // We only want to run this when tool/brushType changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTool, brushType]);

    // Helper to update persistent settings
    const updateToolSetting = React.useCallback((newColor?: string, newSize?: number, newType?: string) => {
        // Update general state
        if (newColor) setColor(newColor);
        if (newSize) setBrushSize(newSize);
        if (newType) setBrushType(newType as any);

        const currentTool = activeTool;
        const isShape = ['line', 'arrow', 'rect', 'circle', 'ellipse', 'triangle', 'diamond', 'pentagon', 'hexagon', 'octagon', 'star', 'text'].includes(currentTool);

        if (isShape) {
            // Update shape styles
            setShapeStyles(prev => ({
                ...prev,
                [currentTool]: {
                    ...(prev[currentTool] || DEFAULT_SHAPE_STYLE),
                    stroke: newColor !== undefined ? newColor : (prev[currentTool]?.stroke || color),
                    strokeWidth: newSize !== undefined ? newSize : (prev[currentTool]?.strokeWidth || brushSize)
                }
            }));
        } else {
            // Update tool settings (for pens, etc)
            const typeToUse = newType || brushType;
            const key = getToolKey(currentTool, typeToUse);

            setToolSettings(prev => ({
                ...prev,
                [key]: {
                    color: newColor !== undefined ? newColor : (prev[key]?.color || color),
                    size: newSize !== undefined ? newSize : (prev[key]?.size || brushSize)
                }
            }));

            // If currently using a pen slot, update its specific settings
            if (currentTool === 'pen' && activePenSlot) {
                setPenSlotSettings(prev => ({
                    ...prev,
                    [activePenSlot]: {
                        brushType: typeToUse,
                        color: newColor !== undefined ? newColor : (prev[activePenSlot]?.color || color),
                        size: newSize !== undefined ? newSize : (prev[activePenSlot]?.size || brushSize)
                    }
                }));
            }
        }
    }, [activeTool, brushType, color, brushSize, activePenSlot, getToolKey]);

    const handleToolSelect = React.useCallback((itemId: string, itemType: string, toolId?: ToolType) => {
        if (itemType === 'tool' && toolId) {
            setActiveToolItemId(itemId);
            if (toolId === 'pen') {
                const slotId = (itemId === 'pen' || itemId === 'pen_1') ? 'pen_1' : (itemId === 'pen_2' ? 'pen_2' : (itemId === 'pen_3' ? 'pen_3' : 'pen_1'));
                setActivePenSlot(slotId);
                const settings = penSlotSettings[slotId];
                if (settings) {
                    setBrushType(settings.brushType as any);
                    setColor(settings.color);
                    setBrushSize(settings.size);
                }
                setActiveTool('pen');
            } else {
                setActiveTool(toolId);
            }
        }
    }, [penSlotSettings, setActivePenSlot, setBrushType, setColor, setBrushSize, setActiveTool, setActiveToolItemId]);

    // Shape drawing refs
    const isDrawingRef = useRef(false);
    const startPointRef = useRef<{ x: number, y: number } | null>(null);
    const activeShapeRef = useRef<fabric.Object | null>(null);
    const arrowHeadPreviewRef = useRef<fabric.Polyline | null>(null);

    // History for undo/redo
    const historyRef = useRef<string[]>([]);
    const historyIndexRef = useRef(-1);
    const isUndoRedoRef = useRef(false); // Prevent saving during undo/redo

    const lastTapMapRef = useRef<{ [key: string]: number }>({});
    const openedTimeRef = useRef<number>(0);
    const [settingsAnchor, setSettingsAnchor] = useState<{ top: number } | null>(null);


    const handleDoubleTap = (e: React.TouchEvent, id: string, callback: (e: React.TouchEvent | React.MouseEvent) => void) => {
        const now = Date.now();
        const lastTap = lastTapMapRef.current[id] || 0;
        const diff = now - lastTap;
        if (diff > 0 && diff < 400) {
            if (e.cancelable) e.preventDefault();
            openedTimeRef.current = now; // Record open time for ghost click prevention
            callback(e);
            lastTapMapRef.current[id] = 0;
        } else {
            lastTapMapRef.current[id] = now;
        }
    };

    const handleBgCancel = () => {
        if (prevBackgroundStateRef.current) {
            setBackground(prevBackgroundStateRef.current.type);
            setBackgroundColor(prevBackgroundStateRef.current.color);
            setLineOpacity(prevBackgroundStateRef.current.opacity);
            setBackgroundSize(prevBackgroundStateRef.current.size);
            setBackgroundColorIntensity(prevBackgroundStateRef.current.intensity);
            setBackgroundColorType(prevBackgroundStateRef.current.colorType);
            setIsBgPickerOpen(false);
            setSettingsAnchor(null);
        }
    };

    const handleBgOk = () => {
        setIsBgPickerOpen(false);
        setSettingsAnchor(null);
    };

    const saveHistory = React.useCallback(() => {
        if (isUndoRedoRef.current) return;
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        const json = JSON.stringify(canvas.toJSON());

        // Remove any future history if we're not at the end
        if (historyIndexRef.current < historyRef.current.length - 1) {
            historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
        }

        historyRef.current.push(json);
        historyIndexRef.current = historyRef.current.length - 1;

        // Limit history size
        if (historyRef.current.length > 50) {
            historyRef.current.shift();
            historyIndexRef.current--;
        }

        setCanUndo(historyIndexRef.current > 0);
        setCanRedo(false);
    }, []);

    useLayoutEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        // Cleanup
        if (fabricCanvasRef.current) {
            fabricCanvasRef.current.dispose();
        }

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        const canvas = new fabric.Canvas(canvasRef.current, {
            width: width,
            height,
            backgroundColor: '#ffffff',
            isDrawingMode: true,
            selection: false,
        });

        // Set initial brush
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.width = brushSize;
        canvas.freeDrawingBrush.color = color;

        fabricCanvasRef.current = canvas;

        // Auto-resize canvas when container resizes (e.g. scrollbar appears)
        const resizeObserver = new ResizeObserver(() => {
            if (containerRef.current) {
                const newWidth = containerRef.current.clientWidth;
                const newHeight = containerRef.current.clientHeight;

                // Update if either dimension changed to ensure background fills container
                let changed = false;
                if (canvas.getWidth() !== newWidth) {
                    canvas.setWidth(newWidth);
                    changed = true;
                }

                // If container grew taller than canvas, match height.
                // But never shrink height to avoid hiding drawn content.
                if (canvas.getHeight() < newHeight) {
                    canvas.setHeight(newHeight);
                    changed = true;
                }

                if (changed) {
                    canvas.renderAll();
                }
            }
        });
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        // Palm Rejection Filter
        const filterPointer = (e: any) => {
            if (!palmRejectionRef.current) return;

            // 1. Check Pointer Properties
            const isPenPointer = e.pointerType === 'pen';

            // 2. Check Touch Properties (Stylus specific)
            let isStylusTouch = false;
            // Check both touches (active) and changedTouches (just ended)
            const touchesToCheck = e.touches && e.touches.length > 0 ? e.touches : e.changedTouches;

            if (touchesToCheck && touchesToCheck.length > 0) {
                const t = touchesToCheck[0];
                if ((t as any).touchType === 'stylus') isStylusTouch = true;

                // Heuristic: Check for Pressure/Force or Tilt (Hardware features of S-Pen)
                // Fingers on Android usually report force=0 or force=1. S-Pen reports variable force.
                const force = t.force || e.pressure || 0;
                // Allow if force is valid and "variable" (not just a binary 1 for a hard press)
                // Also check tilt if available (Touch events rarely have tilt, but Pointer events might)
                // Note: We check e.pressure for PointerEvents as well.
                if (force > 0 && force !== 1) isStylusTouch = true;
            }

            // 3. Check specific Pointer properties (Tilt/Pressure)
            const pressure = e.pressure || 0;
            const tilt = (e.tiltX || 0) !== 0 || (e.tiltY || 0) !== 0;

            // ALLOW if:
            // - It says it's a pen/stylus
            // - It has tilt (Fingers don't tilt)
            // - It has pressure sensitivity (typical of pens)
            if (isPenPointer || isStylusTouch || tilt || (pressure > 0 && pressure !== 0.5 && pressure !== 1)) {
                return; // PASS
            }

            // Otherwise, BLOCK (Finger/Mouse)
            if (e.cancelable && e.type !== 'pointerleave' && e.type !== 'pointercancel') {
                e.preventDefault();
            }
            e.stopImmediatePropagation();
            e.stopPropagation();
        };

        const upperCanvas = (canvas as any).upperCanvasEl;
        if (upperCanvas) {
            const opts = { capture: true, passive: false };
            upperCanvas.addEventListener('pointerdown', filterPointer, opts);
            upperCanvas.addEventListener('pointermove', filterPointer, opts);
            upperCanvas.addEventListener('touchstart', filterPointer, opts);
            upperCanvas.addEventListener('touchmove', filterPointer, opts);
        }

        // Save initial state to history
        setTimeout(() => saveHistory(), 100);

        // Listen for changes to save history
        canvas.on('object:added', saveHistory);
        canvas.on('object:modified', saveHistory);
        canvas.on('object:removed', saveHistory);

        canvas.on('path:created', (opt: any) => {
            if (activeToolRef.current === 'eraser_pixel') {
                opt.path.set({
                    isPixelEraser: true,
                    selectable: false,
                    evented: false,
                    strokeUniform: true
                });
            }
        });

        // Selection listeners to sync toolbar with selected object
        const handleSelection = (opt: fabric.IEvent) => {
            const activeObject = opt.target;
            if (activeObject) {
                // Determine color
                let objectColor = '';
                if (activeObject.type === 'i-text' || activeObject.type === 'text') {
                    objectColor = activeObject.fill as string;
                    // Sync font properties
                    const textObj = activeObject as fabric.IText;
                    if (textObj.fontFamily) setFontFamily(textObj.fontFamily);
                    if (textObj.fontWeight) setFontWeight(textObj.fontWeight as string | number);
                    if (textObj.fontStyle) setFontStyle(textObj.fontStyle as 'normal' | 'italic');
                } else {
                    objectColor = activeObject.stroke as string;
                }

                // Determine size
                const objectSize = activeObject.strokeWidth || brushSize;

                if (objectColor) setColor(objectColor);
                if (objectSize) setBrushSize(objectSize);

                // We don't updateToolSetting here to avoid overwriting tool defaults 
                // just by selecting an object. But we update the UI.
            }
        };

        canvas.on('selection:created', handleSelection);
        canvas.on('selection:updated', handleSelection);

        if (initialData) {
            try {
                const json = JSON.parse(initialData);
                if (json.height) {
                    canvas.setHeight(json.height);
                }
                canvas.loadFromJSON(json, () => {
                    canvas.renderAll();
                    saveHistory(); // Save loaded state
                });
            } catch (e) {
                console.error("Failed to load fabric JSON", e);
            }
        }

        return () => {
            if (upperCanvas) {
                upperCanvas.removeEventListener('pointerdown', filterPointer, true);
                upperCanvas.removeEventListener('pointermove', filterPointer, true);
                upperCanvas.removeEventListener('touchstart', filterPointer, true);
                upperCanvas.removeEventListener('touchmove', filterPointer, true);
            }
            resizeObserver.disconnect();
            canvas.off('object:added', saveHistory);
            canvas.off('object:modified', saveHistory);
            canvas.off('object:removed', saveHistory);
            canvas.off('selection:created', handleSelection);
            canvas.off('selection:updated', handleSelection);
            canvas.dispose();
            fabricCanvasRef.current = null;
        };
        // Removed unnecessary deps to only run once on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const handlePalettePickerClose = () => {
        setIsPalettePickerOpen(false);
        setEditingPaletteIndex(null);
        setPaletteEditingColorIndex(null);
    };

    const handlePaletteSelect = (index: number) => {
        setSelectedPaletteIndex(index);
        setEditingPaletteIndex(null);
    };

    const handlePaletteDoubleTap_Local = (index: number) => {
        setActivePaletteIndex(index);
        setSelectedPaletteIndex(index);
        handlePalettePickerClose();
    };

    const handlePaletteOk = () => {
        setActivePaletteIndex(selectedPaletteIndex);
        handlePalettePickerClose();
    };

    const handlePaletteEditStart = (e: React.MouseEvent, index: number) => {
        e.stopPropagation();
        setEditingPaletteIndex(index);
        setPaletteTempColors([...palettes[index]]);
        setPaletteEditingColorIndex(0); // Start editing the first color
        setSelectedPaletteIndex(index);
    };

    const handlePaletteEditSave = () => {
        if (editingPaletteIndex !== null) {
            const newPalettes = [...palettes];
            newPalettes[editingPaletteIndex] = [...paletteTempColors];
            setPalettes(newPalettes);
            setEditingPaletteIndex(null);
            setPaletteEditingColorIndex(null);
        }
    };

    const handlePaletteEditCancel = () => {
        setEditingPaletteIndex(null);
        setPaletteEditingColorIndex(null);
    };

    const handlePaletteReset = (index: number) => {
        const newPalettes = [...palettes];
        newPalettes[index] = [...INITIAL_PALETTES[index]];
        setPalettes(newPalettes);
        if (editingPaletteIndex === index) {
            setPaletteTempColors([...INITIAL_PALETTES[index]]);
        }
    };

    const handleBrushSizeDoubleClick = (e: React.MouseEvent | React.TouchEvent, index: number) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setSettingsAnchor({
            top: rect.bottom + 5
        });
        setEditingSizeIndex(index);
        setTempSize(availableBrushSizes[index]);
        openedTimeRef.current = Date.now();
        setIsSizeEditOpen(true);
    };

    const handleSizeOk = () => {
        setSettingsAnchor(null);
        if (editingSizeIndex !== null) {
            const newSizes = [...availableBrushSizes];
            newSizes[editingSizeIndex] = tempSize;
            setAvailableBrushSizes(newSizes);

            setBrushSize(tempSize);
            updateToolSetting(undefined, tempSize);

            setIsSizeEditOpen(false);
            setEditingSizeIndex(null);
            lastInteractionTimeRef.current = Date.now();
        }
    };

    const handleSizeReset = () => {
        if (editingSizeIndex !== null) {
            setTempSize(INITIAL_BRUSH_SIZES[editingSizeIndex]);
        }
    };

    const handleSizeCancel = () => {
        setSettingsAnchor(null);
        setIsSizeEditOpen(false);
        setEditingSizeIndex(null);
    };

    const handleShapeToolDoubleClick = (e: React.MouseEvent | React.TouchEvent, itemId: string, toolId: string) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setSettingsAnchor({
            top: rect.bottom + 5
        });
        setEditingShapeItemId(itemId);
        const style = shapeStyles[toolId] || DEFAULT_SHAPE_STYLE;
        const currentIndex = DASH_OPTIONS.findIndex(d => JSON.stringify(d) === JSON.stringify(style.dashArray));
        setTempDashIndex(currentIndex === -1 ? 0 : currentIndex);
        setTempShapeOpacity(style.opacity);
        setTempHeadSize(style.headSize || 20);
        setIsShapeSettingsOpen(true);
    };

    const handleShapeSettingsOk = () => {
        setSettingsAnchor(null);
        if (activeTool) {
            setShapeStyles(prev => ({
                ...prev,
                [activeTool]: {
                    dashArray: DASH_OPTIONS[tempDashIndex],
                    opacity: tempShapeOpacity,
                    headSize: tempHeadSize
                }
            }));

            // Update toolbar item icon if we were editing a specific slot
            if (editingShapeItemId) {
                setToolbarItems(prev => prev.map(item =>
                    item.id === editingShapeItemId
                        ? { ...item, toolId: activeTool as any }
                        : item
                ));
            }
        }
        setIsShapeSettingsOpen(false);
        setEditingShapeItemId(null);
    };

    const handleShapeSettingsReset = () => {
        setTempDashIndex(0);
        setTempShapeOpacity(100);
        setTempHeadSize(20);
    };

    const handleShapeSettingsCancel = () => {
        setSettingsAnchor(null);
        setIsShapeSettingsOpen(false);
        setEditingShapeItemId(null);
    };

    const handlePenDoubleClick = (e: React.MouseEvent | React.TouchEvent) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setSettingsAnchor({
            top: rect.bottom + 5
        });
        setTempBrushType(brushType);
        openedTimeRef.current = Date.now();
        setIsPenEditOpen(true);
    };

    /**
     * RGB Parsing Helpers
     */
    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    };

    const rgbToHex = (r: number, g: number, b: number) => {
        const toHex = (c: number) => {
            const hex = Math.max(0, Math.min(255, c)).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        return '#' + toHex(r) + toHex(g) + toHex(b);
    };

    const handlePenOk = () => {
        updateToolSetting(undefined, undefined, tempBrushType);
        setPalmRejection(tempPalmRejection);
        setSettingsAnchor(null);
        setIsPenEditOpen(false);
        lastInteractionTimeRef.current = Date.now();
    };

    const handlePenReset = () => {
        setTempBrushType('pen');
        setTempPalmRejection(false);
    };

    const handlePenCancel = () => {
        setSettingsAnchor(null);
        setIsPenEditOpen(false);
        setTempBrushType(brushType);
        setTempPalmRejection(palmRejection);
    };

    const handleFontCancel = () => {
        setSettingsAnchor(null);
        setIsFontEditOpen(false);
    };

    const handleTextDoubleClick = (e: React.MouseEvent | React.TouchEvent) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setSettingsAnchor({
            top: rect.bottom + 5
        });
        setTempFontFamily(fontFamily);
        setTempFontWeight(fontWeight);
        setTempFontStyle(fontStyle);
        openedTimeRef.current = Date.now();
        setIsFontEditOpen(true);
    };

    const handleFontOk = () => {
        setFontFamily(tempFontFamily);
        setFontWeight(tempFontWeight);
        setFontStyle(tempFontStyle);
        setSettingsAnchor(null);
        setIsFontEditOpen(false);
        lastInteractionTimeRef.current = Date.now();
    };


    const renderToolbarItem = (item: ToolbarItem) => {
        return (
            <div
                key={item.id}
                style={{
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                {item.type === 'tool' && (
                    <ToolButton
                        $active={activeToolItemId === item.id}
                        onClick={() => handleToolSelect(item.id, item.type, item.toolId!)}
                        onDoubleClick={(e) => {
                            if (item.toolId === 'pen') {
                                handlePenDoubleClick(e);
                            } else if (item.toolId === 'text') {
                                handleTextDoubleClick(e);
                            } else if (['line', 'arrow', 'rect', 'circle', 'ellipse', 'triangle', 'diamond', 'pentagon', 'hexagon', 'octagon', 'star'].includes(item.toolId!)) {
                                handleShapeToolDoubleClick(e, item.id, item.toolId!);
                            }
                        }}
                        onTouchStart={(e) => {
                            if (item.toolId === 'pen') {
                                handleDoubleTap(e, `tool - ${item.toolId} `, (ev) => handlePenDoubleClick(ev));
                            } else if (item.toolId === 'text') {
                                handleDoubleTap(e, `tool - ${item.toolId} `, (ev) => handleTextDoubleClick(ev));
                            } else if (['line', 'arrow', 'rect', 'circle', 'ellipse', 'triangle', 'diamond', 'pentagon', 'hexagon', 'octagon', 'star'].includes(item.toolId!)) {
                                handleDoubleTap(e, `tool - ${item.toolId} `, (ev) => handleShapeToolDoubleClick(ev, item.id, item.toolId!));
                            }
                        }}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        title={(t.drawing as any)?.[`tool_${item.toolId}`] || (item.toolId ?? '').charAt(0).toUpperCase() + (item.toolId ?? '').slice(1)}
                    >
                        {item.toolId === 'pen' ? (
                            (() => {
                                const slotId = (item.id === 'pen' || item.id === 'pen_1') ? 'pen_1' : (item.id === 'pen_2' ? 'pen_2' : (item.id === 'pen_3' ? 'pen_3' : 'pen_1'));
                                const settings = penSlotSettings[slotId];
                                const typeToCheck = settings ? settings.brushType : 'pen';

                                switch (typeToCheck) {
                                    case 'pen': return <PenIcon />;
                                    case 'carbon': return <CarbonIcon />;
                                    case 'hatch': return <HatchIcon />;
                                    case 'highlighter': return <HighlighterIcon />;
                                    case 'spray': return <SprayBrushIcon />;
                                    case 'circle': return <CircleBrushIcon />;
                                    case 'glow': return <GlowIcon />;
                                    default: return <PenIcon />;
                                }
                            })()
                        ) : (
                            <>
                                {item.toolId === 'select' && <FiMousePointer size={16} />}
                                {item.toolId === 'line' && <FiMinus size={16} style={{ transform: 'rotate(-45deg)' }} />}
                                {item.toolId === 'arrow' && <FiArrowDown size={16} style={{ transform: 'rotate(-135deg)' }} />}
                                {item.toolId === 'rect' && <FiSquare size={16} />}
                                {item.toolId === 'circle' && <FiCircle size={16} />}
                                {item.toolId === 'ellipse' && <EllipseIcon />}
                                {item.toolId === 'triangle' && <FiTriangle size={16} />}
                                {item.toolId === 'diamond' && <DiamondIcon />}
                                {item.toolId === 'pentagon' && <PentagonIcon />}
                                {item.toolId === 'hexagon' && <HexagonIcon />}
                                {item.toolId === 'octagon' && <OctagonIcon />}
                                {item.toolId === 'star' && <StarIcon />}
                                {item.toolId === 'text' && <FiType size={16} />}
                                {item.toolId === 'eraser_pixel' && <PixelEraserIcon />}
                                {item.toolId === 'eraser_object' && <ObjectEraserIcon />}
                            </>
                        )}
                    </ToolButton>
                )}

                {item.type === 'action' && (
                    <>
                        {item.actionId === 'undo' && (
                            <ToolButton onClick={handleUndo} title={`${t.drawing?.undo || 'Undo'} (Ctrl+Z)`} disabled={!canUndo}>
                                <FiRotateCcw size={16} />
                            </ToolButton>
                        )}
                        {item.actionId === 'redo' && (
                            <ToolButton onClick={handleRedo} title={`${t.drawing?.redo || 'Redo'} (Ctrl+Y)`} disabled={!canRedo}>
                                <FiRotateCw size={16} />
                            </ToolButton>
                        )}
                        {item.actionId === 'download_png' && (
                            <ToolButton onClick={handleDownloadPNG} title={t.drawing?.download || 'Download as PNG'}>
                                <FiDownload size={16} />
                            </ToolButton>
                        )}
                        {item.actionId === 'clear' && (
                            <ToolButton onClick={() => {
                                if (window.confirm(t.drawing?.clear_all_confirm || 'Clear all?')) {
                                    handleClear();
                                }
                            }} title={t.drawing?.clear_all || 'Clear All'}>
                                <FiTrash2 size={16} />
                            </ToolButton>
                        )}
                        {item.actionId === 'extend_height' && (
                            <ToolButton onClick={handleExtendHeight} title={t.drawing?.extend_height || 'Extend height'}>
                                <VerticalExpandIcon />
                            </ToolButton>
                        )}
                        {item.actionId === 'background' && (
                            <div style={{ position: 'relative', display: 'flex' }}>
                                <ToolButton
                                    $active={isBgPickerOpen}
                                    onClick={(e) => {
                                        if (!isBgPickerOpen) {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            setSettingsAnchor({ top: rect.bottom + 5 });
                                            prevBackgroundStateRef.current = {
                                                type: background,
                                                color: backgroundColor,
                                                opacity: lineOpacity,
                                                size: backgroundSize,
                                                intensity: backgroundColorIntensity,
                                                colorType: backgroundColorType
                                            };
                                            setIsBgPickerOpen(true);
                                            openedTimeRef.current = Date.now();
                                        } else {
                                            setIsBgPickerOpen(false);
                                            setSettingsAnchor(null);
                                        }
                                    }}
                                    title={t.drawing?.bg_settings || 'Background'}
                                >
                                    <BackgroundIcon />
                                </ToolButton>
                            </div>
                        )}
                    </>
                )}

                {item.type === "color" && (
                    <div style={{
                        padding: '0 4px',
                        display: 'flex',
                        alignItems: 'center',
                        height: '28px'
                    }}>
                        <ColorButton
                            $color={availableColors[item.colorIndex!]}
                            $selected={color === availableColors[item.colorIndex!] && !activeTool.startsWith('eraser')}
                            onClick={() => {
                                const c = availableColors[item.colorIndex!];
                                setColor(c);
                                updateToolSetting(c, undefined);
                                if (activeTool.startsWith('eraser')) {
                                    setActiveTool('pen');
                                }
                            }}
                            title={`${t.drawing?.select_color || 'Select Color'}: ${availableColors[item.colorIndex!]}`}
                        />
                    </div>
                )}

                {item.type === "size" && (
                    <ToolButton
                        $active={brushSize === availableBrushSizes[item.sizeIndex!]}
                        onClick={() => {
                            const s = availableBrushSizes[item.sizeIndex!];
                            setBrushSize(s);
                            updateToolSetting(undefined, s);
                        }}
                        onDoubleClick={(e) => handleBrushSizeDoubleClick(e, item.sizeIndex!)}
                        onTouchStart={(e) => handleDoubleTap(e, `size - ${item.sizeIndex} `, (ev) => handleBrushSizeDoubleClick(ev, item.sizeIndex!))}
                        style={{ width: 30, fontSize: '0.8rem', padding: 0 }}
                        title={`${t.drawing?.brush_size || 'Size'}: ${availableBrushSizes[item.sizeIndex!]}px`}
                    >
                        <div style={{
                            width: Math.min(availableBrushSizes[item.sizeIndex!], 20),
                            height: Math.min(availableBrushSizes[item.sizeIndex!], 20),
                            borderRadius: '50%',
                            background: '#333'
                        }} />
                    </ToolButton>
                )}

                {item.type === 'action' && item.actionId === 'palette' && (
                    <ToolButton
                        $active={isPalettePickerOpen}
                        onClick={() => setIsPalettePickerOpen(true)}
                        title={t.drawing?.select_palette || 'Select Palette'}
                    >
                        <PaletteIcon />
                    </ToolButton>
                )}
            </div >
        );
    };

    // Shape Drawing Handlers
    const handleShapeMouseDown = React.useCallback((opt: fabric.IEvent) => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        const pointer = canvas.getPointer(opt.e);
        isDrawingRef.current = true;
        startPointRef.current = { x: pointer.x, y: pointer.y };

        let shape: fabric.Object | null = null;
        const currentStyle = shapeStyles[activeTool] || DEFAULT_SHAPE_STYLE;
        const commonProps = {
            stroke: color,
            strokeWidth: brushSize,
            strokeDashArray: currentStyle.dashArray,
            opacity: currentStyle.opacity / 100,
            fill: 'transparent',
            left: pointer.x,
            top: pointer.y,
            selectable: false, // Initially false while drawing
            evented: false,
        };

        if (activeTool === 'line' || activeTool === 'arrow') {
            shape = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
                ...commonProps,
                strokeLineCap: 'round'
            });
            if (activeTool === 'arrow') {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (shape as any).hasArrow = true;
                // ArrowHead will be created on mouse up, not during preview
            }
        } else if (activeTool === 'rect') {
            shape = new fabric.Rect({
                ...commonProps,
                width: 0,
                height: 0,
            });
        } else if (activeTool === 'circle') {
            shape = new fabric.Circle({
                ...commonProps,
                radius: 0,
            });
        } else if (activeTool === 'triangle') {
            shape = new fabric.Triangle({
                ...commonProps,
                width: 0,
                height: 0,
            });
        } else if (activeTool === 'ellipse') {
            shape = new fabric.Ellipse({
                ...commonProps,
                rx: 0,
                ry: 0,
            });
        } else if (['diamond', 'pentagon', 'hexagon', 'octagon', 'star'].includes(activeTool)) {
            shape = new fabric.Polygon([
                new fabric.Point(0, 0),
                new fabric.Point(0, 0),
                new fabric.Point(0, 0),
                new fabric.Point(0, 0)
            ], {
                ...commonProps,
                originX: 'center',
                originY: 'center',
                isCustomPolygon: true,
                polyType: activeTool
            } as any);
        }

        if (shape) {
            activeShapeRef.current = shape;
            canvas.add(shape);
        }
    }, [activeTool, color, brushSize, shapeStyles]);

    const handleShapeMouseMove = React.useCallback((opt: fabric.IEvent) => {
        if (!isDrawingRef.current || !activeShapeRef.current || !startPointRef.current) return;
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        const pointer = canvas.getPointer(opt.e);
        const start = startPointRef.current;
        const shape = activeShapeRef.current;

        const left = Math.min(start.x, pointer.x);
        const top = Math.min(start.y, pointer.y);
        const width = Math.abs(pointer.x - start.x);
        const height = Math.abs(pointer.y - start.y);

        if (activeTool === 'line' || activeTool === 'arrow') {
            (shape as fabric.Line).set({ x2: pointer.x, y2: pointer.y });

            if (activeTool === 'arrow') {
                // Calculate arrow head points for final creation (not preview)
                const x2 = Math.round(pointer.x);
                const y2 = Math.round(pointer.y);
                const headAngle = Math.PI / 6;

                const start = startPointRef.current!;
                const angle = Math.atan2(y2 - Math.round(start.y), x2 - Math.round(start.x));
                const currentStyle = shapeStyles['arrow'] || DEFAULT_SHAPE_STYLE;
                const headLength = Math.round(currentStyle.headSize || Math.max(12, brushSize * 3));

                const x3 = Math.round(x2 - headLength * Math.cos(angle - headAngle));
                const y3 = Math.round(y2 - headLength * Math.sin(angle - headAngle));
                const x4 = Math.round(x2 - headLength * Math.cos(angle + headAngle));
                const y4 = Math.round(y2 - headLength * Math.sin(angle + headAngle));

                (shape as any).arrowHead = [new fabric.Point(x3, y3), new fabric.Point(x2, y2), new fabric.Point(x4, y4)];

                // Update the line part
                (shape as fabric.Line).set({ x2: x2, y2: y2 });
            }
        } else if (activeTool === 'rect') {
            shape.set({ left, top, width, height });
        } else if (activeTool === 'circle') {
            const radius = Math.max(width, height) / 2;
            const circleLeft = start.x + (pointer.x < start.x ? -radius * 2 : 0);
            const circleTop = start.y + (pointer.y < start.y ? -radius * 2 : 0);
            (shape as fabric.Circle).set({
                radius,
                left: circleLeft,
                top: circleTop
            });
        } else if (activeTool === 'triangle') {
            shape.set({ left, top, width, height });
        } else if (activeTool === 'ellipse') {
            (shape as fabric.Ellipse).set({
                rx: width / 2,
                ry: height / 2,
                left,
                top
            });
        } else if ((shape as any).isCustomPolygon) {
            const hw = width / 2;
            const hh = height / 2;
            const polyType = (shape as any).polyType;
            let points: fabric.Point[] = [];

            if (polyType === 'diamond') {
                points = [
                    new fabric.Point(0, -hh), // Top
                    new fabric.Point(hw, 0),   // Right
                    new fabric.Point(0, hh),  // Bottom
                    new fabric.Point(-hw, 0)   // Left
                ];
            } else if (polyType === 'pentagon') {
                for (let i = 0; i < 5; i++) {
                    const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
                    points.push(new fabric.Point(hw * Math.cos(angle), hh * Math.sin(angle)));
                }
            } else if (polyType === 'hexagon') {
                for (let i = 0; i < 6; i++) {
                    const angle = (i * 2 * Math.PI / 6) - Math.PI / 2;
                    points.push(new fabric.Point(hw * Math.cos(angle), hh * Math.sin(angle)));
                }
            } else if (polyType === 'octagon') {
                for (let i = 0; i < 8; i++) {
                    const angle = (i * 2 * Math.PI / 8) - Math.PI / 2;
                    points.push(new fabric.Point(hw * Math.cos(angle), hh * Math.sin(angle)));
                }
            } else if (polyType === 'star') {
                const outerRadiusX = hw;
                const outerRadiusY = hh;
                const innerRadiusX = hw * 0.4;
                const innerRadiusY = hh * 0.4;
                for (let i = 0; i < 10; i++) {
                    const angle = (i * Math.PI / 5) - Math.PI / 2;
                    const rx = i % 2 === 0 ? outerRadiusX : innerRadiusX;
                    const ry = i % 2 === 0 ? outerRadiusY : innerRadiusY;
                    points.push(new fabric.Point(rx * Math.cos(angle), ry * Math.sin(angle)));
                }
            }

            (shape as fabric.Polygon).set({
                points,
                left: left + hw,
                top: top + hh,
                width,
                height,
                pathOffset: new fabric.Point(0, 0)
            });
        }

        shape.setCoords();
        canvas.requestRenderAll();
    }, [activeTool]);

    const handleShapeMouseUp = React.useCallback(() => {
        isDrawingRef.current = false;
        if (activeShapeRef.current) {
            const shape = activeShapeRef.current;

            // If it's an arrow, we might want to convert it to a Path or Group for permanent storage
            if (activeTool === 'arrow' && (shape as fabric.Line).x1 !== undefined) {
                const line = shape as fabric.Line;
                const x1 = Math.round(line.x1!);
                const y1 = Math.round(line.y1!);
                const x2 = Math.round(line.x2!);
                const y2 = Math.round(line.y2!);

                const angle = Math.atan2(y2 - y1, x2 - x1);
                const currentStyle = shapeStyles[activeTool] || DEFAULT_SHAPE_STYLE;
                const headLength = Math.round(currentStyle.headSize || Math.max(12, brushSize * 3));
                const headAngle = Math.PI / 6;

                const x3 = Math.round(x2 - headLength * Math.cos(angle - headAngle));
                const y3 = Math.round(y2 - headLength * Math.sin(angle - headAngle));
                const x4 = Math.round(x2 - headLength * Math.cos(angle + headAngle));
                const y4 = Math.round(y2 - headLength * Math.sin(angle + headAngle));
                const canvas = fabricCanvasRef.current;

                if (canvas) {
                    canvas.remove(shape);

                    // Calculate minimal point to use as group origin for precision
                    const minX = Math.min(x1, x2, x3, x4);
                    const minY = Math.min(y1, y2, y3, y4);

                    // Line part (can be dashed)
                    const linePart = new fabric.Line([x1 - minX, y1 - minY, x2 - minX, y2 - minY], {
                        stroke: color,
                        strokeWidth: brushSize,
                        strokeDashArray: currentStyle.dashArray,
                        strokeLineCap: 'round',
                        originX: 'left',
                        originY: 'top',
                        left: x1 < x2 ? 0 : x1 - x2 // This is handled by Line, but let's be careful
                    });
                    // Re-set absolute positioning for Line based on the parent group's left/top
                    linePart.set({ left: Math.min(x1, x2) - minX, top: Math.min(y1, y2) - minY });

                    // Head part (always solid)
                    const headPart = new fabric.Polyline([
                        new fabric.Point(x3 - minX, y3 - minY),
                        new fabric.Point(x2 - minX, y2 - minY),
                        new fabric.Point(x4 - minX, y4 - minY)
                    ], {
                        stroke: color,
                        strokeWidth: brushSize,
                        strokeDashArray: undefined,
                        fill: 'transparent',
                        strokeLineCap: 'round',
                        strokeLineJoin: 'round',
                        originX: 'left',
                        originY: 'top',
                        left: Math.min(x2, x3, x4) - minX,
                        top: Math.min(y2, y3, y4) - minY
                    });

                    const arrowGroup = new fabric.Group([linePart, headPart], {
                        selectable: false,
                        evented: true,
                        isArrow: true,
                        opacity: (currentStyle.opacity || 100) / 100,
                        left: minX,
                        top: minY,
                        originX: 'left',
                        originY: 'top'
                    } as any);

                    canvas.add(arrowGroup);
                }
            }

            if (arrowHeadPreviewRef.current) {
                const canvas = fabricCanvasRef.current;
                if (canvas) canvas.remove(arrowHeadPreviewRef.current);
                arrowHeadPreviewRef.current = null;
            }

            activeShapeRef.current.setCoords();
            activeShapeRef.current = null;
        }
    }, [activeTool, color, brushSize, shapeStyles]);

    const handleClear = () => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        // Remove all objects but preserve background
        canvas.discardActiveObject();
        const objects = canvas.getObjects();
        canvas.remove(...objects);

        canvas.renderAll();
        saveHistory();
    };

    const handleDownloadPNG = async () => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        const timestamp = `${year}${month}${day}-${hours}${minutes}${seconds}`;
        const defaultBaseName = `drawing-${timestamp}`;

        // Get the data URL of the canvas
        const dataURL = canvas.toDataURL({
            format: 'png',
            quality: 1,
            enableRetinaScaling: true
        });

        // Try modern File System Access API first (supported in modern Chrome/Edge/Safari)
        if ('showSaveFilePicker' in window) {
            try {
                const handle = await (window as any).showSaveFilePicker({
                    suggestedName: `${defaultBaseName}.png`,
                    types: [{
                        description: 'PNG Image',
                        accept: { 'image/png': ['.png'] },
                    }],
                });

                // Fetch the dataURL and convert to blob for writing
                const response = await fetch(dataURL);
                const blob = await response.blob();

                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();
                return;
            } catch (err: any) {
                // If user cancels, just return
                if (err.name === 'AbortError') return;
                console.error('File system access error:', err);
                // Fallback to traditional method if picker failed for other reasons
            }
        }

        // Fallback for browsers that don't support showSaveFilePicker or if it failed
        const fileName = window.prompt(t.drawing?.enter_filename || 'Enter filename:', defaultBaseName);
        if (fileName === null) return; // User cancelled

        const finalFileName = fileName.trim() || defaultBaseName;

        const link = document.createElement('a');
        link.download = finalFileName.endsWith('.png') ? finalFileName : `${finalFileName}.png`;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleUndo = React.useCallback(() => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        if (historyIndexRef.current > 0) {
            isUndoRedoRef.current = true;
            historyIndexRef.current--;
            const json = historyRef.current[historyIndexRef.current];
            canvas.loadFromJSON(JSON.parse(json), () => {
                canvas.renderAll();
                isUndoRedoRef.current = false;
                setCanUndo(historyIndexRef.current > 0);
                setCanRedo(true);
            });
        }
    }, []);

    const handleRedo = React.useCallback(() => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        if (historyIndexRef.current < historyRef.current.length - 1) {
            isUndoRedoRef.current = true;
            historyIndexRef.current++;
            const json = historyRef.current[historyIndexRef.current];
            canvas.loadFromJSON(JSON.parse(json), () => {
                canvas.renderAll();
                isUndoRedoRef.current = false;
                setCanUndo(true);
                setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
            });
        }
    }, []);

    const handleExtendHeight = () => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        const currentHeight = canvas.getHeight();
        const newHeight = currentHeight + 400; // Add 400px

        canvas.setHeight(newHeight);

        // Re-apply background
        setBackgroundColor(backgroundColor);
        canvas.setBackgroundColor(backgroundColor, () => { });

        const gridPattern = createBackgroundPattern(background, backgroundColor, lineOpacity, backgroundSize, true);
        canvas.setOverlayColor(gridPattern as any, () => {
            // Sync existing eraser marks
            const eraserPattern = createBackgroundPattern(background, backgroundColor, lineOpacity, backgroundSize);
            canvas.getObjects().forEach(obj => {
                if ((obj as any).isPixelEraser) {
                    obj.set('stroke', eraserPattern as any);
                }
            });
            canvas.renderAll();
            saveHistory();
        });
    };

    // Auto-extend canvas height
    useEffect(() => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        const checkAndExtend = (obj: any) => {
            if (!obj || !obj.top || !obj.height) return;
            // Skip if undo/redo operation in progress
            if (isUndoRedoRef.current) return;

            const canvasHeight = canvas.getHeight();
            // Check if object bottom is in the bottom 25% area
            const objBottom = obj.top + (obj.height * (obj.scaleY || 1));

            if (objBottom > canvasHeight * 0.75) {
                // Debounce slightly to prevent double triggering? 
                // handleExtendHeight adds 400px instantly.
                handleExtendHeight();
            }
        };

        const onObjectAdded = (e: any) => checkAndExtend(e.target);
        const onObjectModified = (e: any) => checkAndExtend(e.target);
        // path:created is covered by object:added

        canvas.on('object:added', onObjectAdded);
        canvas.on('object:modified', onObjectModified);

        return () => {
            canvas.off('object:added', onObjectAdded);
            canvas.off('object:modified', onObjectModified);
        };
    }, [handleExtendHeight]);

    const handleCancelWrapped = React.useCallback(() => {
        setIsExitConfirmOpen(true);
    }, []);

    const handleConfirmExit = () => {
        setIsExitConfirmOpen(false);
        // Explicitly mark as closing to bypass guard warning
        isClosingRef.current = true;
        onClose();
    };

    const handleSave = () => {
        if (!fabricCanvasRef.current) return;
        // Ensure dimensions are saved in JSON
        const canvas = fabricCanvasRef.current;
        const jsonObj = canvas.toJSON(['width', 'height']);
        const json = JSON.stringify(jsonObj);
        onSave(json);
    };

    // ... (omitted intermediate lines if tool allows or do separate calls, but seeing replace_file_content limitation)
    // Actually I need to replace separate chunks.


    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger shortcuts if user is typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            const key = e.key.toLowerCase();

            // Tool shortcuts
            const selectToolById = (toolId: ToolType) => {
                const item = toolbarItems.find(i => i.toolId === toolId);
                if (item) {
                    handleToolSelect(item.id, item.type, item.toolId);
                } else {
                    setActiveTool(toolId);
                    setActiveToolItemId(null);
                }
            };

            switch (key) {
                case 'p': // Pen
                case 'b': // Brush (alternative)
                    selectToolById('pen');
                    break;
                case 'l': // Line
                    selectToolById('line');
                    break;
                case 'a': // Arrow
                    selectToolById('arrow');
                    break;
                case 'r': // Rectangle
                    selectToolById('rect');
                    break;
                case 'c': // Circle
                    selectToolById('circle');
                    break;
                case 't': // Text
                    selectToolById('text');
                    break;
                case 'e': // Eraser (pixel)
                    selectToolById('eraser_pixel');
                    break;
                case 'd': // Delete eraser (object)
                case 'x': // Alternative for object eraser
                    selectToolById('eraser_object');
                    break;
                case 'z': // Undo / Redo
                    if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
                        e.preventDefault();
                        handleRedo();
                    } else if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        handleUndo();
                    }
                    break;
                case 'y': // Alternative redo (Ctrl+Y)
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        handleRedo();
                    }
                    break;
                case 'escape': // Close modal
                    handleCancelWrapped();
                    break;
                case 'delete':
                case 'backspace': {
                    // Delete selected object if any (for object eraser mode or general selection)
                    const canvas = fabricCanvasRef.current;
                    if (canvas) {
                        const activeObject = canvas.getActiveObject();
                        // If user is editing a text object, let fabric handle backspace/delete
                        if (activeObject && (activeObject as any).isEditing) {
                            return;
                        }

                        const activeObjects = canvas.getActiveObjects();
                        if (activeObjects.length > 0) {
                            e.preventDefault();
                            canvas.discardActiveObject();
                            activeObjects.forEach((obj) => {
                                canvas.remove(obj);
                            });
                            canvas.requestRenderAll();
                            saveHistory();
                        }
                    }
                    break;
                }
                // Brush size shortcuts (1-4)
                case '1':
                    setBrushSize(availableBrushSizes[0]);
                    updateToolSetting(undefined, availableBrushSizes[0]);
                    break;
                case '2':
                    setBrushSize(availableBrushSizes[1]);
                    updateToolSetting(undefined, availableBrushSizes[1]);
                    break;
                case '3':
                    setBrushSize(availableBrushSizes[2]);
                    updateToolSetting(undefined, availableBrushSizes[2]);
                    break;
                case '4':
                    setBrushSize(availableBrushSizes[3]);
                    updateToolSetting(undefined, availableBrushSizes[3]);
                    break;
                case '5':
                    setBrushSize(availableBrushSizes[4]);
                    updateToolSetting(undefined, availableBrushSizes[4]);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, availableBrushSizes, handleUndo, handleRedo, setBrushSize, updateToolSetting, saveHistory, handleCancelWrapped]);

    // Tool Switching Logic
    useEffect(() => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        // Reset default states
        canvas.isDrawingMode = false;
        canvas.selection = false;
        canvas.defaultCursor = 'default';
        canvas.hoverCursor = 'default';

        // Disable selection on all objects by default
        // But preserve pixel eraser marks' evented: false state
        canvas.forEachObject((obj) => {
            if ((obj as any).isPixelEraser) {
                // Pixel eraser marks should always be non-interactive
                obj.set({
                    selectable: false,
                    evented: false,
                    hoverCursor: 'default'
                });
            } else {
                obj.set({
                    selectable: false,
                    evented: true,
                    hoverCursor: 'default'
                });
            }
        });

        // Remove object erasing listener if present (we'll re-add if needed)
        canvas.off('mouse:down');
        canvas.off('mouse:move');
        canvas.off('mouse:up');

        // Re-attach standard listeners if needed (none strictly for now unless shape)

        switch (activeTool) {
            case 'select':
                canvas.isDrawingMode = false;
                canvas.selection = true;
                canvas.defaultCursor = 'default';
                canvas.forEachObject((obj) => {
                    if ((obj as any).isPixelEraser) {
                        obj.set({
                            selectable: false,
                            evented: false,
                            hoverCursor: 'default'
                        });
                    } else {
                        obj.set({
                            selectable: true,
                            evented: true,
                            hoverCursor: 'move'
                        });
                    }
                });
                canvas.requestRenderAll();
                break;

            case 'pen':
                canvas.isDrawingMode = true;
                if (brushType === 'spray') {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    canvas.freeDrawingBrush = new (fabric as any).SprayBrush(canvas);
                } else if (brushType === 'circle') {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    canvas.freeDrawingBrush = new (fabric as any).CircleBrush(canvas);
                } else if (brushType === 'highlighter') {
                    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (canvas.freeDrawingBrush as any).strokeLinecap = 'butt';
                } else if (brushType === 'carbon') {
                    // Charcoal/Carbon: Heavy noise
                    const patternCanvas = document.createElement('canvas');
                    const size = 32;
                    patternCanvas.width = size;
                    patternCanvas.height = size;
                    const ctx = patternCanvas.getContext('2d');
                    if (ctx) {
                        const imgData = ctx.createImageData(size, size);
                        const tc = new fabric.Color(color).getSource();
                        if (tc) {
                            for (let i = 0; i < imgData.data.length; i += 4) {
                                // Dense noise cluster in middle, sparser at edges?
                                // Just uniform high density noise for now
                                if (Math.random() > 0.3) {
                                    imgData.data[i] = tc[0];
                                    imgData.data[i + 1] = tc[1];
                                    imgData.data[i + 2] = tc[2];
                                    imgData.data[i + 3] = Math.floor(Math.random() * 255);
                                }
                            }
                        }
                        ctx.putImageData(imgData, 0, 0);
                    }
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    canvas.freeDrawingBrush = new (fabric as any).PatternBrush(canvas);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (canvas.freeDrawingBrush as any).source = patternCanvas;
                } else if (brushType === 'hatch') {
                    // Hatch: Criss Cross
                    const patternCanvas = document.createElement('canvas');
                    const size = 16;
                    patternCanvas.width = size;
                    patternCanvas.height = size;
                    const ctx = patternCanvas.getContext('2d');
                    if (ctx) {
                        const tc = new fabric.Color(color).getSource();
                        if (tc) {
                            ctx.strokeStyle = `rgba(${tc[0]}, ${tc[1]}, ${tc[2]}, 1)`;
                            ctx.lineWidth = 1;
                            ctx.beginPath();
                            ctx.moveTo(0, 0); ctx.lineTo(size, size);
                            ctx.moveTo(size, 0); ctx.lineTo(0, size);
                            ctx.stroke();
                        }
                    }
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    canvas.freeDrawingBrush = new (fabric as any).PatternBrush(canvas);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (canvas.freeDrawingBrush as any).source = patternCanvas;
                } else if (brushType === 'glow') {
                    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
                    canvas.freeDrawingBrush.shadow = new fabric.Shadow({
                        blur: 15,
                        offsetX: 0,
                        offsetY: 0,
                        color: color
                    });
                } else if (brushType === 'pen') {
                    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
                } else {
                    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
                }

                canvas.freeDrawingBrush.color = (brushType === 'highlighter')
                    ? color.replace(')', ', 0.3)').replace('rgb', 'rgba').replace('#', color) // Basic alpha support
                    : color;

                // Better highlighter color handling
                if (brushType === 'highlighter') {
                    if (color.startsWith('#')) {
                        const r = parseInt(color.slice(1, 3), 16);
                        const g = parseInt(color.slice(3, 5), 16);
                        const b = parseInt(color.slice(5, 7), 16);
                        canvas.freeDrawingBrush.color = `rgba(${r}, ${g}, ${b}, 0.3)`;
                    }
                }

                canvas.freeDrawingBrush.width = (brushType === 'highlighter')
                    ? brushSize * 2 : brushSize;
                canvas.defaultCursor = 'crosshair';
                break;

            case 'eraser_pixel': {
                canvas.isDrawingMode = true;
                // Use PatternBrush for a flicker-free "erase" experience
                // It draws a pattern that perfectly matches the background
                const pattern = createBackgroundPattern(background, backgroundColor, lineOpacity, backgroundSize);
                const brush = new (fabric as any).PatternBrush(canvas);
                brush.source = (pattern as any).source;
                brush.width = brushSize * 4;
                canvas.freeDrawingBrush = brush;
                break;
            }

            case 'eraser_object': {
                canvas.isDrawingMode = false;
                canvas.defaultCursor = 'pointer';
                canvas.hoverCursor = 'not-allowed';

                // Enable events on all objects so they can be detected
                // But exclude pixel eraser marks - they should not be removable
                canvas.forEachObject((obj) => {
                    if ((obj as any).isPixelEraser) {
                        obj.set({
                            selectable: false,
                            evented: false,
                            hoverCursor: 'default'
                        });
                    } else {
                        obj.set({
                            selectable: false,
                            evented: true,
                            hoverCursor: 'not-allowed'
                        });
                    }
                });
                canvas.requestRenderAll();

                let isErasingDragging = false;

                canvas.on('mouse:down', (opt) => {
                    isErasingDragging = true;
                    if (opt.target) {
                        canvas.remove(opt.target);
                        canvas.requestRenderAll();
                    }
                });

                canvas.on('mouse:move', (opt) => {
                    if (isErasingDragging && opt.target) {
                        canvas.remove(opt.target);
                        canvas.requestRenderAll();
                    }
                });

                canvas.on('mouse:up', () => {
                    isErasingDragging = false;
                });
                break;
            }

            case 'text':
                canvas.isDrawingMode = false;
                canvas.defaultCursor = 'text';
                canvas.on('mouse:down', (opt) => {
                    // Only add text if clicking on empty area
                    if (opt.target) return;

                    const pointer = canvas.getPointer(opt.e);
                    const text = new fabric.IText('Type here...', {
                        left: pointer.x,
                        top: pointer.y,
                        fontFamily: fontFamily,
                        fontWeight: fontWeight,
                        fontStyle: fontStyle,
                        fontSize: Math.max(16, brushSize * 4),
                        fill: color,
                        editable: true,
                        selectable: true,
                        evented: true,
                    });
                    canvas.add(text);
                    canvas.setActiveObject(text);
                    text.enterEditing();
                    text.selectAll();
                    canvas.requestRenderAll();
                });
                break;

            case 'line':
            case 'arrow':
            case 'rect':
            case 'circle':
            case 'triangle':
            case 'ellipse':
            case 'diamond':
            case 'pentagon':
            case 'hexagon':
            case 'octagon':
            case 'star':
                canvas.defaultCursor = 'crosshair';
                // Attach shape drawing handlers
                canvas.on('mouse:down', handleShapeMouseDown);
                canvas.on('mouse:move', handleShapeMouseMove);
                canvas.on('mouse:up', handleShapeMouseUp);
                break;
        }

    }, [activeTool, color, brushSize, shapeStyles, brushType, fontFamily, handleShapeMouseDown, handleShapeMouseMove, handleShapeMouseUp]);

    useEffect(() => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        const activeObjects = canvas.getActiveObjects();
        if (activeObjects.length > 0) {
            activeObjects.forEach((obj) => {
                if ((obj as any).isArrow && obj.type === 'group') {
                    const group = obj as fabric.Group;
                    group.getObjects().forEach((child, index) => {
                        child.set({ stroke: color, strokeWidth: brushSize });
                        // child 0 is the line, keep its dash if applicable
                        // child 1 is the head, always solid
                        if (index === 0) {
                            const currentStyle = shapeStyles['arrow'] || DEFAULT_SHAPE_STYLE;
                            child.set({ strokeDashArray: currentStyle.dashArray });
                        } else {
                            child.set({ strokeDashArray: undefined });
                        }
                    });
                } else if (obj.type === 'i-text' || obj.type === 'text') {
                    (obj as fabric.IText).set({ fill: color, fontFamily: fontFamily });
                } else {
                    obj.set({ stroke: color, strokeWidth: brushSize });
                }

                // Also update toolSettings for this object type
                const objType = (obj as any).isArrow ? 'arrow' :
                    (obj as any).isDiamond ? 'diamond' :
                        (obj.type === 'i-text' || obj.type === 'text') ? 'text' :
                            obj.type === 'path' ? 'pen' :
                                obj.type === 'rect' ? 'rect' :
                                    obj.type === 'circle' ? 'circle' :
                                        obj.type === 'triangle' ? 'triangle' :
                                            obj.type === 'ellipse' ? 'ellipse' :
                                                obj.type;

                // Special case for pen types if we can detect them, but 'pen' is default
                let targetKey = objType as string;
                if (targetKey === 'path') targetKey = brushType; // Fallback to current brush type if it's a path

                setToolSettings(prev => ({
                    ...prev,
                    [targetKey]: { color, size: brushSize }
                }));
            });
            canvas.requestRenderAll();
            saveHistory();
        }
    }, [color, brushSize, brushType, shapeStyles, fontFamily, saveHistory]);

    // Handle background change
    // Handle background change
    useEffect(() => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        // Calculate backgroundColor based on type and intensity
        let newBgColor = '#ffffff';
        const intensity = backgroundColorIntensity / 100;
        if (backgroundColorType === 'gray') {
            // Gray: 0 intensity is #ffffff, 100 intensity is #adb5bd
            const r = Math.round(255 - (255 - 173) * intensity);
            const g = Math.round(255 - (255 - 181) * intensity);
            const b = Math.round(255 - (255 - 189) * intensity);
            newBgColor = `rgb(${r}, ${g}, ${b})`;
        } else {
            // Beige: 0 intensity is #ffffff, 100 intensity is #e8e4c9
            const r = Math.round(255 - (255 - 232) * intensity);
            const g = Math.round(255 - (255 - 228) * intensity);
            const b = Math.round(255 - (255 - 201) * intensity);
            newBgColor = `rgb(${r}, ${g}, ${b})`;
        }
        setBackgroundColor(newBgColor);

        // 1. Set solid background color
        canvas.setBackgroundColor(newBgColor, () => { });

        // 2. Set pattern as overlay (Still used for baseline visibility)
        const gridPattern = createBackgroundPattern(background, newBgColor, lineOpacity, backgroundSize, true);
        canvas.setOverlayColor(gridPattern as any, () => {
            // 3. Sync existing eraser marks
            // Since they are now Pattern paths, we need to update their fill pattern
            const newEraserPattern = createBackgroundPattern(background, newBgColor, lineOpacity, backgroundSize);

            canvas.getObjects().forEach(obj => {
                if ((obj as any).isPixelEraser) {
                    // Update the stroke pattern to the new background pattern
                    obj.set('stroke', newEraserPattern as any);
                }
            });

            // Also update the active brush if it's currently the pixel eraser
            if (activeToolRef.current === 'eraser_pixel' && canvas.freeDrawingBrush) {
                (canvas.freeDrawingBrush as any).source = (newEraserPattern as any).source;
            }

            canvas.renderAll();
        });
    }, [background, backgroundColorType, backgroundColorIntensity, lineOpacity, backgroundSize]);

    return (
        <>
            <ModalOverlay onClick={(e) => {
                if (e.target === e.currentTarget) {
                    // If any settings modal is open (Level 1)
                    if (isPalettePickerOpen || isSizeEditOpen || isShapeSettingsOpen || isPenEditOpen || isFontEditOpen || isBgPickerOpen) {
                        // If we just interacted with an input (like the native color picker),
                        // ignore the first backdrop click so the user stays in the sub-modal.
                        if (Date.now() - lastInteractionTimeRef.current > 500) {
                            handlePalettePickerClose();
                            handleSizeOk();
                            handleShapeSettingsOk();
                            handlePenOk();
                            handleFontOk();
                            handleBgOk();
                        }
                    } else {
                        // Only close the main modal (Level 0) if no settings are open
                        // and some time has passed since the last interaction
                        if (Date.now() - lastInteractionTimeRef.current > 300) {
                            handleCancelWrapped();
                        }
                    }
                }
            }}>
                <ModalContainer>
                    <Toolbar>
                        <ToolGroup style={{ flex: 1 }}>
                            {toolbarItems.map((item) => renderToolbarItem(item))}
                            <div style={{ flex: 1 }} /> {/* Spacer to push buttons to right */}
                            <ToolButton
                                onClick={() => setIsHelpOpen(true)}
                                style={{ border: 'none', background: 'transparent' }}
                                title={t.drawing?.help || 'Help'}
                            >
                                <FiHelpCircle size={18} />
                            </ToolButton>
                            <ToolButton
                                onClick={() => setIsConfigOpen(true)}
                                style={{ border: 'none', background: 'transparent' }}
                                title={t.drawing?.customize || 'Customize Toolbar'}
                            >
                                <FiSettings size={18} />
                            </ToolButton>
                            <div style={{ width: '4px', height: '16px', borderLeft: '1px solid #dee2e6', margin: '0 4px' }} />
                            <CompactActionButton onClick={handleCancelWrapped} title={t.drawing?.cancel || 'Cancel'}>
                                <FiX size={12} />
                            </CompactActionButton>
                            <CompactActionButton $primary onClick={handleSave} title={t.drawing?.insert || 'Insert'}>
                                <FiCheck size={12} />
                            </CompactActionButton>
                        </ToolGroup>
                    </Toolbar>

                    {isSizeEditOpen && (
                        <Backdrop
                            $centered={!settingsAnchor}
                            onClick={(e) => {
                                const now = Date.now();
                                if (now - openedTimeRef.current < 400) return; // Ignore ghost clicks
                                if (e.target === e.currentTarget) handleSizeOk();
                            }}>
                            <CompactModal
                                $anchor={settingsAnchor || undefined}
                                onClick={e => e.stopPropagation()}
                            >
                                <ColorInputWrapper>
                                    <CustomRangeInput
                                        type="range"
                                        min="1"
                                        max="100"
                                        $size={tempSize}
                                        value={tempSize}
                                        onChange={(e) => setTempSize(parseInt(e.target.value))}
                                    />
                                    <CustomNumberInput
                                        type="number"
                                        min="1"
                                        max="500"
                                        value={tempSize}
                                        onChange={(e) => setTempSize(parseInt(e.target.value) || 1)}
                                    />
                                </ColorInputWrapper>
                                <CompactModalFooter>
                                    <CompactModalButton onClick={handleSizeReset}>
                                        {t.drawing?.reset || 'Reset'}
                                    </CompactModalButton>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <CompactModalButton onClick={handleSizeCancel}>
                                            {t.drawing?.cancel || 'Cancel'}
                                        </CompactModalButton>
                                        <CompactModalButton onClick={handleSizeOk} $variant="primary">
                                            {t.drawing?.ok || 'OK'}
                                        </CompactModalButton>
                                    </div>
                                </CompactModalFooter>
                            </CompactModal>
                        </Backdrop>
                    )}
                    {isShapeSettingsOpen && (
                        <Backdrop
                            $centered={!settingsAnchor}
                            onClick={(e) => {
                                const now = Date.now();
                                if (now - openedTimeRef.current < 400) return; // Ignore ghost clicks
                                if (e.target === e.currentTarget) handleShapeSettingsOk();
                            }}>
                            <CompactModal
                                $anchor={settingsAnchor || undefined}
                                onClick={e => e.stopPropagation()}
                                style={{ minWidth: '160px' }}
                            >
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '4px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '8px' }}>
                                    {(['line', 'arrow', 'rect', 'ellipse', 'triangle', 'circle', 'diamond', 'pentagon', 'hexagon', 'octagon', 'star'] as ToolType[]).map((tool) => (
                                        <ToolButton
                                            key={tool}
                                            $active={activeTool === tool}
                                            onClick={() => {
                                                setActiveTool(tool);
                                                lastInteractionTimeRef.current = Date.now();
                                            }}
                                            onDoubleClick={() => {
                                                setActiveTool(tool);
                                                handleShapeSettingsOk();
                                            }}
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '4px',
                                                background: activeTool === tool ? '#333' : 'transparent',
                                                color: activeTool === tool ? 'white' : '#555',
                                                border: '1px solid',
                                                borderColor: activeTool === tool ? '#333' : '#e9ecef',
                                            }}
                                        >
                                            {tool === 'line' && <FiMinus size={16} style={{ transform: 'rotate(-45deg)' }} />}
                                            {tool === 'arrow' && <FiArrowDown size={14} style={{ transform: 'rotate(-135deg)' }} />}
                                            {tool === 'rect' && <FiSquare size={14} />}
                                            {tool === 'circle' && <FiCircle size={14} />}
                                            {tool === 'ellipse' && <EllipseIcon size={14} />}
                                            {tool === 'triangle' && <FiTriangle size={14} />}
                                            {tool === 'diamond' && <DiamondIcon size={14} />}
                                            {tool === 'pentagon' && <PentagonIcon size={14} />}
                                            {tool === 'hexagon' && <HexagonIcon size={14} />}
                                            {tool === 'octagon' && <OctagonIcon size={14} />}
                                            {tool === 'star' && <StarIcon size={14} />}
                                        </ToolButton>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {DASH_OPTIONS.map((dash, index) => (
                                        <DashOption
                                            key={index}
                                            $active={tempDashIndex === index}
                                            onClick={() => setTempDashIndex(index)}
                                        >
                                            <DashPreview $dash={dash || null} />
                                        </DashOption>
                                    ))}
                                </div>
                                <div style={{ borderTop: '1px solid #eee', margin: '4px 0' }}></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 4px' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#666', fontWeight: 600, minWidth: '35px' }}>
                                        {t.drawing?.opacity || 'Opacity'}
                                    </div>
                                    <CustomRangeInput
                                        type="range"
                                        min="10"
                                        max="100"
                                        $size={6}
                                        $opacityValue={tempShapeOpacity}
                                        value={tempShapeOpacity}
                                        onChange={(e) => setTempShapeOpacity(parseInt(e.target.value))}
                                        style={{ margin: 0, flex: 1 }}
                                    />
                                    <div style={{ fontSize: '0.7rem', color: '#666', fontWeight: 500, minWidth: '30px', textAlign: 'right' }}>
                                        {tempShapeOpacity}%
                                    </div>
                                </div>

                                {activeTool === 'arrow' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px', borderTop: '1px solid #eee' }}>
                                        <div style={{ fontSize: '0.7rem', color: '#666', fontWeight: 600, minWidth: '35px' }}>
                                            {t.drawing?.head_size || 'Head'}
                                        </div>
                                        <CustomRangeInput
                                            type="range"
                                            min="5"
                                            max="100"
                                            $size={6}
                                            value={tempHeadSize}
                                            onChange={(e) => setTempHeadSize(parseInt(e.target.value))}
                                            style={{ margin: 0, flex: 1 }}
                                        />
                                        <div style={{ fontSize: '0.7rem', color: '#666', fontWeight: 500, minWidth: '30px', textAlign: 'right' }}>
                                            {tempHeadSize}px
                                        </div>
                                    </div>
                                )}

                                <CompactModalFooter>
                                    <CompactModalButton onClick={handleShapeSettingsReset}>
                                        {t.drawing?.reset || 'Reset'}
                                    </CompactModalButton>
                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                        <CompactModalButton onClick={handleShapeSettingsCancel}>
                                            {t.drawing?.cancel || 'Cancel'}
                                        </CompactModalButton>
                                        <CompactModalButton onClick={handleShapeSettingsOk} $variant="primary">
                                            {t.drawing?.ok || 'OK'}
                                        </CompactModalButton>
                                    </div>
                                </CompactModalFooter>
                            </CompactModal>
                        </Backdrop>
                    )}

                    {isPenEditOpen && (
                        <Backdrop
                            $centered={!settingsAnchor}
                            onClick={(e) => {
                                const now = Date.now();
                                if (now - openedTimeRef.current < 400) return; // Ignore ghost clicks
                                if (e.target === e.currentTarget) handlePenOk();
                            }}>
                            <CompactModal
                                $anchor={settingsAnchor || undefined}
                                onClick={e => e.stopPropagation()}
                                style={{ minWidth: '240px', maxHeight: '350px', overflowY: 'auto' }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <DashOption
                                        $active={tempBrushType === 'pen'}
                                        onClick={() => setTempBrushType('pen')}
                                        onDoubleClick={() => {
                                            setTempBrushType('pen');
                                            handlePenOk();
                                        }}
                                        style={{ height: '36px', justifyContent: 'flex-start', padding: '0 12px', gap: '12px' }}
                                    >
                                        <PenIcon />
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        <span style={{ fontSize: '0.85rem', minWidth: '70px' }}>{t.drawing.pen_pen}</span>
                                        <BrushSample
                                            $type="pen"
                                            $color={toolSettings['pen']?.color || color}
                                            $size={toolSettings['pen']?.size || brushSize}
                                        />
                                    </DashOption>
                                    <DashOption
                                        $active={tempBrushType === 'carbon'}
                                        onClick={() => setTempBrushType('carbon')}
                                        onDoubleClick={() => {
                                            setTempBrushType('carbon');
                                            handlePenOk();
                                        }}
                                        style={{ height: '36px', justifyContent: 'flex-start', padding: '0 12px', gap: '12px' }}
                                    >
                                        <CarbonIcon />
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        <span style={{ fontSize: '0.85rem', minWidth: '70px' }}>{t.drawing.pen_carbon}</span>
                                        <BrushSample
                                            $type="carbon"
                                            $color={toolSettings['carbon']?.color || color}
                                            $size={toolSettings['carbon']?.size || brushSize}
                                        />
                                    </DashOption>
                                    <DashOption
                                        $active={tempBrushType === 'hatch'}
                                        onClick={() => setTempBrushType('hatch')}
                                        onDoubleClick={() => {
                                            setTempBrushType('hatch');
                                            handlePenOk();
                                        }}
                                        style={{ height: '36px', justifyContent: 'flex-start', padding: '0 12px', gap: '12px' }}
                                    >
                                        <HatchIcon />
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        <span style={{ fontSize: '0.85rem', minWidth: '70px' }}>{t.drawing.pen_hatch}</span>
                                        <BrushSample
                                            $type="hatch"
                                            $color={toolSettings['hatch']?.color || color}
                                            $size={toolSettings['hatch']?.size || brushSize}
                                        />
                                    </DashOption>
                                    <DashOption
                                        $active={tempBrushType === 'highlighter'}
                                        onClick={() => setTempBrushType('highlighter')}
                                        onDoubleClick={() => {
                                            setTempBrushType('highlighter');
                                            handlePenOk();
                                        }}
                                        style={{ height: '36px', justifyContent: 'flex-start', padding: '0 12px', gap: '12px' }}
                                    >
                                        <HighlighterIcon />
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        <span style={{ fontSize: '0.85rem', minWidth: '70px' }}>{t.drawing.pen_highlighter}</span>
                                        <BrushSample
                                            $type="highlighter"
                                            $color={toolSettings['highlighter']?.color || color}
                                            $size={(toolSettings['highlighter']?.size || brushSize) * 2}
                                        />
                                    </DashOption>
                                    <DashOption
                                        $active={tempBrushType === 'glow'}
                                        onClick={() => setTempBrushType('glow')}
                                        onDoubleClick={() => {
                                            setTempBrushType('glow');
                                            handlePenOk();
                                        }}
                                        style={{ height: '36px', justifyContent: 'flex-start', padding: '0 12px', gap: '12px' }}
                                    >
                                        <GlowIcon />
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        <span style={{ fontSize: '0.85rem', minWidth: '70px' }}>{t.drawing.pen_glow}</span>
                                        <BrushSample
                                            $type="glow"
                                            $color={toolSettings['glow']?.color || color}
                                            $size={toolSettings['glow']?.size || brushSize}
                                        />
                                    </DashOption>
                                    <DashOption
                                        $active={tempBrushType === 'spray'}
                                        onClick={() => setTempBrushType('spray')}
                                        onDoubleClick={() => {
                                            setTempBrushType('spray');
                                            handlePenOk();
                                        }}
                                        style={{ height: '36px', justifyContent: 'flex-start', padding: '0 12px', gap: '12px' }}
                                    >
                                        <SprayBrushIcon />
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        <span style={{ fontSize: '0.85rem', minWidth: '70px' }}>{t.drawing.pen_spray}</span>
                                        <BrushSample
                                            $type="spray"
                                            $color={toolSettings['spray']?.color || color}
                                            $size={toolSettings['spray']?.size || brushSize}
                                        />
                                    </DashOption>
                                    <DashOption
                                        $active={tempBrushType === 'circle'}
                                        onClick={() => setTempBrushType('circle')}
                                        onDoubleClick={() => {
                                            setTempBrushType('circle');
                                            handlePenOk();
                                        }}
                                        style={{ height: '36px', justifyContent: 'flex-start', padding: '0 12px', gap: '12px' }}
                                    >
                                        <CircleBrushIcon />
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        <span style={{ fontSize: '0.85rem', minWidth: '70px' }}>{t.drawing.pen_circle}</span>
                                        <BrushSample
                                            $type="circle"
                                            $color={toolSettings['circle']?.color || color}
                                            $size={toolSettings['circle']?.size || brushSize}
                                        />
                                    </DashOption>

                                    {activePenSlot === 'pen_1' && (
                                        <>
                                            <div style={{ borderTop: '1px solid #eee', margin: '4px 0' }}></div>

                                            <DashOption
                                                $active={tempPalmRejection}
                                                onClick={() => setTempPalmRejection(!tempPalmRejection)}
                                                style={{ height: '36px', justifyContent: 'flex-start', padding: '0 12px', gap: '12px' }}
                                            >
                                                <div style={{
                                                    width: '18px',
                                                    height: '18px',
                                                    borderRadius: '4px',
                                                    border: '2px solid #333',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    background: tempPalmRejection ? '#333' : 'transparent'
                                                }}>
                                                    {tempPalmRejection && <div style={{ width: '8px', height: '8px', background: 'white', borderRadius: '1px' }} />}
                                                </div>
                                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                <span style={{ fontSize: '0.85rem' }}>{(t.drawing as any)?.palm_rejection || 'Palm Rejection'}</span>
                                            </DashOption>
                                        </>
                                    )}
                                </div>
                                <CompactModalFooter>
                                    <CompactModalButton onClick={handlePenReset}>
                                        {t.drawing?.reset || 'Reset'}
                                    </CompactModalButton>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <CompactModalButton onClick={handlePenCancel}>
                                            {t.drawing?.cancel || 'Cancel'}
                                        </CompactModalButton>
                                        <CompactModalButton onClick={handlePenOk} $variant="primary">
                                            {t.drawing?.ok || 'OK'}
                                        </CompactModalButton>
                                    </div>
                                </CompactModalFooter>
                            </CompactModal>
                        </Backdrop>
                    )}

                    {isFontEditOpen && (
                        <Backdrop
                            $centered={!settingsAnchor}
                            onClick={(e) => {
                                const now = Date.now();
                                if (now - openedTimeRef.current < 400) return; // Ignore ghost clicks
                                if (e.target === e.currentTarget) handleFontOk();
                            }}>
                            <CompactModal
                                $anchor={settingsAnchor || undefined}
                                onClick={e => e.stopPropagation()}
                                style={{ minWidth: '180px' }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '300px', overflowY: 'auto' }}>

                                    {availableFonts.map((font) => (
                                        <DashOption
                                            key={font}
                                            $active={tempFontFamily === font}
                                            onClick={() => setTempFontFamily(font)}
                                            onDoubleClick={() => {
                                                setTempFontFamily(font);
                                                setFontFamily(font);
                                                setSettingsAnchor(null);
                                                setIsFontEditOpen(false);
                                                lastInteractionTimeRef.current = Date.now();
                                            }}
                                            onTouchStart={(e) => {
                                                setTempFontFamily(font);
                                                handleDoubleTap(e, `font-${font}`, () => {
                                                    setFontFamily(font);
                                                    setSettingsAnchor(null);
                                                    setIsFontEditOpen(false);
                                                    lastInteractionTimeRef.current = Date.now();
                                                });
                                            }}
                                            style={{ fontFamily: font, height: '32px', justifyContent: 'flex-start', padding: '0 12px' }}
                                        >
                                            {font}
                                        </DashOption>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: '4px', padding: '8px 12px', borderTop: '1px solid #eee' }}>
                                    {[
                                        { label: t.drawing?.font_thin || 'Thin', value: 100 },
                                        { label: t.drawing?.font_normal || 'Normal', value: 'normal' },
                                        { label: t.drawing?.font_bold || 'Bold', value: 'bold' }
                                    ].map((w) => (
                                        <CompactModalButton
                                            key={typeof w.value === 'string' ? w.value : w.value.toString()}
                                            $variant={tempFontWeight == w.value ? 'primary' : undefined}
                                            onClick={() => setTempFontWeight(w.value)}
                                            style={{ flex: 1, fontSize: '0.8rem', padding: '4px' }}
                                        >
                                            {w.label}
                                        </CompactModalButton>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', padding: '0 12px 8px 12px' }}>
                                    <CompactModalButton
                                        $variant={tempFontStyle === 'italic' ? 'primary' : undefined}
                                        onClick={() => setTempFontStyle(prev => prev === 'italic' ? 'normal' : 'italic')}
                                        style={{ flex: 1, fontSize: '0.8rem', padding: '4px', fontStyle: 'italic' }}
                                    >
                                        {t.drawing?.font_italic || 'Italic'}
                                    </CompactModalButton>
                                </div>
                                <CompactModalFooter>
                                    <div />
                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                        <CompactModalButton onClick={handleFontCancel}>
                                            {t.drawing?.cancel || 'Cancel'}
                                        </CompactModalButton>
                                        <CompactModalButton onClick={handleFontOk} $variant="primary">
                                            {t.drawing?.ok || 'OK'}
                                        </CompactModalButton>
                                    </div>
                                </CompactModalFooter>
                            </CompactModal>
                        </Backdrop>
                    )}

                    {isPalettePickerOpen && (
                        <Backdrop onClick={handlePalettePickerClose}>
                            <CompactModal onClick={e => e.stopPropagation()} style={{ width: '320px', maxHeight: '80vh', overflowY: 'auto', padding: '0 16px 16px 16px' }}>
                                {editingPaletteIndex === null ? (
                                    <>
                                        <div style={{ position: 'relative', height: '14px', marginBottom: '4px' }}>
                                            <FiX style={{ position: 'absolute', top: '-4px', right: '-4px', padding: '10px', cursor: 'pointer', color: '#888' }} onClick={handlePalettePickerClose} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {palettes.map((p, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => handlePaletteSelect(idx)}
                                                    onDoubleClick={() => handlePaletteDoubleTap_Local(idx)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        padding: '8px',
                                                        borderRadius: '8px',
                                                        border: '2px solid',
                                                        borderColor: selectedPaletteIndex === idx ? '#333' : '#e9ecef',
                                                        background: selectedPaletteIndex === idx ? '#f8f9fa' : 'white',
                                                        transition: 'all 0.2s',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <div style={{ flex: 1, display: 'flex', gap: '6px' }}>
                                                        {p.map((c, cIdx) => (
                                                            <div key={cIdx} style={{ width: '22px', height: '22px', borderRadius: '50%', background: c, border: '1px solid rgba(0,0,0,0.1)' }} />
                                                        ))}
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '4px', marginLeft: '12px' }}>
                                                        <button
                                                            onClick={(e) => handlePaletteEditStart(e, idx)}
                                                            title={t.drawing?.palette_edit || 'Edit colors'}
                                                            style={{ border: 'none', background: '#f1f3f5', borderRadius: '4px', cursor: 'pointer', padding: '6px', color: '#495057', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        >
                                                            <FiEdit2 size={14} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); if (confirm(t.drawing?.palette_reset_confirm || 'Reset this palette?')) handlePaletteReset(idx); }}
                                                            title={t.drawing?.palette_reset || 'Reset to default'}
                                                            style={{ border: 'none', background: '#f1f3f5', borderRadius: '4px', cursor: 'pointer', padding: '6px', color: '#495057', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        >
                                                            <FiRotateCcw size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <CompactModalFooter style={{ marginTop: '20px' }}>
                                            <CompactModalButton onClick={handlePalettePickerClose}>{t.drawing?.cancel || 'Cancel'}</CompactModalButton>
                                            <CompactModalButton $variant="primary" onClick={handlePaletteOk} style={{ minWidth: '80px' }}>{t.drawing?.ok || 'OK'}</CompactModalButton>
                                        </CompactModalFooter>
                                    </>
                                ) : (
                                    <>
                                        <div style={{ position: 'relative', height: '14px', marginBottom: '4px' }}>
                                            <FiX style={{ position: 'absolute', top: '-4px', right: '-4px', padding: '10px', cursor: 'pointer', color: '#888' }} onClick={handlePaletteEditCancel} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <div style={{ display: 'flex', flexWrap: 'nowrap', gap: '8px', justifyContent: 'space-between', padding: '4px', background: '#f8f9fa', borderRadius: '8px' }}>
                                                {paletteTempColors.map((c, idx) => (
                                                    <div
                                                        key={idx}
                                                        onClick={() => setPaletteEditingColorIndex(idx)}
                                                        style={{
                                                            width: '38px',
                                                            height: '38px',
                                                            borderRadius: '50%',
                                                            background: c,
                                                            border: paletteEditingColorIndex === idx ? '3px solid #333' : '2px solid white',
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                            cursor: 'pointer',
                                                            transition: 'transform 0.1s'
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                            {paletteEditingColorIndex !== null && (
                                                <div style={{ padding: '8px', background: 'white', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                                                    <HexColorPicker
                                                        color={paletteTempColors[paletteEditingColorIndex]}
                                                        onChange={(newColor) => {
                                                            const next = [...paletteTempColors];
                                                            next[paletteEditingColorIndex] = newColor;
                                                            setPaletteTempColors(next);
                                                        }}
                                                        style={{ width: '100%', height: '150px' }}
                                                    />
                                                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 4px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <span style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600, width: '30px', flexShrink: 0 }}>HEX</span>
                                                            <div style={{ display: 'flex', flex: 1 }}>
                                                                <input
                                                                    value={paletteTempColors[paletteEditingColorIndex].toUpperCase()}
                                                                    readOnly
                                                                    style={{
                                                                        width: '100%',
                                                                        padding: '6px 10px',
                                                                        fontSize: '0.85rem',
                                                                        fontFamily: 'inherit',
                                                                        border: '1px solid #ced4da',
                                                                        borderRadius: '4px',
                                                                        background: '#f1f3f5',
                                                                        cursor: 'default',
                                                                        color: '#495057',
                                                                        textAlign: 'left'
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <span style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600, width: '30px', flexShrink: 0 }}>RGB</span>
                                                            <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                                                                {['r', 'g', 'b'].map((key) => {
                                                                    const rgb = hexToRgb(paletteTempColors[paletteEditingColorIndex!]);
                                                                    return (
                                                                        <input
                                                                            key={key}
                                                                            type="number"
                                                                            min="0"
                                                                            max="255"
                                                                            value={rgb[key as keyof typeof rgb]}
                                                                            onChange={(e) => {
                                                                                const val = parseInt(e.target.value) || 0;
                                                                                const newRgb = { ...rgb, [key]: val };
                                                                                const next = [...paletteTempColors];
                                                                                next[paletteEditingColorIndex!] = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
                                                                                setPaletteTempColors(next);
                                                                            }}
                                                                            style={{
                                                                                flex: 1,
                                                                                width: 0, // Allow flex to control width
                                                                                padding: '6px 2px',
                                                                                border: '1px solid #ced4da',
                                                                                borderRadius: '4px',
                                                                                fontSize: '0.85rem',
                                                                                textAlign: 'center',
                                                                                background: 'white'
                                                                            }}
                                                                        />
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <CompactModalFooter style={{ marginTop: '20px' }}>
                                            <CompactModalButton onClick={handlePaletteEditCancel}>{t.drawing?.cancel || 'Cancel'}</CompactModalButton>
                                            <CompactModalButton $variant="primary" onClick={handlePaletteEditSave} style={{ minWidth: '100px' }}>{t.drawing?.save_palette || 'Save Palette'}</CompactModalButton>
                                        </CompactModalFooter>
                                    </>
                                )}
                            </CompactModal>
                        </Backdrop>
                    )}

                    {isBgPickerOpen && (
                        <Backdrop
                            $centered={!settingsAnchor}
                            onClick={(e) => {
                                const now = Date.now();
                                if (now - openedTimeRef.current < 400) return;
                                if (e.target === e.currentTarget) handleBgOk();
                            }}>
                            <CompactModal
                                $anchor={settingsAnchor || undefined}
                                onClick={e => e.stopPropagation()}
                                style={{ minWidth: '240px', maxHeight: '450px', overflowY: 'auto', padding: '12px' }}
                            >
                                <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#495057', marginBottom: '8px' }}>{t.drawing.bg_settings}</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                                    <BackgroundOptionButton
                                        $active={background === 'none'}
                                        onClick={() => setBackground('none')}
                                    >
                                        {t.drawing.bg_none}
                                    </BackgroundOptionButton>
                                    <BackgroundOptionButton
                                        $active={background === 'lines'}
                                        onClick={() => setBackground('lines')}
                                    >
                                        {t.drawing.bg_lines}
                                    </BackgroundOptionButton>
                                    <BackgroundOptionButton
                                        $active={background === 'grid'}
                                        onClick={() => setBackground('grid')}
                                    >
                                        {t.drawing.bg_grid}
                                    </BackgroundOptionButton>
                                    <BackgroundOptionButton
                                        $active={background === 'dots'}
                                        onClick={() => setBackground('dots')}
                                    >
                                        {t.drawing.bg_dots}
                                    </BackgroundOptionButton>
                                </div>

                                {background !== 'none' && (
                                    <>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                                            <div style={{ fontSize: '0.75rem', color: '#888' }}>{t.drawing.bg_size}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#adb5bd' }}>{backgroundSize}px</div>
                                        </div>
                                        <CustomRangeInput
                                            type="range"
                                            min="10"
                                            max="100"
                                            $size={20}
                                            value={backgroundSize}
                                            onChange={(e) => setBackgroundSize(parseInt(e.target.value))}
                                            style={{ margin: '4px 0' }}
                                        />

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                                            <div style={{ fontSize: '0.75rem', color: '#888' }}>{t.drawing.bg_darkness}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#adb5bd' }}>{Math.round(lineOpacity * 100)}%</div>
                                        </div>
                                        <CustomRangeInput
                                            type="range"
                                            min="5"
                                            max="80"
                                            $size={20}
                                            $opacityValue={lineOpacity * 100}
                                            value={lineOpacity * 100}
                                            onChange={(e) => setLineOpacity(parseInt(e.target.value) / 100)}
                                            style={{ margin: '4px 0' }}
                                        />
                                    </>
                                )}

                                <div style={{ borderTop: '1px solid #eee', margin: '4px 0' }}></div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#495057' }}>{t.drawing.bg_paper_color}</div>
                                    <div style={{ display: 'flex', background: '#f1f3f5', padding: '2px', borderRadius: '4px' }}>
                                        <button
                                            onClick={() => setBackgroundColorType('gray')}
                                            style={{
                                                padding: '2px 8px',
                                                fontSize: '0.7rem',
                                                border: 'none',
                                                borderRadius: '3px',
                                                background: backgroundColorType === 'gray' ? 'white' : 'transparent',
                                                boxShadow: backgroundColorType === 'gray' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                                                cursor: 'pointer',
                                                color: backgroundColorType === 'gray' ? '#333' : '#888'
                                            }}
                                        >
                                            {t.drawing.bg_color_gray}
                                        </button>
                                        <button
                                            onClick={() => setBackgroundColorType('beige')}
                                            style={{
                                                padding: '2px 8px',
                                                fontSize: '0.7rem',
                                                border: 'none',
                                                borderRadius: '3px',
                                                background: backgroundColorType === 'beige' ? 'white' : 'transparent',
                                                boxShadow: backgroundColorType === 'beige' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                                                cursor: 'pointer',
                                                color: backgroundColorType === 'beige' ? '#333' : '#888'
                                            }}
                                        >
                                            {t.drawing.bg_color_beige}
                                        </button>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#888' }}>{t.drawing.bg_intensity}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#adb5bd' }}>{backgroundColorIntensity}%</div>
                                </div>
                                <CustomRangeInput
                                    type="range"
                                    min="0"
                                    max="100"
                                    $size={20}
                                    value={backgroundColorIntensity}
                                    onChange={(e) => setBackgroundColorIntensity(parseInt(e.target.value))}
                                    style={{ margin: '4px 0' }}
                                />

                                <div style={{ borderTop: '1px solid #eee', margin: '8px 0 4px 0' }}></div>

                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                    <CompactModalButton
                                        onClick={() => {
                                            const settings = {
                                                type: background,
                                                size: backgroundSize,
                                                intensity: backgroundColorIntensity,
                                                colorType: backgroundColorType,
                                                opacity: lineOpacity
                                            };
                                            localStorage.setItem('fabric_default_background_v2', JSON.stringify(settings));
                                            setIsBgPickerOpen(false);
                                            setSettingsAnchor(null);
                                        }}
                                        style={{ marginRight: 'auto', fontSize: '0.7rem', padding: '0.2rem 0.4rem', border: '1px solid #ced4da', background: '#f8f9fa' }}
                                    >
                                        {t.drawing.bg_save_default}
                                    </CompactModalButton>
                                    <CompactModalButton
                                        onClick={handleBgCancel}
                                    >
                                        {t.drawing.cancel}
                                    </CompactModalButton>
                                    <CompactModalButton
                                        $variant="primary"
                                        onClick={handleBgOk}
                                    >
                                        {t.drawing.ok}
                                    </CompactModalButton>
                                </div>
                            </CompactModal>
                        </Backdrop>
                    )}

                    <CanvasWrapper ref={containerRef} $bgColor={backgroundColor}>
                        <canvas ref={canvasRef} />
                    </CanvasWrapper>
                </ModalContainer>
            </ModalOverlay >
            {isConfigOpen && (
                <ToolbarConfigurator
                    currentItems={toolbarItems}
                    allItems={INITIAL_TOOLBAR_ITEMS}
                    colors={availableColors}
                    brushSizes={availableBrushSizes}
                    onSave={(newItems) => {
                        setToolbarItems(newItems);
                        setIsConfigOpen(false);
                    }}
                    onClose={() => setIsConfigOpen(false)}
                />
            )
            }
            {
                isExitConfirmOpen && (
                    <ModalOverlay style={{ zIndex: 12000 }}>
                        <CompactModal onClick={e => e.stopPropagation()} style={{ padding: '20px', minWidth: '300px', maxWidth: '90vw' }}>
                            <h3 style={{ marginTop: 0, fontSize: '1.2rem', color: '#333' }}>
                                {t.drawing.exit_title}
                            </h3>
                            <p style={{ color: '#555', lineHeight: '1.5', margin: '10px 0 20px 0' }}>
                                {t.drawing.cancel_confirm}
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <CompactModalButton onClick={() => setIsExitConfirmOpen(false)} style={{ padding: '8px 16px' }}>
                                    {(t.drawing as any)?.exit_cancel || t.drawing.cancel}
                                </CompactModalButton>
                                <CompactModalButton $variant="danger" onClick={handleConfirmExit} style={{ padding: '8px 16px', background: '#e03131', color: 'white', border: 'none' }}>
                                    {t.drawing.discard}
                                </CompactModalButton>
                            </div>
                        </CompactModal>
                    </ModalOverlay>
                )
            }

            {isHelpOpen && (
                <Backdrop $centered onClick={(e) => { if (e.target === e.currentTarget) setIsHelpOpen(false); }}>
                    <CompactModal onClick={e => e.stopPropagation()} style={{ maxWidth: '360px', maxHeight: '80vh', overflowY: 'auto' }}>
                        <div style={{ padding: '4px 0' }}>
                            <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 600, color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FiHelpCircle size={18} /> 도움말
                            </h3>

                            <div style={{ marginBottom: '16px' }}>
                                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.8rem', fontWeight: 600, color: '#495057' }}>⌨️ 단축키</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', fontSize: '0.75rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ color: '#495057' }}>펜</span><kbd style={{ background: '#f8f9fa', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.7rem', border: '1px solid #dee2e6', boxShadow: '0 1px 0 #dee2e6', color: '#333' }}>P</kbd></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ color: '#495057' }}>선</span><kbd style={{ background: '#f8f9fa', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.7rem', border: '1px solid #dee2e6', boxShadow: '0 1px 0 #dee2e6', color: '#333' }}>L</kbd></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ color: '#495057' }}>화살표</span><kbd style={{ background: '#f8f9fa', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.7rem', border: '1px solid #dee2e6', boxShadow: '0 1px 0 #dee2e6', color: '#333' }}>A</kbd></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ color: '#495057' }}>사각형</span><kbd style={{ background: '#f8f9fa', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.7rem', border: '1px solid #dee2e6', boxShadow: '0 1px 0 #dee2e6', color: '#333' }}>R</kbd></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ color: '#495057' }}>원</span><kbd style={{ background: '#f8f9fa', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.7rem', border: '1px solid #dee2e6', boxShadow: '0 1px 0 #dee2e6', color: '#333' }}>C</kbd></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ color: '#495057' }}>텍스트</span><kbd style={{ background: '#f8f9fa', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.7rem', border: '1px solid #dee2e6', boxShadow: '0 1px 0 #dee2e6', color: '#333' }}>T</kbd></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ color: '#495057' }}>지우개</span><kbd style={{ background: '#f8f9fa', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.7rem', border: '1px solid #dee2e6', boxShadow: '0 1px 0 #dee2e6', color: '#333' }}>E</kbd></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ color: '#495057' }}>삭제</span><kbd style={{ background: '#f8f9fa', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.7rem', border: '1px solid #dee2e6', boxShadow: '0 1px 0 #dee2e6', color: '#333' }}>D</kbd></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ color: '#495057' }}>실행취소</span><kbd style={{ background: '#f8f9fa', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.7rem', border: '1px solid #dee2e6', boxShadow: '0 1px 0 #dee2e6', color: '#333' }}>⌘Z</kbd></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ color: '#495057' }}>다시실행</span><kbd style={{ background: '#f8f9fa', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.7rem', border: '1px solid #dee2e6', boxShadow: '0 1px 0 #dee2e6', color: '#333' }}>⌘⇧Z</kbd></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ color: '#495057' }}>굵기 1~5</span><kbd style={{ background: '#f8f9fa', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.7rem', border: '1px solid #dee2e6', boxShadow: '0 1px 0 #dee2e6', color: '#333' }}>1-5</kbd></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ color: '#495057' }}>선택삭제</span><kbd style={{ background: '#f8f9fa', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.7rem', border: '1px solid #dee2e6', boxShadow: '0 1px 0 #dee2e6', color: '#333' }}>Del</kbd></div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.8rem', fontWeight: 600, color: '#2f9e44', textTransform: 'uppercase', letterSpacing: '0.5px' }}>💡 기능 및 팁</h4>
                                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.75rem', lineHeight: 1.6, color: '#495057', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <li><b>상세 설정</b>: 펜/도형/텍스트 도구를 <b>더블클릭</b>하여 설정 변경</li>
                                    <li><b>두 가지 지우개</b>: <span style={{ display: 'inline-flex', verticalAlign: 'text-bottom' }}><PixelEraserIcon /></span> 픽셀(부분 지우기) 및 <span style={{ display: 'inline-flex', verticalAlign: 'text-bottom' }}><ObjectEraserIcon /></span> 오브젝트(통째로 삭제) 지원</li>
                                    <li><b>배경 변경</b>: <span style={{ display: 'inline-flex', verticalAlign: 'text-bottom' }}><BackgroundIcon /></span> 버튼으로 줄/모눈/점 및 배경색상 변경</li>
                                    <li><b>길이 확장</b>: <span style={{ display: 'inline-flex', verticalAlign: 'text-bottom' }}><VerticalExpandIcon /></span> 버튼을 눌러 메모 공간을 아래로 계속 확장</li>
                                    <li><b>이미지 저장</b>: <FiDownload size={14} style={{ verticalAlign: 'text-bottom' }} /> 버튼으로 투명 배경 PNG 파일로 다운로드</li>
                                    <li><b>전체 지우기</b>: <FiTrash2 size={14} style={{ verticalAlign: 'text-bottom' }} /> 버튼으로 캔버스의 모든 내용 삭제</li>
                                    <li><b>취소/나가기</b>: <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', borderRadius: '50%', background: '#ffffff', border: '1px solid #ced4da', verticalAlign: 'text-bottom', margin: '0 2px' }}><FiX size={10} color="#333" /></span> 버튼으로 저장하지 않고 닫기</li>
                                    <li><b>저장/완료</b>: <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', borderRadius: '50%', background: '#333', border: '1px solid #333', verticalAlign: 'text-bottom', margin: '0 2px' }}><FiCheck size={10} color="#ffffff" /></span> 버튼으로 변경사항 저장하고 닫기</li>
                                </ul>
                            </div>
                        </div>
                        <CompactModalFooter>
                            <div />
                            <CompactModalButton onClick={() => setIsHelpOpen(false)} $variant="primary">
                                닫기
                            </CompactModalButton>
                        </CompactModalFooter>
                    </CompactModal>
                </Backdrop>
            )}

        </>
    );
};

