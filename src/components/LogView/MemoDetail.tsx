import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { useSearch } from '../../contexts/SearchContext';
import { useLanguage } from '../../contexts/LanguageContext';

import { MarkdownEditor } from '../Editor/MarkdownEditor';
import { MarkdownView } from '../Editor/MarkdownView';
import { FiEdit2, FiTrash2, FiSave, FiX, FiShare2, FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';
import { CommentsSection } from './CommentsSection';
import { ShareModal } from '../Sync/ShareModal';
import { DeleteChoiceModal } from './DeleteChoiceModal';
import { FabricCanvasModal } from '../Editor/FabricCanvasModal';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0;
  width: 100%;
`;

const Header = styled.div`
  margin: 24px 32px 0 32px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-bottom: 0.25rem;

  @media (max-width: 768px) {
    margin: 16px 8px 0 8px;
  }
`;

const ContentPadding = styled.div`
  padding: 0 32px;

  @media (max-width: 768px) {
    padding: 0 4px;
  }
`;

const CommentsWrapper = styled.div`
  padding: 0 32px;

  @media (max-width: 768px) {
    padding: 0 4px;
  }
`;

const TitleInput = styled.input`
  font-size: 2rem;
  font-weight: 700;
  width: 100%;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 0.5rem;
  
  &:focus {
    outline: none;
    border-bottom: 2px solid ${({ theme }) => theme.colors.primary};
  }
`;

const TitleDisplay = styled.h1`
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
  color: ${({ theme }) => theme.colors.text};
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
  flex-wrap: wrap;
`;

const TagInput = styled.input`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
`;



const DateInput = styled.input`
    background: ${({ theme }) => theme.colors.surface};
    border: 1px solid ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text};
    padding: 0.25rem 2.2rem 0.25rem 0.5rem;
    border-radius: 4px;
    width: 210px;
`;

const InputWrapper = styled.div`
    position: relative;
    display: flex;
    align-items: center;
`;

const CalendarIconButton = styled(FiCalendar)`
    position: absolute;
    right: 8px;
    color: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
    font-size: 1.1rem;
    stroke-width: 2.5;
`;





const ActionBar = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'danger' }>`
  display: flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme, $variant }) =>
        $variant === 'primary' ? theme.colors.primary :
            $variant === 'danger' ? theme.colors.surface : theme.colors.surface};
  color: ${({ theme, $variant }) =>
        $variant === 'primary' ? '#fff' :
            $variant === 'danger' ? theme.colors.danger : theme.colors.text};
  cursor: pointer;
  font-weight: 500;
  font-size: 0.75rem;

  &:hover {
    background: ${({ theme, $variant }) =>
        $variant === 'primary' ? theme.colors.primaryHover : theme.colors.border};
  }
