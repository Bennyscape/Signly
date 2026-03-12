import { create } from 'zustand';

interface TranscriptState {
  // Text
  currentText: string;
  words: string[];
  currentWord: string;

  // Actions
  addLetter: (letter: string) => void;
  addWord: (word: string) => void;
  addSpace: () => void;
  deleteLast: () => void;
  clearAll: () => void;
  setText: (text: string) => void;
}

export const useTranscriptStore = create<TranscriptState>((set, get) => ({
  currentText: '',
  words: [],
  currentWord: '',

  addLetter: (letter) => {
    const state = get();
    const newWord = state.currentWord + letter.toLowerCase();
    set({
      currentWord: newWord,
      currentText: [...state.words, newWord].join(' '),
    });
  },

  addWord: (word) => {
    const state = get();
    const newWords = [...state.words, word.toLowerCase()];
    set({
      words: newWords,
      currentWord: '',
      currentText: newWords.join(' '),
    });
  },

  addSpace: () => {
    const state = get();
    if (state.currentWord.length > 0) {
      const newWords = [...state.words, state.currentWord];
      set({
        words: newWords,
        currentWord: '',
        currentText: newWords.join(' ') + ' ',
      });
    }
  },

  deleteLast: () => {
    const state = get();
    if (state.currentWord.length > 0) {
      const newWord = state.currentWord.slice(0, -1);
      set({
        currentWord: newWord,
        currentText: [...state.words, newWord].filter(Boolean).join(' '),
      });
    } else if (state.words.length > 0) {
      const newWords = state.words.slice(0, -1);
      const lastWord = state.words[state.words.length - 1];
      set({
        words: newWords,
        currentWord: lastWord,
        currentText: [...newWords, lastWord].join(' '),
      });
    }
  },

  clearAll: () => set({ currentText: '', words: [], currentWord: '' }),
  setText: (text) => set({ currentText: text, words: text.split(' ').slice(0, -1), currentWord: text.split(' ').pop() || '' }),
}));
