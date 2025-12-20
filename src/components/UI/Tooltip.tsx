import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    delay?: number; // Delay for long press in ms
}

const TooltipWrapper = styled.div`
  position: relative;
  display: inline-flex;
`;

const TooltipBox = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
  padding: 6px 10px;
  background-color: ${({ theme }) => theme.colors.text}; // Inverted contrast
  color: ${({ theme }) => theme.colors.background};
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
  pointer-events: none;
  z-index: 1000;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);

  &.visible {
    opacity: 1;
    visibility: visible;
  }

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -4px;
    border-width: 4px;
    border-style: solid;
    border-color: ${({ theme }) => theme.colors.text} transparent transparent transparent;
  }
`;

export const Tooltip: React.FC<TooltipProps> = ({ content, children, delay = 500 }) => {
    const [isVisible, setIsVisible] = useState(false);
    const timerRef = useRef<number | null>(null);

    const showTooltip = () => setIsVisible(true);
    const hideTooltip = () => {
        setIsVisible(false);
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    const handleTouchStart = () => {
        timerRef.current = window.setTimeout(() => {
            setIsVisible(true);
        }, delay);
    };

    const handleTouchEnd = () => {
        // Prevent default click if long press triggered tooltip? 
        // Usually we want to just show tooltip and maybe not trigger click if it was a LONG press meant for inspection.
        // But for now, let's just clear timer.
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        // Hide after a brief delay so user can see it
        if (isVisible) {
            setTimeout(() => setIsVisible(false), 1500);
        }
    };

    // Cleanup
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    return (
        <TooltipWrapper
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onContextMenu={(e) => {
                // If tooltip is visible (likely from long press), prevent context menu
                if (isVisible) e.preventDefault();
            }}
        >
            {children}
            <TooltipBox className={isVisible ? 'visible' : ''}>
                {content}
            </TooltipBox>
        </TooltipWrapper>
    );
};
