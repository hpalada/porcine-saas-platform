import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  action?: ReactNode;
}

// Cards siempre en gris oscuro — el modo claro solo afecta al fondo de la página.
export function Card({ children, className, title, description, action }: CardProps) {
  return (
    <div className={cn('bg-zinc-900 border border-zinc-800 rounded-xl p-6 transition-colors duration-300', className)}>
      {(title || description || action) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
            {description && <p className="text-sm mt-0.5 text-zinc-500">{description}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  className?: string;
}

export function StatCard({ title, value, icon, className }: StatCardProps) {
  return (
    <div className={cn('h-full bg-zinc-900 border border-zinc-800 rounded-xl p-6 transition-colors duration-300', className)}>
      <div className="flex items-center justify-between h-full gap-3">
        <div className="min-w-0">
          <p className="text-sm truncate text-zinc-500">{title}</p>
          <p className="text-2xl font-bold mt-1 text-white">{value}</p>
        </div>
        {icon && <div className="w-12 h-12 rounded-xl flex-shrink-0 bg-zinc-800 flex items-center justify-center">{icon}</div>}
      </div>
    </div>
  );
}
