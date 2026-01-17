import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const slideInUp = keyframes`
  0% { opacity: 0; transform: translate(-50%, 20px) scale(0.95); }
  100% { opacity: 1; transform: translate(-50%, 0) scale(1); }
`;

const slideOutUp = keyframes`
  0% { opacity: 1; transform: translate(-50%, 0) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -10px) scale(0.95); }
`;

const ToastContainer = styled.div<{ $variant?: 'default' | 'warning' | 'danger'; $position?: 'bottom' | 'centered' | 'left-centered'; $isExiting: boolean }>`
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  
  ${({ $position }) => {
    if ($position === 'centered') return `top: 50%; transform: translate(-50%, -50%);`;
    if ($position === 'left-centered') return `top: 50%; left: 16px; transform: translateY(-50%);`;
    return `bottom: 80px;`;
  }}
  
  background: ${({ theme, $variant }) =>
    $variant === 'warning' ? 'rgba(245, 158, 11, 0.95)' :
      $variant === 'danger' ? 'rgba(239, 68, 68, 0.95)' :
        'rgba(31, 41, 55, 0.95)'};
  color: white;
  padding: 10px 20px;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 500;
  z-index: 10000;
  pointer-events: none;
  text-align: center;
  white-space: nowrap;
  max-width: 90vw;
  animation: ${({ $isExiting }) => $isExiting ? slideOutUp : slideInUp} 0.3s cubic-bezier(0.2, 0, 0, 1) forwards;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    flex-shrink: 0;
  }
`;

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
  variant?: 'default' | 'warning' | 'danger';
  icon?: React.ReactNode;
  position?: 'bottom' | 'centered' | 'left-centered';
}

export const Toast: React.FC<ToastProps> = ({ message, onClose, duration = 3000, variant = 'default', icon, position = 'bottom' }) => {
  const [isExiting, setIsExiting] = React.useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <ToastContainer $variant={variant} $position={position} $isExiting={isExiting}>
      {icon}
      <span>{message}</span>
    </ToastContainer>
  );
};
