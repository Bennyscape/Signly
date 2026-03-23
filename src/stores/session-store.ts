import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session } from '@/types';

interface SessionState {
  sessions: Session[];
  currentSession: Session | null;

  startSession: () => void;
  endSession: () => void;
  incrementRecognition: () => void;
  getSessions: () => Session[];
  clearHistory: () => void;
}

function generateId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSession: null,

      startSession: () => {
        const session: Session = {
          id: generateId(),
          startTime: Date.now(),
          endTime: null,
          transcript: '',
          recognitionCount: 0,
          accuracy: 0,
        };
        set({ currentSession: session });
      },

      endSession: () => {
        const current = get().currentSession;
        if (!current) return;

        const completed: Session = {
          ...current,
          endTime: Date.now(),
        };

        set((state) => ({
          sessions: [completed, ...state.sessions].slice(0, 50), // Keep last 50
          currentSession: null,
        }));
      },

      incrementRecognition: () => {
        const current = get().currentSession;
        if (!current) return;
        set({
          currentSession: {
            ...current,
            recognitionCount: current.recognitionCount + 1,
          },
        });
      },

      getSessions: () => get().sessions,

      clearHistory: () => set({ sessions: [] }),
    }),
    {
      name: 'asl-sessions',
    }
  )
);
