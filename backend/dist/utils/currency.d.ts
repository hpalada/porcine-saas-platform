/**
 * Servicio de conversión de monedas
 * Utiliza la API de exchangerate-api.com para obtener tipos de cambio en tiempo real
 */
/**
 * Obtiene el tipo de cambio USD a HNL con caché
 */
export declare function getUSDToHNLRate(): Promise<number>;
/**
 * Convierte una cantidad de USD a HNL
 */
export declare function convertUSDToHNL(amountUSD: number): Promise<number>;
/**
 * Convierte una cantidad de HNL a USD
 */
export declare function convertHNLToUSD(amountHNL: number): Promise<number>;
/**
 * Obtiene la información del tipo de cambio actual
 */
export declare function getExchangeRateInfo(): Promise<{
    base: string;
    target: string;
    rate: number;
    timestamp: string;
}>;
//# sourceMappingURL=currency.d.ts.map