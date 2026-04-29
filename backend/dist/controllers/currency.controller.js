"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currencyController = void 0;
const currency_1 = require("../utils/currency");
exports.currencyController = {
    /**
     * Convierte USD a HNL
     */
    async convertToHNL(req, res) {
        try {
            const { amount, currency = 'USD' } = req.body;
            if (!amount || isNaN(amount)) {
                return res.status(400).json({ error: 'Cantidad inválida' });
            }
            const amountUSD = currency.toUpperCase() === 'USD' ? amount : await (0, currency_1.convertHNLToUSD)(amount);
            const amountHNL = await (0, currency_1.convertUSDToHNL)(amountUSD);
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
        }
        catch (error) {
            console.error('Error en conversión de moneda:', error);
            res.status(500).json({ error: 'Error al convertir moneda' });
        }
    },
    /**
     * Obtiene la información del tipo de cambio actual
     */
    async exchangeRate(req, res) {
        try {
            const info = await (0, currency_1.getExchangeRateInfo)();
            res.json(info);
        }
        catch (error) {
            console.error('Error obteniendo tipo de cambio:', error);
            res.status(500).json({ error: 'Error al obtener tipo de cambio' });
        }
    },
};
//# sourceMappingURL=currency.controller.js.map