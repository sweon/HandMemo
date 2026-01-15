import { db } from '../db';



// Since I didn't install file-saver, I'll implement a simple download function
// Since I didn't install file-saver, I'll implement a simple download function
const downloadFile = (content: string, fileName: string, contentType: string) => {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
};


export const getBackupData = async (memoIds?: number[]) => {
    let memos = await db.memos.toArray();
    let comments = await db.comments.toArray();

    if (memoIds && memoIds.length > 0) {
        memos = memos.filter(l => l.id !== undefined && memoIds.includes(l.id));
        comments = comments.filter(c => memoIds.includes(c.memoId));
    }

    return {
        version: 1,
        timestamp: new Date().toISOString(),
        memos,
        comments
    };
};

export const exportData = async (selectedMemoIds?: number[], customFileName?: string) => {
    let data = await getBackupData(selectedMemoIds);

    let fileName = customFileName;
    if (!fileName) {
        fileName = selectedMemoIds && selectedMemoIds.length > 0
            ? `handmemo-partial-${new Date().toISOString().slice(0, 10)}.json`
            : `handmemo-backup-${new Date().toISOString().slice(0, 10)}.json`;
    }

    if (!fileName.toLowerCase().endsWith('.json')) {
        fileName += '.json';
    }

    downloadFile(JSON.stringify(data, null, 2), fileName, 'application/json');
};


export const importData = async (file: File) => {
    return new Promise<void>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target?.result as string;
                const data = JSON.parse(text);
                await mergeBackupData(data);
                resolve();
            } catch (err) {
                reject(err);
            }
        };

        reader.readAsText(file);
    });
};

export const mergeBackupData = async (data: any) => {
    if (!data.memos && !data.logs && !data.books) {
        throw new Error('Invalid backup file format');
    }

    const memos = data.memos || data.logs || []; // Support legacy migration if needed, but primarily memos

    await db.transaction('rw', db.memos, db.comments, async () => {
        const memoIdMap = new Map<number, number>();

        // Merge Memos
        for (const l of memos) {
            const oldId = l.id;
            const createdAt = typeof l.createdAt === 'string' ? new Date(l.createdAt) : l.createdAt;

            // Try to find exact match
            const potentialMatches = await db.memos.where('title').equals(l.title).toArray();
            let existingMemo = potentialMatches.find(pl => Math.abs(pl.createdAt.getTime() - createdAt.getTime()) < 5000); // 5s tolerance

            if (existingMemo) {
                memoIdMap.set(oldId, existingMemo.id!);
            } else {
                const { id, ...memoData } = l;
                memoData.createdAt = createdAt;
                memoData.updatedAt = typeof l.updatedAt === 'string' ? new Date(l.updatedAt) : l.updatedAt;

                // Remove bookId if present as we are detaching from books
                delete memoData.bookId;

                const newId = await db.memos.add(memoData);
                memoIdMap.set(oldId, newId as number);
            }
        }

        // Merge Comments
        if (data.comments) {
            for (const c of data.comments) {
                const { id, ...commentData } = c;
                commentData.createdAt = typeof c.createdAt === 'string' ? new Date(c.createdAt) : c.createdAt;
                commentData.updatedAt = typeof c.updatedAt === 'string' ? new Date(c.updatedAt) : c.updatedAt;

                const oldOwnerId = c.memoId !== undefined ? c.memoId : c.logId;

                if (oldOwnerId && memoIdMap.has(oldOwnerId)) {
                    commentData.memoId = memoIdMap.get(oldOwnerId);
                    delete commentData.logId;

                    const duplicates = await db.comments.where('memoId').equals(commentData.memoId).toArray();
                    const exists = duplicates.some(d =>
                        d.content === commentData.content &&
                        Math.abs(d.createdAt.getTime() - commentData.createdAt.getTime()) < 5000
                    );

                    if (!exists) {
                        await db.comments.add(commentData);
                    }
                }
            }
        }
    });
};