`;

const formatDateForInput = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

import { useExitGuard, ExitGuardResult } from '../../contexts/ExitGuardContext';
import { Toast } from '../UI/Toast';
import { FiAlertTriangle } from 'react-icons/fi';

export const MemoDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { setSearchQuery } = useSearch();
    const { t, language } = useLanguage();
    const isNew = !id;

    // Guard Hook
    const { registerGuard, unregisterGuard } = useExitGuard();
    const [showExitToast, setShowExitToast] = useState(false);
    const lastBackPress = useRef(0);
    const isClosingRef = useRef(false);

    // Internal editing state
    const [isEditingInternal, setIsEditingInternal] = useState(isNew);

    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isFabricModalOpen, setIsFabricModalOpen] = useState(false);

    const startEditing = () => {
        setIsEditingInternal(true);
        window.history.pushState({ editing: true }, '');
    };

    const stopEditing = () => {
        isClosingRef.current = true;
        window.history.back(); // Trigger guard -> allow
    };

    useEffect(() => {
        if (isEditingInternal) {
            const guardId = 'memo-edit-guard';
            registerGuard(guardId, () => {
                // If any modal is open, let its own guard handle the back navigation
                if (isFabricModalOpen || isShareModalOpen || isDeleteModalOpen) {
                    return ExitGuardResult.CONTINUE;
                }

                if (isClosingRef.current) {
                    setIsEditingInternal(false);
                    return ExitGuardResult.ALLOW_NAVIGATION;
                }

                const now = Date.now();
                if (now - lastBackPress.current < 2000) {
                    isClosingRef.current = true;
                    setIsEditingInternal(false);
                    return ExitGuardResult.ALLOW_NAVIGATION;
                } else {
                    lastBackPress.current = now;
                    setShowExitToast(true);
                    return ExitGuardResult.PREVENT_NAVIGATION;
                }
            });

            return () => unregisterGuard(guardId);
        }
    }, [isEditingInternal, registerGuard, unregisterGuard, isFabricModalOpen, isShareModalOpen, isDeleteModalOpen]);

    const isEditing = isEditingInternal;
    const setIsEditing = (val: boolean) => {
        if (val === isEditingInternal) return;
        if (val) startEditing();
        else stopEditing();
    };

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [date, setDate] = useState('');




    const isDrawingMemo = content.trim().startsWith('```fabric');

    const memo = useLiveQuery(
        () => (id ? db.memos.get(Number(id)) : undefined),
        [id]
    );

    useEffect(() => {
        const shouldEdit = searchParams.get('edit') === 'true';

        if (memo) {
            setTitle(memo.title);
            setContent(memo.content);
            setTags(memo.tags.join(', '));

            setDate(language === 'ko' ? format(memo.createdAt, 'yyyy. MM. dd.') : formatDateForInput(memo.createdAt));
            setIsEditing(shouldEdit);
        } else if (isNew) {
            setTitle('');
            setContent('');
            setTags('');

            setDate(language === 'ko' ? format(new Date(), 'yyyy. MM. dd.') : formatDateForInput(new Date()));
            setIsEditing(true);

            // Auto-open drawing if requested
            if (searchParams.get('drawing') === 'true') {
                setIsFabricModalOpen(true);
            }
        }
    }, [memo, isNew, searchParams]);

    const handleSave = async () => {
        const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
        const now = new Date();
        let finalTitle = title.trim();
        let finalType: 'normal' | 'progress' = 'normal';

        const hasTitle = !!finalTitle;
        const hasContent = !!content.trim();

        if (!hasTitle && !hasContent) return;

        if (!hasTitle) {
            const contentText = content.trim();

            if (contentText) {
                // Filter out markdown code blocks (like ```fabric ... ```) for title generation
                const filteredText = contentText
                    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
                    .trim();

                if (filteredText) {
                    finalTitle = filteredText.slice(0, 30) + (filteredText.length > 30 ? '...' : '');
                } else {
                    finalTitle = t.memo_detail.untitled;
                }
            } else {
                finalTitle = t.memo_detail.untitled;
            }
            finalType = 'normal';
        } else {
            finalType = 'normal';
        }

        let memoCreatedAt: Date;
        if (language === 'ko' && /^\d{4}\.\s*\d{1,2}\.\s*\d{1,2}\.?$/.test(date)) {
            const parts = date.split('.').map(s => s.trim()).filter(Boolean);
            memoCreatedAt = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            const oldDate = memo?.createdAt || new Date();
            memoCreatedAt.setHours(oldDate.getHours(), oldDate.getMinutes(), oldDate.getSeconds());
        } else {
            memoCreatedAt = new Date(date + 'T' + format(memo?.createdAt || new Date(), 'HH:mm:ss'));
        }

        if (isNaN(memoCreatedAt.getTime())) {
            memoCreatedAt = new Date();
        }

        if (id) {
            await db.memos.update(Number(id), {
                title: finalTitle,
                content,
                tags: tagArray,
                createdAt: memoCreatedAt,
                updatedAt: now,
                type: finalType
            });

            if (searchParams.get('edit')) {
                navigate(`/memo/${id}`, { replace: true });
            }
            setIsEditing(false);
        } else {
            const newId = await db.memos.add({
                // bookId is optional now
                title: finalTitle,
                content,
                tags: tagArray,
                createdAt: memoCreatedAt,
                updatedAt: now,
                type: finalType
            });

            navigate(`/memo/${newId}`);
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        setIsDeleteModalOpen(true);
    };

    const performDeleteMemoOnly = async () => {
        if (!id) return;

        await db.memos.delete(Number(id));
        await db.comments.where('memoId').equals(Number(id)).delete();

        setIsDeleteModalOpen(false);
        navigate('/', { replace: true });
    };

    if (!isNew && !memo) return <Container>{t.memo_detail.loading}</Container>;

    return (
        <Container>
            <Header>
                {isEditing ? (
                    <TitleInput
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder={t.memo_detail.title_placeholder}
                    />
                ) : (
                    <TitleDisplay>{memo?.title}</TitleDisplay>
                )}

                <MetaRow>
                    {isEditing ? (
                        <>


                            <InputWrapper>
                                <DateInput
                                    type={language === 'ko' ? 'text' : 'date'}
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    placeholder={language === 'ko' ? 'YYYY. MM. DD.' : undefined}
                                />
                                <CalendarIconButton
                                    onClick={() => {
                                        const picker = document.getElementById('memo-date-picker');
                                        if (picker) (picker as any).showPicker?.() || picker.click();
                                    }}
                                />
                                <input
                                    id="memo-date-picker"
                                    type="date"
                                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                                    onChange={(e) => {
                                        const d = new Date(e.target.value);
                                        if (!isNaN(d.getTime())) {
                                            setDate(language === 'ko' ? format(d, 'yyyy. MM. dd.') : formatDateForInput(d));
                                        }
                                    }}
                                />
                            </InputWrapper>

                            <TagInput
                                value={tags}
                                style={{ flex: 1 }}
                                onChange={e => setTags(e.target.value)}
                                placeholder={t.memo_detail.tags_placeholder}
                            />
                        </>
                    ) : (
                        <>
                            <span>{memo && format(memo.createdAt, language === 'ko' ? 'yyyy년 M월 d일' : 'MMM d, yyyy')}</span>
                            {memo?.tags.map(t => (
                                <span
                                    key={t}
                                    onClick={() => setSearchQuery(`tag:${t}`)}
                                    style={{
                                        background: '#eee',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        color: '#333',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {t}
                                </span>
                            ))}
                        </>
                    )}
                </MetaRow>



                <ActionBar>
                    {isEditing ? (
                        <>
                            <ActionButton
                                $variant="primary"
                                onClick={handleSave}
                                disabled={!title.trim() && !content.trim()}
                                style={{
                                    opacity: (!title.trim() && !content.trim()) ? 0.5 : 1,
                                    cursor: (!title.trim() && !content.trim()) ? 'not-allowed' : 'pointer'
                                }}
                            >
                                <FiSave size={12} /> {t.memo_detail.save}
                            </ActionButton>
                            {!isNew && (
                                <>
                                    <ActionButton $variant="danger" onClick={handleDelete}>
                                        <FiTrash2 size={12} /> {t.memo_detail.delete}
                                    </ActionButton>
                                    <ActionButton onClick={() => {
                                        if (searchParams.get('edit')) {
                                            navigate(`/memo/${id}`, { replace: true });
                                        }
                                        setIsEditing(false);
                                    }}>
                                        <FiX size={12} /> {t.memo_detail.cancel}
                                    </ActionButton>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <ActionButton onClick={() => setIsEditing(true)}>
                                <FiEdit2 size={12} /> {t.memo_detail.edit}
                            </ActionButton>
                            <ActionButton $variant="danger" onClick={handleDelete}>
                                <FiTrash2 size={12} /> {t.memo_detail.delete}
                            </ActionButton>
                            <ActionButton onClick={() => setIsShareModalOpen(true)}>
                                <FiShare2 size={12} /> {t.memo_detail.share_memo}
                            </ActionButton>
                        </>
                    )}
                </ActionBar>
            </Header>

            {isEditing ? (
                <ContentPadding>
                    <MarkdownEditor value={content} onChange={setContent} />
                </ContentPadding>
            ) : (
                <>
                    {isDrawingMemo ? (
                        <ContentPadding>
                            <div
                                style={{ cursor: 'pointer' }}
                                onClick={() => setIsFabricModalOpen(true)}
                            >
                                <MarkdownView content={content} />
                            </div>
                        </ContentPadding>
                    ) : (
                        <ContentPadding>
                            <MarkdownView content={content} />
                        </ContentPadding>
                    )}
                    <CommentsWrapper>
                        {!isNew && memo && <CommentsSection memoId={memo.id!} />}
                    </CommentsWrapper>
                </>
            )}

            {!isNew && memo && (
                <ShareModal
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                    memoId={memo.id!}
                    memoTitle={memo.title}
                />
            )}

            {isDeleteModalOpen && (
                <DeleteChoiceModal
                    onClose={() => setIsDeleteModalOpen(false)}
                    onDeleteMemoOnly={performDeleteMemoOnly}
                    onDeleteThread={() => performDeleteMemoOnly()}
                    isThreadHead={false}
                />
            )}

            {showExitToast && (
                <Toast
                    variant="warning"
                    position="bottom"
                    icon={<FiAlertTriangle size={14} />}
                    message={t.android?.exit_warning || "Press back again to exit editing."}
                    onClose={() => setShowExitToast(false)}
                />
            )}

            {isFabricModalOpen && (
                <FabricCanvasModal
                    initialData={(() => {
                        const match = content.match(/```fabric\s*([\s\S]*?)\s*```/);
                        return match ? match[1] : undefined;
                    })()}
                    onSave={async (json) => {
                        const newContent = `\`\`\`fabric\n${json}\n\`\`\``;
                        setContent(newContent);

                        // Auto-save if viewing existing memo
                        if (id && memo) {
                            await db.memos.update(Number(id), {
                                content: newContent,
                                updatedAt: new Date()
                            });
                        }

                        setIsFabricModalOpen(false);
                    }}
                    onClose={() => setIsFabricModalOpen(false)}
                />
            )}
        </Container>
    );
};
