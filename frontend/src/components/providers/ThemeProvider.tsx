'use client';

import { useEffect } from 'react';
import { useThemeStore, applyStoredTheme } from '@/lib/theme-store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();

  useEffect(() => {
    applyStoredTheme();
  }, [theme]);

  return <>{children}</>;
}
