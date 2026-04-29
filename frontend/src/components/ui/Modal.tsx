'use client';

import { useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { IconX } from '@/components/icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        'relative w-full rounded-t-2xl sm:rounded-xl shadow-2xl overflow-hidden',
        'max-h-[90vh] flex flex-col',
        sizes[size],
        'bg-zinc-900 border border-zinc-800'
      )}>
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0 border-zinc-800">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors text-zinc-400 hover:text-white hover:bg-zinc-800">
            <IconX size={18} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
