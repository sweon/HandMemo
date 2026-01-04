import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import type { Book } from '../../db';
import { FiBook } from 'react-icons/fi';

const ItemContainer = styled(NavLink) <{ $isActive?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  margin-bottom: 0.25rem;
  border-radius: 8px;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme, $isActive }) => $isActive ? theme.colors.surface : 'transparent'};
  border: 1px solid ${({ theme, $isActive }) => $isActive ? theme.colors.border : 'transparent'};
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
  }

  &.active {
    background: ${({ theme }) => theme.colors.surface};
    border-color: ${({ theme }) => theme.colors.border};
    font-weight: 500;
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primary};
  opacity: 0.8;
`;

const Info = styled.div`
  flex: 1;
  overflow: hidden;
`;

const Title = styled.div`
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.15rem;
`;

const Meta = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatusDot = styled.div<{ $status: string }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: ${({ $status, theme }) =>
        $status === 'completed' ? theme.colors.success :
            $status === 'reading' ? theme.colors.primary : theme.colors.border};
`;

interface Props {
    book: Book;
    onClick?: () => void;
}

export const SidebarBookItem: React.FC<Props> = ({ book, onClick }) => {
    const progressPercent = book.totalPages > 0
        ? Math.round(((book.currentPage || 0) / book.totalPages) * 100)
        : 0;

    return (
        <ItemContainer to={`/book/${book.id}`} onClick={onClick}>
            <IconWrapper>
                <FiBook size={18} />
            </IconWrapper>
            <Info>
                <Title>{book.title}</Title>
                <Meta>
                    <StatusDot $status={book.status} />
                    <span>{progressPercent}%</span>
                </Meta>
            </Info>
        </ItemContainer>
    );
};
