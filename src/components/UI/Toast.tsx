import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const fadeInOut = keyframes`
  0% { opacity: 0; transform: translate(-50%, 30px) scale(0.9); }
  10% { opacity: 1; transform: translate(-50%, 0) scale(1.05); }
  15% { opacity: 1; transform: translate(-50%, 0) scale(1); }
  85% { opacity: 1; transform: translate(-50%, 0) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -20px) scale(0.9); }
`;

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2), 0 0 0px rgba(245, 158, 11, 0); }
  50% { transform: scale(1.02); box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2), 0 0 15px rgba(245, 158, 11, 0.4); }
  100% { transform: scale(1); box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2), 0 0 0px rgba(245, 158, 11, 0); }
`;

const ToastContainer = styled.div<{ $variant?: 'default' | 'warning' | 'danger'; $centered?: boolean }>`
  position: fixed;
  ${({ $centered }) => $centered
    ? `top: 50%; left: 50%; transform: translate(-50%, -50%);`
    : `bottom: 100px; left: 50%; transform: translateX(-50%);`}
  
  background: ${({ $variant }) =>
    $variant === 'warning' ? '#f59e0b' :
      $variant === 'danger' ? '#ef4444' :
        'rgba(0, 0, 0, 0.9)'};
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  z-index: 10000;
  pointer-events: none;
  white-space: nowrap;
  animation: ${fadeInOut} 2.5s cubic-bezier(0.4, 0, 0.2, 1) forwards,
             ${({ $variant }) => $variant === 'warning' ? pulse : 'none'} 1.5s ease-in-out infinite;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  gap: 8px;
`;

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
  variant?: 'default' | 'warning' | 'danger';
  icon?: React.ReactNode;
  centered?: boolean;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose, duration = 2500, variant = 'default', icon, centered }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <ToastContainer $variant={variant} $centered={centered}>
      {icon}
      {message}
    </ToastContainer>
  );
};
