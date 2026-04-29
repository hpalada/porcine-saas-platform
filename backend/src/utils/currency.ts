/**
 * Servicio de conversión de monedas
 * Utiliza la API de exchangerate-api.com para obtener tipos de cambio en tiempo real
 */

interface ExchangeRateResponse {
  rates: {
    [key: string]: number;
  };
  base: string;
  date: string;
}

let cachedRate: number | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 3600000; // 1 hora en ms

/**
 * Obtiene el tipo de cambio USD a HNL con caché
 */
export async function getUSDToHNLRate(): Promise<number> {
  const now = Date.now();
  
  // Si tenemos caché válido, devolverlo
  if (cachedRate !== null && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedRate;
  }

  try {
    const response = await fetch(
      'https://api.exchangerate-api.com/v4/latest/USD'
    );
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data: ExchangeRateResponse = await response.json();
    const hnlRate = data.rates.HNL;

    if (!hnlRate) {
      throw new Error('HNL rate not found in API response');
    }

    // Guardar en caché
    cachedRate = hnlRate;
    cacheTimestamp = now;

    console.log(`💱 Tipo de cambio USD/HNL: ${hnlRate} (actualizado)`);
    return hnlRate;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    
    // Si falla, usar una tasa por defecto (tipo de cambio aproximado)
    const defaultRate = 24.5; // Aproximado
    console.warn(`⚠️ Usando tasa por defecto: ${defaultRate}`);
    return defaultRate;
  }
}

/**
 * Convierte una cantidad de USD a HNL
 */
export async function convertUSDToHNL(amountUSD: number): Promise<number> {
  const rate = await getUSDToHNLRate();
  return amountUSD * rate;
}

/**
 * Convierte una cantidad de HNL a USD
 */
export async function convertHNLToUSD(amountHNL: number): Promise<number> {
  const rate = await getUSDToHNLRate();
  return amountHNL / rate;
}

/**
 * Obtiene la información del tipo de cambio actual
 */
export async function getExchangeRateInfo() {
  const rate = await getUSDToHNLRate();
  return {
    base: 'USD',
    target: 'HNL',
    rate,
    timestamp: new Date().toISOString(),
  };
}
