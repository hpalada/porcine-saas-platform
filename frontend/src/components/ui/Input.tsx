import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

// Inputs siempre en estilo oscuro (sobre cards oscuras).
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-1.5 text-zinc-300">{label}</label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full border rounded-lg px-4 py-2 transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:border-transparent focus:ring-green-600',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface SelectInlineProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectInlineProps>(
  ({ label, error, options, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-1.5 text-zinc-300">{label}</label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full border rounded-lg px-4 py-2 transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:border-transparent focus:ring-green-600',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'bg-zinc-900 border-zinc-700 text-white',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-1.5 text-zinc-300">{label}</label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'w-full border rounded-lg px-4 py-2 transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:border-transparent focus:ring-green-600',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
