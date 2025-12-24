import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { exportData, importData } from '../utils/backup';
import { FiTrash2, FiPlus, FiDownload, FiUpload } from 'react-icons/fi';
import { MdDragIndicator } from 'react-icons/md';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';

const Container = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  height: 100%;
  overflow-y: auto;
`;

const Section = styled.div`
  margin-bottom: 3rem;
`;

const Title = styled.h2`
  margin-bottom: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-bottom: 0.5rem;
`;

const ModelList = styled.ul`
  list-style: none;
  padding: 0;
`;

const ModelItem = styled.li<{ $isDragging?: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
  padding: 0.75rem;
  background: ${({ theme, $isDragging }) => $isDragging ? theme.colors.border : theme.colors.surface};
  border-radius: 8px;
  border: 1px solid ${({ theme, $isDragging }) => $isDragging ? theme.colors.primary : 'transparent'};
  box-shadow: ${({ $isDragging }) => $isDragging ? '0 5px 15px rgba(0,0,0,0.15)' : 'none'};
  transition: background-color 0.2s, box-shadow 0.2s;
`;

const DragHandle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: grab;
  padding: 4px;
  border-radius: 4px;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
  }

  &:active {
    cursor: grabbing;
  }
`;

const Input = styled.input`
  flex: 1;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const IconButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover { 
    color: ${({ theme }) => theme.colors.danger};
    background-color: ${({ theme }) => theme.colors.background};
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    filter: brightness(1.1);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.h3`
  margin-top: 0;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.text};
`;

const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 1.5rem;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
`;

const ScrollableList = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  padding: 0.5rem;
  margin-top: 0.5rem;
  margin-left: 1.5rem;
  background: ${({ theme }) => theme.colors.background};
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
`;

export const SettingsPage: React.FC = () => {
    const models = useLiveQuery(() => db.models.orderBy('order').toArray());

    useEffect(() => {
        const initializeOrder = async () => {
            const allModels = await db.models.toArray();
            if (allModels.length > 0 && allModels.some(m => m.order === undefined)) {
                await db.transaction('rw', db.models, async () => {
                    for (let i = 0; i < allModels.length; i++) {
                        if (allModels[i].order === undefined) {
                            await db.models.update(allModels[i].id!, { order: i });
                        }
                    }
                });
            }
        };
        initializeOrder();
    }, []);

    const [newModel, setNewModel] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [showExportModal, setShowExportModal] = useState(false);
    const [exportMode, setExportMode] = useState<'all' | 'selected'>('all');
    const [selectedLogs, setSelectedLogs] = useState<Set<number>>(new Set());
    const [exportFileName, setExportFileName] = useState('');
    const allLogs = useLiveQuery(() => db.logs.orderBy('createdAt').reverse().toArray());

    const handleExportClick = () => {
        setShowExportModal(true);
        setExportMode('all');
        setSelectedLogs(new Set());
        setExportFileName(`llmemo-backup-${new Date().toISOString().slice(0, 10)}`);
    };

    const confirmExport = async () => {
        if (exportMode === 'all') {
            await exportData(undefined, exportFileName);
        } else {
            await exportData(Array.from(selectedLogs), exportFileName);
        }
        setShowExportModal(false);
    };

    const toggleLogSelection = (id: number) => {
        const next = new Set(selectedLogs);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedLogs(next);
    };

    const handleAddModel = async () => {
        if (newModel.trim()) {
            await db.transaction('rw', db.models, async () => {
                const allModels = await db.models.orderBy('order').toArray();

                // Shift all existing models' orders by +1 to put the new one at the top (order: 0)
                for (const m of allModels) {
                    if (m.id !== undefined) {
                        await db.models.update(m.id, { order: (m.order ?? 0) + 1 });
                    }
                }

                await db.models.add({
                    name: newModel.trim(),
                    order: 0
                });
            });
            setNewModel('');
        }
    };

    const handleDeleteModel = async (id: number) => {
        if (confirm('Delete this model? Existing logs linked to this model will lose the reference.')) {
            await db.models.delete(id);
        }
    };

    const onDragEnd = async (result: DropResult) => {
        if (!result.destination || !models) return;

        const sourceIndex = result.source.index;
        const destIndex = result.destination.index;

        if (sourceIndex === destIndex) return;

        const newModels = Array.from(models);
        const [removed] = newModels.splice(sourceIndex, 1);
        newModels.splice(destIndex, 0, removed);

        // Update orders in DB
        await db.transaction('rw', db.models, async () => {
            for (let i = 0; i < newModels.length; i++) {
                if (newModels[i].id !== undefined) {
                    await db.models.update(newModels[i].id!, { order: i });
                }
            }
        });
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (confirm('Import data? This will merge with existing data.')) {
                try {
                    await importData(file);
                    alert('Import successful!');
                } catch (err) {
                    alert('Import failed: ' + err);
                }
            }
        }
    };

    return (
        <Container>
            <Section>
                <Title>Manage LLM Models</Title>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <Input
                        value={newModel}
                        onChange={e => setNewModel(e.target.value)}
                        placeholder="Add new model name..."
                        onKeyDown={(e) => e.key === 'Enter' && newModel.trim() && handleAddModel()}
                    />
                    <Button onClick={handleAddModel} disabled={!newModel.trim()}><FiPlus /> Add</Button>
                </div>

                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="models">
                        {(provided) => (
                            <ModelList {...provided.droppableProps} ref={provided.innerRef}>
                                {models?.map((m, index) => (
                                    <Draggable key={m.id} draggableId={m.id!.toString()} index={index}>
                                        {(provided, snapshot) => (
                                            <ModelItem
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                $isDragging={snapshot.isDragging}
                                            >
                                                <DragHandle {...provided.dragHandleProps}>
                                                    <MdDragIndicator size={20} />
                                                </DragHandle>
                                                <span style={{ flex: 1, fontWeight: 500 }}>{m.name}</span>
                                                <IconButton onClick={() => handleDeleteModel(m.id!)}>
                                                    <FiTrash2 size={18} />
                                                </IconButton>
                                            </ModelItem>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </ModelList>
                        )}
                    </Droppable>
                </DragDropContext>
            </Section>

            <Section>
                <Title>Data Management</Title>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Button onClick={handleExportClick}><FiDownload /> Export / Backup</Button>

                    <Button onClick={() => fileInputRef.current?.click()} style={{ background: '#10b981' }}>
                        <FiUpload /> Import / Restore
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept=".json"
                        onChange={handleImport}
                    />
                </div>
                <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', opacity: 0.8 }}>
                    Note: Importing merges data. Duplicate items (by ID) are treated as new entries with mapped relationships.
                </p>
            </Section>

            {showExportModal && (
                <ModalOverlay onClick={() => setShowExportModal(false)}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <ModalHeader>Export Data</ModalHeader>
                        <ModalBody>
                            <RadioLabel>
                                <input
                                    type="radio"
                                    checked={exportMode === 'all'}
                                    onChange={() => setExportMode('all')}
                                />
                                All Data (Default)
                            </RadioLabel>

                            <RadioLabel>
                                <input
                                    type="radio"
                                    checked={exportMode === 'selected'}
                                    onChange={() => setExportMode('selected')}
                                />
                                Select Logs
                            </RadioLabel>

                            <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Filename (optional):</label>
                                <Input
                                    value={exportFileName}
                                    onChange={e => setExportFileName(e.target.value)}
                                    placeholder="Enter filename..."
                                    style={{ width: '100%' }}
                                />
                            </div>

                            {exportMode === 'selected' && (
                                <ScrollableList>
                                    {allLogs?.length === 0 ? (
                                        <div style={{ padding: '0.5rem', opacity: 0.6 }}>No logs found.</div>
                                    ) : (
                                        allLogs?.map(log => (
                                            <CheckboxLabel key={log.id}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedLogs.has(log.id!)}
                                                    onChange={() => toggleLogSelection(log.id!)}
                                                />
                                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {log.title || 'Untitled'}
                                                </span>
                                            </CheckboxLabel>
                                        ))
                                    )}
                                </ScrollableList>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button onClick={() => setShowExportModal(false)} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'inherit' }}>
                                Cancel
                            </Button>
                            <Button onClick={confirmExport} disabled={exportMode === 'selected' && selectedLogs.size === 0}>
                                <FiDownload /> Export
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </ModalOverlay>
            )}
        </Container>
    );
};

