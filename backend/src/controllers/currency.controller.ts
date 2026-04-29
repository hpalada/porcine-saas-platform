import { Request, Response } from 'express';
import {
  convertUSDToHNL,
  convertHNLToUSD,
  getExchangeRateInfo,
} from '../utils/currency';

export const currencyController = {
  /**
   * Convierte USD a HNL
   */
  async convertToHNL(req: Request, res: Response) {
    try {
      const { amount, currency = 'USD' } = req.body;

      if (!amount || isNaN(amount)) {
        return res.status(400).json({ error: 'Cantidad inválida' });
      }

      const amountUSD = currency.toUpperCase() === 'USD' ? amount : await convertHNLToUSD(amount);
      const amountHNL = await convertUSDToHNL(amountUSD);

      res.json({
        original: {
          amount,
          currency,
        },
        converted: {
          amount: amountHNL,
          currency: 'HNL',
        },
        rate: amountHNL / (amountUSD || 1),
      });
    } catch (error) {
      console.error('Error en conversión de moneda:', error);
      res.status(500).json({ error: 'Error al convertir moneda' });
    }
  },

  /**
   * Obtiene la información del tipo de cambio actual
   */
  async exchangeRate(req: Request, res: Response) {
    try {
      const info = await getExchangeRateInfo();
      res.json(info);
    } catch (error) {
      console.error('Error obteniendo tipo de cambio:', error);
      res.status(500).json({ error: 'Error al obtener tipo de cambio' });
    }
  },
};
