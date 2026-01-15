import React from 'react';
import type { Memo } from '../../db';
import { MemoItemLink, MemoTitle, MemoDate, ThreadToggleBtn } from './itemStyles';
import { TouchDelayDraggable } from './TouchDelayDraggable';
import { FiCornerDownRight } from 'react-icons/fi';

interface Props {
    memo: Memo;
    index: number;
    isActive: boolean;
    onClick?: (skipHistory?: boolean) => void;
    formatDate: (date: Date) => string;
    inThread?: boolean;
    untitledText: string;
    isThreadHead?: boolean;
    childCount?: number;
    collapsed?: boolean;
    onToggle?: (id: string) => void;
    threadId?: string;
    collapseText?: string;
    moreText?: string;
}

export const SidebarMemoItem: React.FC<Props> = ({
    memo,
    index,
    isActive,
    onClick,
    formatDate,
    inThread,
    untitledText,
    isThreadHead,
    childCount,
    collapsed,
    onToggle,
    threadId,
    collapseText,
    moreText
}) => {
    // We always use the numeric memo ID as the draggable key for stability in flat lists
    const draggableId = String(memo.id);

    return (
        <TouchDelayDraggable draggableId={draggableId} index={index}>
            {(provided: any, snapshot: any) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                        ...provided.draggableProps.style,
                        marginBottom: '2px',
                        opacity: snapshot.isDragging ? 0.8 : 1,
                        transition: 'background-color 0.1s ease-out, border-color 0.1s ease-out',
                        borderRadius: '8px',
                        border: snapshot.combineTargetFor ? `2px solid #3b82f6` : '2px solid transparent',
                        backgroundColor: snapshot.combineTargetFor ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                    }}
                >
                    <MemoItemLink
                        to={`/memo/${memo.id}`}
                        $isActive={isActive}
                        $inThread={inThread}
                        onClick={() => onClick?.(true)}
                    >
                        <MemoTitle title={memo.title || untitledText}>
                            {memo.title || untitledText}
                        </MemoTitle>
                        <MemoDate>
                            {formatDate(memo.createdAt)}
                        </MemoDate>
                    </MemoItemLink>

                    {isThreadHead && childCount && childCount > 0 && onToggle && threadId && (
                        <div style={{ paddingLeft: '0.5rem' }}>
                            <ThreadToggleBtn onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onToggle(threadId);
                            }}>
                                <FiCornerDownRight />
                                {collapsed ?
                                    (moreText || 'More').replace('{count}', String(childCount)) :
                                    (collapseText || 'Collapse')}
                            </ThreadToggleBtn>
                        </div>
                    )}
                </div>
            )}
        </TouchDelayDraggable>
    );
};
