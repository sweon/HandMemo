import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiPlus, FiMinus, FiSettings, FiSun, FiMoon, FiSearch, FiX, FiRefreshCw, FiArrowUpCircle, FiPenTool } from 'react-icons/fi';
import { BsKeyboard } from 'react-icons/bs';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Tooltip } from '../UI/Tooltip';
import { SyncModal } from '../Sync/SyncModal';
import { Toast } from '../UI/Toast';
import { useTheme } from '../../contexts/ThemeContext';
import { useSearch } from '../../contexts/SearchContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { SidebarMemoItem } from './SidebarMemoItem';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { format } from 'date-fns';
import { ConfirmModal } from '../UI/ConfirmModal';
import pkg from '../../../package.json';

const SidebarContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  .spin {
    animation: spin 1s linear infinite;
  }
`;

const Header = styled.div`
  padding: 0.5rem 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 0.5rem 0.75rem;
  }
`;

const SearchInputWrapper = styled.div`
  position: relative;
  margin-bottom: 0.5rem;
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem 2rem 0.5rem 2rem;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  @media (max-width: 768px) {
    padding: 8px 32px 8px 32px;
    font-size: 14px;
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 50%;
  
  &:hover {
    color: ${({ theme }) => theme.colors.text};
    background-color: ${({ theme }) => theme.colors.surface};
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }

  @media (max-width: 768px) {
    padding: 6px 10px;
    font-size: 14px !important;
    max-height: 36px;
    min-width: 36px;
  }
`;

const TopActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
  overflow: hidden;

  @media (max-width: 768px) {
    gap: 2px;
    flex-wrap: nowrap;
    max-height: 44px;
  }
`;

const BookList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
  scrollbar-width: thin;

  /* Improve drag behavior on touch devices */
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 10px;
  }
`;

const IconButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  &:hover {
    background: ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text};
  }

  @media (max-width: 768px) {
    padding: 4px;
    /* Limit icon button size on mobile regardless of font size */
    width: 32px !important;
    height: 32px !important;
    max-width: 32px;
    max-height: 32px;
    
    svg {
      width: 18px !important;
      height: 18px !important;
    }
  }
`;

interface SidebarProps {
  onCloseMobile: (skipHistory?: boolean) => void;
}

const BrandHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1.25rem 0 1.25rem;
`;

const AppTitle = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  letter-spacing: -0.02em;

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const AppVersion = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 400;
  opacity: 0.8;
  font-variant-numeric: tabular-nums;
`;

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { searchQuery, setSearchQuery } = useSearch();
  const { t, language } = useLanguage();
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'title-asc'>('date-desc');

  const { mode, toggleTheme, increaseFontSize, decreaseFontSize, theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateCheckedManually, setUpdateCheckedManually] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, message: '', onConfirm: () => { } });
  const needRefreshRef = useRef(false);

  const handleSafeNavigation = (action: () => void) => {
    // With memo-first approach, we rarely need confirmation to switch unless we are in complex state.
    // Logic for unsaved changes is mostly in MemoDetail/Layout guard.
    // So we can simplify this or keep generic check.
    action();
  };

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: false,
    onRegistered(r) {
      console.log('SW Registered: ' + r)
    },
    onRegisterError(error) {
      console.log('SW registration error', error)
    },
  });

  useEffect(() => {
    needRefreshRef.current = needRefresh;
  }, [needRefresh]);

  const handleUpdateCheck = async () => {
    if (!updateCheckedManually) {
      setUpdateCheckedManually(true);
      setIsCheckingUpdate(true);
      if (needRefresh) {
        setIsCheckingUpdate(false);
        setToastMessage(t.sidebar.update_found);
        return;
      }
    }

    if (needRefresh) {
      setToastMessage(t.sidebar.install_update);
      setTimeout(() => {
        updateServiceWorker(true);
        setTimeout(() => window.location.reload(), 3000);
      }, 500);
      return;
    }

    if (isCheckingUpdate && updateCheckedManually) return;

    setIsCheckingUpdate(true);
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.update();

        setTimeout(() => {
          setIsCheckingUpdate(false);
          setUpdateCheckedManually(true);
          if (needRefreshRef.current) {
            setToastMessage(t.sidebar.update_found);
          } else {
            setToastMessage(t.sidebar.up_to_date);
          }
        }, 1500);
      } catch (error) {
        console.error('Error checking for updates:', error);
        setIsCheckingUpdate(false);
        setToastMessage(t.sidebar.check_failed);
      }
    } else {
      setIsCheckingUpdate(false);
      setToastMessage(t.sidebar.pwa_not_supported);
    }
  };

  const allMemos = useLiveQuery(() => db.memos.toArray());

  const sortedMemos = React.useMemo(() => {
    if (!allMemos) return [];
    let memos = [...allMemos];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (q.startsWith('tag:')) {
        const tagToSearch = q.slice(4).trim();
        if (tagToSearch) {
          memos = memos.filter(m =>
            m.tags && m.tags.some(t => t.toLowerCase().includes(tagToSearch))
          );
        }
      } else {
        memos = memos.filter(m =>
          m.title.toLowerCase().includes(q) ||
          m.content.toLowerCase().includes(q) ||
          (m.tags && m.tags.some(t => t.toLowerCase().includes(q)))
        );
      }
    }

    return memos.sort((a, b) => {
      if (sortBy === 'date-desc') return b.updatedAt.getTime() - a.updatedAt.getTime();
      if (sortBy === 'date-asc') return a.updatedAt.getTime() - b.updatedAt.getTime();
      if (sortBy === 'title-asc') return (a.title || '').localeCompare(b.title || '');
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });
  }, [allMemos, searchQuery, sortBy]);

  const showUpdateIndicator = needRefresh && updateCheckedManually;

  return (
    <SidebarContainer>
      <BrandHeader>
        <AppTitle>HandMemo</AppTitle>
        <AppVersion>v{pkg.version}</AppVersion>
      </BrandHeader>
      <Header>
        <TopActions>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <Button onClick={() => {
              handleSafeNavigation(() => {
                navigate(`/memo/new?drawing=true&t=${Date.now()}`, { replace: true, state: { isGuard: true } });
                onCloseMobile(true);
              });
            }} title={t.sidebar.add_memo || "Drawing Memo"}>
              <FiPenTool size={16} />
            </Button>
            <Button onClick={() => {
              handleSafeNavigation(() => {
                navigate(`/memo/new?t=${Date.now()}`, { replace: true, state: { isGuard: true } });
                onCloseMobile(true);
              });
            }} title="Text Memo">
              <BsKeyboard size={16} />
            </Button>
          </div>
          <div style={{ display: 'flex', gap: '0rem', alignItems: 'center', flexShrink: 1, minWidth: 0, overflow: 'hidden' }}>
            <Tooltip content={t.sidebar.decrease_font}>
              <IconButton onClick={decreaseFontSize}>
                <FiMinus size={16} />
              </IconButton>
            </Tooltip>
            <Tooltip content={t.sidebar.increase_font}>
              <IconButton onClick={increaseFontSize}>
                <FiPlus size={16} />
              </IconButton>
            </Tooltip>

            <Tooltip content={t.sidebar.sync_data}>
              <IconButton onClick={() => {
                setIsSyncModalOpen(true);
                onCloseMobile(true);
              }}>
                <FiRefreshCw size={18} />
              </IconButton>
            </Tooltip>

            <Tooltip content={showUpdateIndicator ? t.sidebar.install_update : t.sidebar.check_updates}>
              <IconButton
                onClick={handleUpdateCheck}
                style={{ position: 'relative' }}
              >
                <FiArrowUpCircle size={18} className={isCheckingUpdate ? 'spin' : ''} />
                {showUpdateIndicator && (
                  <span style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#ef4444',
                    border: '1px solid white'
                  }} />
                )}
              </IconButton>
            </Tooltip>

            <Tooltip content={mode === 'light' ? t.sidebar.switch_dark : t.sidebar.switch_light}>
              <IconButton onClick={toggleTheme}>
                {mode === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}
              </IconButton>
            </Tooltip>

            <Tooltip content={t.sidebar.settings}>
              <IconButton onClick={() => {
                handleSafeNavigation(() => {
                  navigate('/settings', { replace: true, state: { isGuard: true } });
                  onCloseMobile(true);
                });
              }}>
                <FiSettings size={18} />
              </IconButton>
            </Tooltip>
          </div>
        </TopActions>

        <SearchInputWrapper>
          <SearchIcon size={16} />
          <SearchInput
            placeholder={t.sidebar.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <ClearButton onClick={() => setSearchQuery('')}>
              <FiX size={14} />
            </ClearButton>
          )}
        </SearchInputWrapper>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              flex: 1,
              padding: window.innerWidth <= 768 ? '8px' : '0.5rem',
              fontSize: window.innerWidth <= 768 ? '14px' : 'inherit',
              borderRadius: '6px',
              border: `1px solid ${theme.colors.border}`,
              background: theme.colors.surface,
              color: theme.colors.text
            }}
          >
            <option value="date-desc">{t.sidebar.newest}</option>
            <option value="date-asc">{t.sidebar.oldest}</option>
            <option value="title-asc">Title (A-Z)</option>
          </select>
        </div>
      </Header>

      <BookList>
        <DragDropContext onDragEnd={() => { }}>
          <Droppable droppableId="sidebar-memos">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{ display: 'flex', flexDirection: 'column' }}
              >
                {sortedMemos?.map((memo, index) => (
                  <SidebarMemoItem
                    key={memo.id}
                    index={index}
                    memo={memo}
                    isActive={location.pathname.includes(`/memo/${memo.id}`)}
                    onClick={onCloseMobile}
                    formatDate={(date) => format(date, language === 'ko' ? 'yyyy.MM.dd' : 'MMM d, yyyy')}
                    untitledText={t.sidebar.untitled}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </BookList>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
      <SyncModal isOpen={isSyncModalOpen} onClose={() => setIsSyncModalOpen(false)} />
      {
        toastMessage && (
          <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
        )
      }

    </SidebarContainer >
  );
};
