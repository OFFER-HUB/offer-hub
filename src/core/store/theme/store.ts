import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type ThemeState = {
  theme: 'light' | 'dark';
  toggleTheme: (newTheme?: 'light' | 'dark') => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      toggleTheme: (newTheme?: 'light' | 'dark') => {
        const currentTheme = get().theme;
        const themeToSet =
          newTheme || (currentTheme === 'light' ? 'dark' : 'light');
        set({ theme: themeToSet });
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
