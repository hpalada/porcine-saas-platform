# ⚙️ Sistema de Configuraciones - Porcine SaaS

## 📋 Descripción

El sistema de configuraciones permite personalizar completamente la experiencia de Porcine SaaS, incluyendo:

- **🌐 Idiomas**: Español, Inglés, Francés
- **🎨 Temas**: Oscuro, Claro, Automático
- **📝 Información de Granja**: Nombre, ubicación, contacto, email
- **💱 Configuración Monetaria**: Moneda y tasa de cambio
- **🔔 Notificaciones**: Alertas y configuración de niveles críticos
- **⚙️ Sistema**: Backup automático, auditoría

## 🚀 Estructura Backend

### Modelo: `Settings`

```typescript
interface ISettings extends Document {
  idioma: 'es' | 'en' | 'fr';
  tema: 'light' | 'dark' | 'auto';
  nombreGranja: string;
  ubicacion: string;
  contacto: string;
  email: string;
  moneda: 'HNL' | 'USD';
  tasaCambio: number;
  notificacionesActivas: boolean;
  alertaStockBajo: boolean;
  nivelStockCritico: number;
  horaBackup: string;
  backupAutomatico: boolean;
  registroAuditoria: boolean;
}
```

**Archivo**: `backend/src/models/Settings.ts`

### API Endpoints

#### Obtener Configuración
```bash
GET /api/configuraciones
```

**Respuesta:**
```json
{
  "_id": "...",
  "idioma": "es",
  "tema": "dark",
  "nombreGranja": "Mi Granja Porcina",
  "ubicacion": "Honduras",
  "moneda": "HNL",
  "tasaCambio": 24.5,
  ...
}
```

#### Actualizar Configuración
```bash
PUT /api/configuraciones
Content-Type: application/json

{
  "idioma": "en",
  "tema": "light",
  "nombreGranja": "New Farm Name"
}
```

#### Obtener Tema
```bash
GET /api/configuraciones/tema
```

#### Obtener Idioma
```bash
GET /api/configuraciones/idioma
```

#### Reiniciar a Valores Por Defecto
```bash
POST /api/configuraciones/reset
```

## 🎨 Sistema de Temas

