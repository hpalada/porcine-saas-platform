'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { useThemeStore } from '@/lib/theme-store';
import { IconMoon, IconSun } from '@/components/icons';
import {
  PigLogo,
  IconDashboard,
  IconPackage,
  IconWheat,
  IconClipboard,
  IconUtensils,
  IconReceipt,
  IconTrendingUp,
  IconBarChart,
  IconSettings,
  IconMenu,
  IconX,
  IconLogOut,
  IconUser,
  IconSyringe,
} from '@/components/icons';

const navigation = [
  { name: 'Dashboard', href: '/', icon: IconDashboard },
  { name: 'Lotes', href: '/lotes', icon: IconPackage },
  { name: 'Vacunaciones', href: '/vacunaciones', icon: IconSyringe },
  { name: 'Concentrados', href: '/concentrados', icon: IconWheat },
  { name: 'Inventario', href: '/inventario', icon: IconClipboard },
  { name: 'Consumos', href: '/consumos', icon: IconUtensils },
  { name: 'Gastos', href: '/gastos', icon: IconReceipt },
  { name: 'Ventas', href: '/ventas', icon: IconTrendingUp },
  { name: 'Reportes', href: '/reportes', icon: IconBarChart },
  { name: 'Configuración', href: '/configuraciones', icon: IconSettings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useThemeStore();
  const { usuario, logout } = useAuthStore();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dark = theme === 'dark';

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Sidebar siempre oscura — el modo claro afecta solo al fondo de la página.
  const SidebarContent = () => (
    <aside className="flex flex-col h-full w-64 border-r bg-zinc-950 border-zinc-800">
      {/* Logo */}
      <div className="p-5 border-b border-zinc-800">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity" onClick={() => setIsOpen(false)}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 ring-1 bg-zinc-800 ring-zinc-700">
            <PigLogo size={28} />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight text-white">Porcine</h1>
            <p className="text-xs text-zinc-500">{usuario?.empresa?.nombre || 'SaaS'}</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 ${
                isActive
                  ? 'bg-green-900/25 text-green-400 border-l-2 border-green-500 pl-[10px]'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
              }`}
            >
              <Icon size={17} className="flex-shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-zinc-800">
        {usuario && (
          <div className="rounded-lg p-3 mb-2 bg-zinc-900">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-zinc-800">
                <IconUser size={14} className="text-zinc-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium truncate text-white">{usuario.nombre}</p>
                <p className="text-xs truncate text-zinc-500">{usuario.rol}</p>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors text-zinc-400 hover:text-red-400 hover:bg-red-900/10"
        >
          <IconLogOut size={15} />
          <span>Cerrar sesión</span>
        </button>
        <div className="flex items-center justify-between mt-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
            <span className="text-xs text-green-400">Sistema activo</span>
          </div>
          <button
            onClick={() => setTheme(dark ? 'light' : 'dark')}
            className="p-1.5 rounded-lg transition-colors text-zinc-500 hover:text-white hover:bg-zinc-800"
            aria-label="Cambiar tema"
          >
            {dark ? <IconSun size={14} /> : <IconMoon size={14} />}
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg shadow-lg transition-colors bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800"
        aria-label="Menú"
      >
        {isOpen ? <IconX size={22} /> : <IconMenu size={22} />}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30" onClick={() => setIsOpen(false)} />
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:z-40">
        <SidebarContent />
      </div>

      {/* Mobile sidebar */}
      <div className={`md:hidden fixed left-0 top-0 h-full z-40 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </div>
    </>
  );
}
