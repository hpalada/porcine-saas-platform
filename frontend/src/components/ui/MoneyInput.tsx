'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface MoneyInputProps {
  label?: string;
  value: string;
  onChange: (valueInHNL: string, currency: 'HNL' | 'USD') => void;
  required?: boolean;
  className?: string;
  error?: string;
}

let cachedRate: number | null = null;

async function getExchangeRate(): Promise<number> {
  if (cachedRate) return cachedRate;
  try {
    const res = await fetch('/api/moneda/tipo-cambio');
    if (res.ok) {
      const data = await res.json();
      cachedRate = data.rate ?? 24.5;
      return cachedRate!;
    }
  } catch { /* fallback */ }
  return 24.5;
}

export function MoneyInput({ label, value, onChange, required, className, error }: MoneyInputProps) {
  const [currency, setCurrency] = useState<'HNL' | 'USD'>('HNL');
  const [displayValue, setDisplayValue] = useState(value);
  const [rate, setRate] = useState<number>(24.5);

  useEffect(() => { getExchangeRate().then(setRate); }, []);

  // When currency changes, convert the displayed value
  const handleCurrencyChange = (newCurrency: 'HNL' | 'USD') => {
    const num = parseFloat(displayValue) || 0;
    if (num > 0) {
      let converted: number;
      if (newCurrency === 'USD' && currency === 'HNL') {
        converted = num / rate;
      } else if (newCurrency === 'HNL' && currency === 'USD') {
        converted = num * rate;
      } else {
        converted = num;
      }
      const str = converted.toFixed(2);
      setDisplayValue(str);
      onChange(newCurrency === 'HNL' ? str : (converted * rate).toFixed(2), newCurrency);
    }
    setCurrency(newCurrency);
  };

  const handleValueChange = (val: string) => {
    setDisplayValue(val);
    const num = parseFloat(val) || 0;
    const hnlValue = currency === 'USD' ? (num * rate).toFixed(2) : val;
    onChange(hnlValue, currency);
  };

  const hnlEquivalent = currency === 'USD' && parseFloat(displayValue) > 0
    ? (parseFloat(displayValue) * rate).toFixed(2)
    : null;

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium mb-1.5 text-zinc-300">{label}</label>
      )}
      <div className="flex gap-0">
        {/* Currency selector */}
        <select
          value={currency}
          onChange={(e) => handleCurrencyChange(e.target.value as 'HNL' | 'USD')}
          className="border rounded-l-lg px-2 py-2 text-sm font-medium transition-colors focus:outline-none bg-zinc-800 border-zinc-700 text-zinc-300"
        >
          <option value="HNL">L</option>
          <option value="USD">$</option>
        </select>
        {/* Amount input */}
        <input
          type="number"
          value={displayValue}
          onChange={(e) => handleValueChange(e.target.value)}
          required={required}
          min="0"
          step="0.01"
          className={cn(
            'flex-1 border border-l-0 rounded-r-lg px-3 py-2 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent',
            'bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500',
            error && 'border-red-500 focus:ring-red-500'
          )}
        />
      </div>
      {currency === 'USD' && hnlEquivalent && (
        <p className="text-xs text-zinc-500 mt-1">
          ≈ L {parseFloat(hnlEquivalent).toLocaleString('es-HN', { minimumFractionDigits: 2 })} HNL (tasa: {rate.toFixed(2)})
        </p>
      )}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}
