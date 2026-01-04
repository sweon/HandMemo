import Dexie, { type Table } from 'dexie';

export type BookStatus = 'reading' | 'completed' | 'on_hold';

export interface Book {
    id?: number;
    title: string;
    author?: string;
    totalPages: number;
    startPage?: number; // If starting from middle? usually 0.
    currentPage?: number; // Progress
    startDate: Date;
    completedDate?: Date;
    status: BookStatus;
    coverImage?: string; // Base64 or URL
    createdAt: Date;
    updatedAt: Date;
}

export interface Memo {
    id?: number;
    bookId?: number; // Associated Book
    pageNumber?: number; // Page context
    quote?: string; // Selected text from book
    title: string;
    content: string; // Markdown content
    modelId?: number; // Keep for legacy/compatibility
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    threadId?: string;
    threadOrder?: number;
}

export interface Model {
    id?: number;
    name: string;
    isDefault?: boolean;
    order?: number;
}

export interface Comment {
    id?: number;
    memoId: number;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export class BookMemoDatabase extends Dexie {
    books!: Table<Book>;
    memos!: Table<Memo>;
    models!: Table<Model>;
    comments!: Table<Comment>;

    constructor() {
        super('BookMemoDB');
        this.version(1).stores({
            memos: '++id, title, *tags, modelId, createdAt, updatedAt',
            models: '++id, name',
            comments: '++id, memoId, createdAt'
        });

        this.version(2).stores({
            models: '++id, name, order'
        });

        this.version(3).stores({
            memos: '++id, title, *tags, modelId, createdAt, updatedAt, threadId'
        });

        this.version(4).stores({
            books: '++id, title, status, createdAt',
            memos: '++id, bookId, pageNumber, title, *tags, modelId, createdAt, updatedAt, threadId'
        });
    }
}

export const db = new BookMemoDatabase();

// Seed default model if not exists (Legacy support)
db.on('populate', () => {
    db.models.add({ name: 'GPT-4', isDefault: true });
    db.models.add({ name: 'Claude 3.5 Sonnet' });
    db.models.add({ name: 'Gemini 1.5 Pro' });
});

