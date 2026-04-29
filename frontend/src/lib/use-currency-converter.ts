import { useState, useCallback } from 'react';
import { api } from './api-client';

interface ConversionResult {
  original: {
    amount: number;
    currency: string;
  };
  converted: {
    amount: number;
    currency: string;
  };
  rate: number;
}

interface ExchangeRateInfo {
  base: string;
  target: string;
  rate: number;
  timestamp: string;
}

export function useCurrencyConverter() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);

  /**
   * Convierte una cantidad de una moneda a otra
   */
  const convertCurrency = useCallback(
    async (amount: number, fromCurrency: string = 'USD'): Promise<number | null> => {
      if (!amount || amount <= 0) return null;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/moneda/convertir', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount,
            currency: fromCurrency,
          }),
        });

        if (!response.ok) {
          throw new Error('Error en conversión');
        }

        const data: ConversionResult = await response.json();
        setExchangeRate(data.rate);
        return data.converted.amount;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMsg);
        console.error('Error converting currency:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Obtiene el tipo de cambio actual USD/HNL
   */
  const getExchangeRate = useCallback(async (): Promise<ExchangeRateInfo | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/moneda/tipo-cambio');

      if (!response.ok) {
        throw new Error('Error obteniendo tipo de cambio');
      }

      const data: ExchangeRateInfo = await response.json();
      setExchangeRate(data.rate);
      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMsg);
      console.error('Error getting exchange rate:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    convertCurrency,
    getExchangeRate,
    exchangeRate,
    loading,
    error,
  };
}
