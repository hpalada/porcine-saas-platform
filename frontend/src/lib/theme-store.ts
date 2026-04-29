import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light';

interface ThemeState {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('light', theme === 'light');
          document.documentElement.classList.toggle('dark', theme === 'dark');
        }
      },
    }),
    { name: 'porcine-theme' }
  )
);

export function applyStoredTheme() {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem('porcine-theme');
    const theme: Theme = stored ? (JSON.parse(stored)?.state?.theme ?? 'dark') : 'dark';
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  } catch {
    document.documentElement.classList.add('dark');
  }
}
