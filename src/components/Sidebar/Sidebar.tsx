import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Memo } from '../../db';
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
import { DragDropContext, Droppable, type DropResult } from '@hello-pangea/dnd';
import { v4 as uuidv4 } from 'uuid';
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
  justify-content: flex-start;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
  overflow: hidden;

  @media (max-width: 768px) {
    gap: 0.25rem;
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
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'title-asc' | 'last-edited' | 'last-commented'>(() => {
    return (localStorage.getItem('sidebar_sortBy') as any) || 'last-edited';
  });

  useEffect(() => {
    localStorage.setItem('sidebar_sortBy', sortBy);
  }, [sortBy]);

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
  const [collapsedThreads, setCollapsedThreads] = useState<Set<string>>(new Set());

  const toggleThread = (id: string) => {
    setCollapsedThreads(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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
    onRegistered() {
      console.log('SW Registered');
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
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
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();

          // Small delay to let the hook catch up
          await new Promise(resolve => setTimeout(resolve, 1500));

          if (registration.waiting || needRefreshRef.current) {
            setToastMessage(t.sidebar.update_found);
          } else {
            setToastMessage(t.sidebar.up_to_date);
          }
        } else {
          setToastMessage(t.sidebar.check_failed);
        }
        setIsCheckingUpdate(false);
        setUpdateCheckedManually(true);
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
  const allComments = useLiveQuery(() => db.comments.toArray());

  const lastCommentMap = React.useMemo(() => {
    const map: Record<number, number> = {};
    if (!allComments) return map;
    allComments.forEach(c => {
      const time = c.updatedAt?.getTime() || c.createdAt.getTime();
      if (!map[c.memoId] || time > map[c.memoId]) {
        map[c.memoId] = time;
      }
    });
    return map;
  }, [allComments]);

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
      if (sortBy === 'date-desc') return b.createdAt.getTime() - a.createdAt.getTime();
      if (sortBy === 'date-asc') return a.createdAt.getTime() - b.createdAt.getTime();
      if (sortBy === 'title-asc') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'last-edited') return b.updatedAt.getTime() - a.updatedAt.getTime();
      if (sortBy === 'last-commented') {
        const aLast = lastCommentMap[a.id!] || 0;
        const bLast = lastCommentMap[b.id!] || 0;
        if (aLast !== bLast) return bLast - aLast;
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      }
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });
  }, [allMemos, searchQuery, sortBy]);

  const groupedItems = React.useMemo(() => {
    if (!sortedMemos || !allMemos) return [];

    const items: Array<{
      type: 'memo';
      memo: Memo;
      isThreadHead?: boolean;
      isThreadChild?: boolean;
      threadId?: string;
      childCount?: number;
    }> = [];
    const processedMemos = new Set<number>();

    sortedMemos.forEach(memo => {
      if (processedMemos.has(memo.id!)) return;

      if (memo.threadId) {
        // Find all memos in this thread
        const threadMemos = allMemos.filter(m => m.threadId === memo.threadId)
          .sort((a, b) => (a.threadOrder || 0) - (b.threadOrder || 0));

        if (threadMemos.length > 1) {
          const isCollapsed = collapsedThreads.has(memo.threadId);
          // Header
          items.push({
            type: 'memo',
            memo: threadMemos[0],
            isThreadHead: true,
            threadId: memo.threadId,
            childCount: threadMemos.length - 1
          });
          processedMemos.add(threadMemos[0].id!);

          if (!isCollapsed) {
            // Children
            for (let i = 1; i < threadMemos.length; i++) {
              items.push({
                type: 'memo',
                memo: threadMemos[i],
                isThreadChild: true,
                threadId: memo.threadId
              });
              processedMemos.add(threadMemos[i].id!);
            }
          } else {
            // Skip children in processed set so we don't render them separately
            threadMemos.slice(1).forEach(tm => processedMemos.add(tm.id!));
          }
        } else {
          items.push({ type: 'memo', memo });
          processedMemos.add(memo.id!);
        }
      } else {
        items.push({ type: 'memo', memo });
        processedMemos.add(memo.id!);
      }
    });

    return items;
  }, [sortedMemos, allMemos, collapsedThreads]);

  const onDragEnd = async (result: DropResult) => {
    const { combine, draggableId, destination } = result;

    // Handle Combining (Joining Threads)
    if (combine) {
      const sourceId = parseInt(draggableId);
      const targetId = parseInt(combine.draggableId);

      if (isNaN(sourceId) || isNaN(targetId)) return;
      if (sourceId === targetId) return;

      const sourceMemo = await db.memos.get(sourceId);
      const targetMemo = await db.memos.get(targetId);

      if (!sourceMemo || !targetMemo) return;

      const newThreadId = targetMemo.threadId || uuidv4();

      if (!targetMemo.threadId) {
        await db.memos.update(targetId, {
          threadId: newThreadId,
          threadOrder: 0
        });
      }

      if (sourceMemo.threadId && sourceMemo.threadId !== newThreadId) {
        const sourceThreadMemos = await db.memos.where('threadId').equals(sourceMemo.threadId).toArray();
        const targetThreadMemos = await db.memos.where('threadId').equals(newThreadId).toArray();
        let maxOrder = Math.max(...targetThreadMemos.map(m => m.threadOrder || 0), -1);

        for (const sm of sourceThreadMemos) {
          maxOrder++;
          await db.memos.update(sm.id!, {
            threadId: newThreadId,
            threadOrder: maxOrder
          });
        }
      } else {
        const targetThreadMemos = await db.memos.where('threadId').equals(newThreadId).toArray();
        const maxOrder = Math.max(...targetThreadMemos.map(m => m.threadOrder || 0), -1);
        await db.memos.update(sourceId, {
          threadId: newThreadId,
          threadOrder: maxOrder + 1
        });
      }
      return;
    }

    // Handle Reordering / Extraction
    if (!destination) return;

    const sourceMemoId = parseInt(draggableId);
    if (isNaN(sourceMemoId)) return;

    const sourceMemo = await db.memos.get(sourceMemoId);
    if (!sourceMemo) return;

    const sourceIndex = result.source.index;
    const destIndex = destination.index;
    if (sourceIndex === destIndex) return;

    const items = groupedItems;
    const targetItem = items[destIndex];
    if (!targetItem) return;

    // Generic "Sort Reordering" using updatedAt calculation
    let newTime: number;
    if (destIndex === 0) {
      newTime = items[0].memo.updatedAt.getTime() + 60000; // 1 min later
    } else if (destIndex === items.length - 1) {
      newTime = items[items.length - 1].memo.updatedAt.getTime() - 60000;
    } else {
      const beforeIndex = destIndex < sourceIndex ? destIndex - 1 : destIndex;
      const afterIndex = destIndex < sourceIndex ? destIndex : destIndex + 1;

      const t1 = items[beforeIndex].memo.updatedAt.getTime();
      const t2 = items[afterIndex].memo.updatedAt.getTime();
      newTime = (t1 + t2) / 2;
    }

    // Pattern: Drag child and drop ABOVE its own header or BELOW its own thread block -> Extract
    if (sourceMemo.threadId) {
      const headerItem = items.find(it => it.isThreadHead && it.threadId === sourceMemo.threadId);
      if (headerItem) {
        const headerIdx = items.indexOf(headerItem);
        // If moved above the header, extract
        if (destIndex <= headerIdx) {
          await db.memos.update(sourceMemoId, {
            threadId: undefined,
            threadOrder: undefined,
            updatedAt: new Date(newTime)
          });
          return;
        }

        // If moved far below the thread (past all siblings), extract
        const threadMemos = items.filter(it => it.threadId === sourceMemo.threadId);
        const lastThreadIdx = items.indexOf(threadMemos[threadMemos.length - 1]);
        if (destIndex > lastThreadIdx) {
          await db.memos.update(sourceMemoId, {
            threadId: undefined,
            threadOrder: undefined,
            updatedAt: new Date(newTime)
          });
          return;
        }
      }
    }

    await db.memos.update(sourceMemoId, { updatedAt: new Date(newTime) });
  };

  const showUpdateIndicator = needRefresh && updateCheckedManually;

  return (
    <SidebarContainer>
      <BrandHeader>
        <AppTitle>HandMemo</AppTitle>
        <AppVersion>v{pkg.version}</AppVersion>
      </BrandHeader>
      <Header>
        <TopActions>
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
            <option value="last-edited">{t.sidebar.last_memoed}</option>
            <option value="last-commented">{t.sidebar.last_commented}</option>
            <option value="date-desc">{t.sidebar.newest}</option>
            <option value="date-asc">{t.sidebar.oldest}</option>
            <option value="title-asc">Title (A-Z)</option>
          </select>
        </div>
      </Header>

      <BookList>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="sidebar-memos" isCombineEnabled>
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{ display: 'flex', flexDirection: 'column' }}
              >
                {groupedItems.map((item, index) => (
                  <SidebarMemoItem
                    key={item.memo.id}
                    index={index}
                    memo={item.memo}
                    isActive={location.pathname.includes(`/memo/${item.memo.id}`)}
                    onClick={onCloseMobile}
                    formatDate={(date) => format(date, language === 'ko' ? 'yyyy.MM.dd' : 'MMM d, yyyy')}
                    untitledText={t.sidebar.untitled}
                    inThread={item.isThreadChild}
                    isThreadHead={item.isThreadHead}
                    childCount={item.childCount}
                    collapsed={collapsedThreads.has(item.threadId || '')}
                    onToggle={toggleThread}
                    threadId={item.threadId}
                    collapseText={t.sidebar.collapse}
                    moreText={t.sidebar.more_memos}
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
