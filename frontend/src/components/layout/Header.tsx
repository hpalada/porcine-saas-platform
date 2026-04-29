'use client';

import { useThemeStore } from '@/lib/theme-store';
import { IconMoon, IconSun } from '@/components/icons';

export function Header() {
  const { theme, setTheme } = useThemeStore();
  const dark = theme === 'dark';

  return (
    <header className="md:hidden sticky top-0 z-30 flex items-center justify-end px-4 py-3 border-b backdrop-blur-sm bg-zinc-950/80 border-zinc-800">
      <button
        onClick={() => setTheme(dark ? 'light' : 'dark')}
        className="p-2 rounded-lg transition-colors hover:bg-zinc-800 text-zinc-400 hover:text-white"
        aria-label="Cambiar tema"
      >
        {dark ? <IconSun size={18} /> : <IconMoon size={18} />}
      </button>
    </header>
  );
}
