import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';

export interface Note {
  id: string;
  title: string;
  content: string;
  subjectId: string;
  createdAt: string;
  updatedAt: string;
}

interface NotesStore {
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  getNoteById: (id: string) => Note | undefined;
}

export const useNotesStore = create<NotesStore>()(
  persist(
    (set, get) => ({
      notes: [],

      addNote: (noteData) => {
        const id = generateId();
        const now = new Date().toISOString();
        const note: Note = {
          ...noteData,
          id,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ notes: [note, ...state.notes] }));
        return id;
      },

      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, ...updates, updatedAt: new Date().toISOString() }
              : note
          ),
        }));
      },

      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        }));
      },

      getNoteById: (id) => {
        return get().notes.find((note) => note.id === id);
      },
    }),
    {
      name: 'kaoyan-notes-storage',
    }
  )
);
