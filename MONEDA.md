# 💱 Conversión de Moneda - Lempira Hondureño (HNL)

## 🎯 Descripción

El sistema ahora está configurado para trabajar completamente en **Lempiras Hondureños (HNL)** con capacidad de conversión automática desde dólares estadounidenses (USD).

## 🔄 Cómo Funciona

### 1. **Conversión Automática**
- Todos los precios se muestran en **HNL** en la interfaz
- Si necesitas ingresar un precio en USD, puedes usar el convertidor integrado
- El tipo de cambio se obtiene en tiempo real de una API externa
- Los datos se cacheán por 1 hora para optimizar rendimiento

### 2. **API de Conversión**

#### Endpoint: Convertir Moneda
```bash
POST /api/moneda/convertir
Content-Type: application/json

{
  "amount": 100,
  "currency": "USD"  # Opcional, por defecto es "USD"
}
```

**Respuesta:**
```json
{
  "original": {
    "amount": 100,
    "currency": "USD"
  },
  "converted": {
    "amount": 2450,
    "currency": "HNL"
  },
  "rate": 24.5
}
```

#### Endpoint: Obtener Tipo de Cambio
```bash
GET /api/moneda/tipo-cambio
```

**Respuesta:**
```json
{
  "base": "USD",
  "target": "HNL",
  "rate": 24.5,
  "timestamp": "2026-04-22T15:30:00.000Z"
}
```

## 📱 Uso en el Frontend

### Hook `useCurrencyConverter`

```typescript
import { useCurrencyConverter } from '@/lib/use-currency-converter';

function MiComponente() {
  const { convertCurrency, exchangeRate, loading, error } = useCurrencyConverter();

  const handleConvert = async () => {
    const amountHNL = await convertCurrency(100, 'USD');
    console.log(`100 USD = ${amountHNL} HNL`);
  };

  return (
    <div>
      {exchangeRate && <p>Tipo de cambio: 1 USD = {exchangeRate} HNL</p>}
      <button onClick={handleConvert} disabled={loading}>
        Convertir 100 USD
      </button>
    </div>
  );
}
```

### Componente `CurrencyConverter`

```typescript
import { CurrencyConverter } from '@/components/ui/CurrencyConverter';

function MiFormulario() {
  const [precioHNL, setPrecioHNL] = useState(0);

  return (
    <div>
      <CurrencyConverter 
        onConvert={setPrecioHNL}
        label="Convertir precio de USD a HNL"
      />
      <p>Precio en HNL: {precioHNL}</p>
    </div>
  );
}
```

## 🔧 Configuración

### Variables de Entorno
No se requieren variables de entorno especiales. El sistema usa:
- API pública: `https://api.exchangerate-api.com/v4/latest/USD`
- Caché local: 1 hora
- Tasa de cambio por defecto (si falla la API): 24.5 HNL por USD

### Moneda por Defecto
- **Frontend:** HNL (Lempira Hondureño)
- **Formato:** es-HN (Español de Honduras)
- **Precisión:** 2 decimales

## 📊 Ejemplos de Uso

### Ingresar precio de concentrado en USD
1. En el formulario de crear/actualizar concentrado
2. Usa el convertidor de moneda: ingresa cantidad en USD
3. Se convierte automáticamente a HNL
4. Copia el valor convertido al campo de precio

### Ver tipo de cambio actual
- Busca en el header: "💱 1 USD = XX.XX HNL"
- O llama a: `GET /api/moneda/tipo-cambio`

## ⚙️ Mantenimiento

### Caché
- Se actualiza cada 1 hora
- Si necesitas forzar una actualización, reinicia el backend

### Tasa por Defecto
- Se usa si la API no responde
- Actualmente: 24.5 HNL por USD
- Actualizar en: `backend/src/utils/currency.ts`

## 📝 Notas Importantes

- ✅ Todos los precios se guardan en HNL en la base de datos
- ✅ El tipo de cambio se obtiene en tiempo real
- ✅ El sistema tiene caché para optimizar rendimiento
- ✅ Funciona offline con tasa por defecto
- ✅ Locale correcto: es-HN para Honduras

## 🔗 Referencias

- API de Tipos de Cambio: https://exchangerate-api.com/
- ISO 4217 HNL: https://es.wikipedia.org/wiki/Lempira