### Tema Oscuro (Dark)
- Colores: Tonos oscuros (#0a0a0a, #111111)
- Texto: Blanco (#fafafa)
- Perfecto para uso nocturno

### Tema Claro (Light)
- Colores: Tonos claros (#f8f8f8, #ffffff)
- Texto: Gris oscuro (#1a1a1a)
- Ideal para ambientes bien iluminados

### Tema Automático (Auto)
- Se adapta según preferencia del sistema
- Usa `prefers-color-scheme` media query

## 🌐 Sistema de Idiomas

### Idiomas Soportados

1. **Español (es)** - Por defecto
   - Interfaz completa en español
   - Formatos locales españoles

2. **Inglés (en)**
   - Interfaz en inglés
   - Formatos locales estadounidenses

3. **Francés (fr)**
   - Interfaz en francés
   - Formatos locales franceses

### Estructura de Traducciones

```typescript
// src/lib/translations.ts
export const translations = {
  es: {
    nav: { ... },
    settings: { ... },
    common: { ... }
  },
  en: { ... },
  fr: { ... }
}
```

## 💻 Frontend - Hooks

### `useSettings()`

Gestiona todas las configuraciones del sistema.

```typescript
const { settings, loading, error, updateSettings, resetSettings } = useSettings();

// settings: Objeto con configuraciones actuales
// loading: Boolean - Cargando
// error: String | null - Error si ocurre
// updateSettings(partial): Actualiza parcialmente
// resetSettings(): Reinicia a valores por defecto
```

### `useTheme()`

Gestiona el tema de la aplicación.

```typescript
const { theme, resolvedTheme, changeTheme } = useTheme();

// theme: 'light' | 'dark' | 'auto'
// resolvedTheme: 'light' | 'dark' (theme resuelto)
// changeTheme(newTheme): Cambia el tema
```

### `useLanguage()`

Gestiona el idioma y traducciones.

```typescript
const { language, changeLanguage, t } = useLanguage();

// language: Idioma actual ('es', 'en', 'fr')
// changeLanguage(lang): Cambia idioma
// t(key): Obtiene texto traducido
//   t('nav.dashboard') → "Dashboard" o "Tableau de Bord"
```

## 📱 Página de Configuraciones

### Ubicación
- **Ruta**: `/configuraciones`
- **Ícono**: Engranaje ⚙️
- **Sidebar**: Último item del menú

### Secciones

1. **General** 🏢
   - Nombre de la granja
   - Ubicación
   - Contacto
   - Email

2. **Apariencia** 🎨
   - Tema (Dark/Light/Auto)
   - Idioma (ES/EN/FR)

3. **Moneda** 💱
   - Moneda (HNL/USD)
   - Tasa de cambio

4. **Notificaciones** 🔔
   - Activar/desactivar
   - Alertas de stock bajo
   - Nivel crítico (%)

5. **Sistema** ⚙️
   - Backup automático
   - Hora de backup
   - Registro de auditoría

## 💾 Almacenamiento Local

Las configuraciones se almacenan en:
- **Backend**: MongoDB (colección `settings`)
- **Frontend**: `localStorage` (cache de 1 sesión)

La sincronización es automática al cargar y guardar.

## 🔄 Flujo de Operación

```
1. Usuario abre app
   ↓
2. ThemeProvider carga configuraciones
   ↓
3. useTheme() aplica tema al DOM
   ↓
4. useLanguage() carga traducciones
   ↓
5. Interfaz se renderiza en idioma/tema seleccionado
   ↓
6. Usuario cambia settings en /configuraciones
   ↓
7. updateSettings() guardan en MongoDB
   ↓
8. Cambios se aplican inmediatamente
   ↓
9. Se guardan en localStorage para próxima sesión
```

## 🎯 Casos de Uso

### Cambiar a Tema Claro
```typescript
const { changeTheme } = useTheme();
await changeTheme('light');
// Interfaz cambia a colores claros
```

### Cambiar Idioma a Inglés
```typescript
const { changeLanguage } = useLanguage();
await changeLanguage('en');
// Interfaz se renderiza en inglés
```

### Obtener Texto Traducido
```typescript
const { t } = useLanguage();
const dashboard = t('nav.dashboard'); // "Dashboard"
const settings = t('nav.configuraciones'); // "Settings"
```

### Actualizar Información de Granja
```typescript
const { updateSettings } = useSettings();
await updateSettings({
  nombreGranja: 'Granja Los Andes',
  ubicacion: 'Cortés',
  contacto: '+504 2234-5678'
});
```

## 🔧 Valores Por Defecto

```javascript
{
  idioma: 'es',
  tema: 'dark',
  nombreGranja: 'Mi Granja Porcina',
  ubicacion: 'Honduras',
  contacto: '+504 0000-0000',
  email: 'contacto@granja.com',
  moneda: 'HNL',
  tasaCambio: 24.5,
  notificacionesActivas: true,
  alertaStockBajo: true,
  nivelStockCritico: 50,
  horaBackup: '02:00',
  backupAutomatico: true,
  registroAuditoria: true
}
```

## 🎨 Colores por Tema

### Tema Oscuro
```
--background: #0a0a0a (Negro muy oscuro)
--surface: #111111 (Gris muy oscuro)
--surface-2: #1a1a1a (Gris oscuro)
--border: #262626 (Gris medio)
```

### Tema Claro
```
--background: #f8f8f8 (Blanco casi)
--surface: #ffffff (Blanco puro)
--surface-2: #f0f0f0 (Gris muy claro)
--border: #e0e0e0 (Gris claro)
```

## 📝 Notas Importantes

✅ Las configuraciones se sincronizan automáticamente
✅ Solo un documento de configuración por instancia
✅ Tema se aplica al elemento HTML con clase "dark"
✅ Idioma se detecta automáticamente del documento
✅ LocalStorage actúa como caché de respaldo
✅ Seed crea configuración por defecto

## 🚀 Próximas Mejoras

- [ ] Exportar/Importar configuraciones
- [ ] Perfiles de múltiples usuarios
- [ ] Historial de cambios
- [ ] Sincronización multi-dispositivo
- [ ] Configuraciones por usuario (cuando haya auth)
