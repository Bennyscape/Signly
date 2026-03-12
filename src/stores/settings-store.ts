import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings } from '@/types';
import { DEFAULT_SETTINGS } from '@/types';

interface SettingsState extends AppSettings {
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      updateSetting: (key, value) => set({ [key]: value }),
      resetSettings: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: 'asl-settings',
    }
  )
);
