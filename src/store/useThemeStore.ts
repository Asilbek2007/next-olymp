import { create } from 'zustand';

interface ThemeState {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

const STORAGE_KEY = 'next_olymp_theme';

const getInitialTheme = (): 'dark' | 'light' => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
  } catch (e) {
    console.error('Failed to read theme from localStorage', e);
  }
  return 'dark';
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: getInitialTheme(),
  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(STORAGE_KEY, newTheme);
      } catch (e) {
        console.error('Failed to save theme to localStorage', e);
      }
      return { theme: newTheme };
    });
  },
  setTheme: (theme: 'dark' | 'light') => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      console.error('Failed to save theme to localStorage', e);
    }
    set({ theme });
  }
}));
