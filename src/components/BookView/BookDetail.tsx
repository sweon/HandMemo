import React from 'react';
import styled from 'styled-components';
import { useLiveQuery } from 'dexie-react-hooks';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../db';
import { useLanguage } from '../../contexts/LanguageContext';
import { FiEdit3, FiTrash2 } from 'react-icons/fi';
import { format } from 'date-fns';

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;

const Header = styled.div`
  padding: 2rem;
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const BookTitle = styled.h1`
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const MetaInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
`;

const ProgressSection = styled.div`
  margin-top: 1rem;
`;

const ProgressBar = styled.div<{ $percent: number }>`
  height: 8px;
  background: ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  margin-top: 0.5rem;
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.$percent}%;
    background: ${({ theme }) => theme.colors.primary};
    transition: width 0.3s ease;
  }
`;

const MemoListSection = styled.div`
  padding: 2rem;
  flex: 1;
`;

const MemoCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Quote = styled.div`
  font-style: italic;
  color: ${({ theme }) => theme.colors.textSecondary};
  border-left: 3px solid ${({ theme }) => theme.colors.primary};
  padding-left: 1rem;
  margin-bottom: 1rem;
  line-height: 1.6;
`;

const MemoContent = styled.div`
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.6;
`;

const PageMeta = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 0.5rem;
  font-weight: 500;
  display: flex;
  justify-content: space-between;
`;

const ActionButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    opacity: 0.9;
  }
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
`;

export const BookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const book = useLiveQuery(() => db.books.get(Number(id)), [id]);
  const memos = useLiveQuery(() =>
    db.memos
      .where('bookId')
      .equals(Number(id))
      .reverse()
      .sortBy('createdAt')
    , [id]);

  if (!book) return <div style={{ padding: '2rem' }}>{t.memo_detail.loading}</div>;

  const progressPercent = Math.round(((book.currentPage || 0) / book.totalPages) * 100);

  const sortedMemos = memos?.sort((a, b) => {
    // Sort by page number (asc), then by creation date (desc)
    if ((a.pageNumber || 0) !== (b.pageNumber || 0)) {
      return (a.pageNumber || 0) - (b.pageNumber || 0);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleDelete = async () => {
    if (confirm(t.book_detail.confirm_delete)) {
      // Delete associated memos first
      const associatedMemos = await db.memos.where('bookId').equals(book.id!).toArray();
      await db.memos.bulkDelete(associatedMemos.map(m => m.id!));
      await db.books.delete(book.id!);
      navigate('/');
    }
  };

  return (
    <Container>
      <Header>
        <BookTitle>{book.title}</BookTitle>
        <MetaInfo>
          <span>{book.author || t.book_detail.unknown_author}</span>
          <span>•</span>
          <span>{t.book_detail.started} {format(book.startDate, 'MMM d, yyyy')}</span>
        </MetaInfo>

        <ProgressSection>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
            <span>{t.book_detail.progress}</span>
            <span>{book.currentPage || 0} / {book.totalPages} p ({progressPercent}%)</span>
          </div>
          <ProgressBar $percent={progressPercent} />
        </ProgressSection>

        <ButtonGroup>
          <ActionButton onClick={() => navigate(`/book/${book.id}/new`)}>
            <FiEdit3 /> {t.book_detail.write_memo}
          </ActionButton>
          <ActionButton style={{ background: '#ef4444' }} onClick={handleDelete}>
            <FiTrash2 /> {t.book_detail.delete_book}
          </ActionButton>
        </ButtonGroup>
      </Header>

      <MemoListSection>
        {sortedMemos && sortedMemos.map(memo => (
          <MemoCard key={memo.id} onClick={() => navigate(`/memo/${memo.id}`)}>
            <PageMeta>
              <span>{memo.pageNumber ? `${t.book_detail.page} ${memo.pageNumber}` : t.book_detail.whole_book}</span>
              <span>{format(memo.createdAt, 'HH:mm • MMM d')}</span>
            </PageMeta>
            {memo.quote && <Quote>“{memo.quote}”</Quote>}
            <MemoContent>{memo.title}</MemoContent>
          </MemoCard>
        ))}

        {(!sortedMemos || sortedMemos.length === 0) && (
          <div style={{ textAlign: 'center', color: '#999', marginTop: '2rem' }}>
            {t.book_detail.start_reading}
          </div>
        )}
      </MemoListSection>
    </Container>
  );
};
