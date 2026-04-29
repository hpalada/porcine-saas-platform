'use client';

import { useState } from 'react';
import { useCurrencyConverter } from '@/lib/use-currency-converter';
import { Button } from './Button';
import { Input } from './Input';

interface CurrencyConverterProps {
  onConvert: (amountHNL: number) => void;
  label?: string;
}

export function CurrencyConverter({ onConvert, label = 'Convertir de USD a HNL' }: CurrencyConverterProps) {
  const [usdAmount, setUsdAmount] = useState('');
  const { convertCurrency, exchangeRate, loading, error } = useCurrencyConverter();

  const handleConvert = async () => {
    if (!usdAmount || isNaN(parseFloat(usdAmount))) {
      alert('Por favor ingresa una cantidad válida');
      return;
    }

    const convertedAmount = await convertCurrency(parseFloat(usdAmount), 'USD');
    if (convertedAmount) {
      onConvert(convertedAmount);
      setUsdAmount('');
    }
  };

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold text-white">{label}</h3>
        {exchangeRate && (
          <span className="text-xs text-zinc-400">
            💱 1 USD = {exchangeRate.toFixed(2)} HNL
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          type="number"
          placeholder="Monto en USD"
          value={usdAmount}
          onChange={(e) => setUsdAmount(e.target.value)}
          disabled={loading}
          className="flex-1"
        />
        <Button
          onClick={handleConvert}
          disabled={loading || !usdAmount}
          variant="primary"
        >
          {loading ? 'Convirtiendo...' : 'Convertir'}
        </Button>
      </div>

      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  );
}
