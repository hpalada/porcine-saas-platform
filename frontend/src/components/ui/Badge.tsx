import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'active' | 'finalizado' | 'cancelado' | 'danger' | 'success';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-zinc-800 text-zinc-400 border-zinc-700',
    active: 'bg-green-900/30 text-green-400 border-green-800',
    finalizado: 'bg-zinc-800 text-zinc-400 border-zinc-700',
    cancelado: 'bg-red-900/30 text-red-400 border-red-800',
    danger: 'bg-red-900/30 text-red-400 border-red-800',
    success: 'bg-green-900/30 text-green-400 border-green-800',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
