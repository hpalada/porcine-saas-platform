# 🐷 Porcine SaaS - Sistema de Gestión de Granja Porcina

Sistema web completo para el control de costos, producción y rentabilidad en granjas porcinas.

## 🎯 Características Principales

- **Control de Lotes**: Gestión de lotes de cerdos con seguimiento de estado
- **Tipos de Concentrado**: Configuración de fases de alimentación con precios variables
- **Inventario**: Control de stock de concentrado con alertas de reposición
- **Consumos (CORE)**: Registro diario de consumo con captura de precio histórico
- **Gastos**: Registro de gastos adicionales (medicinas, transporte, mano de obra)
- **Ventas**: Módulo de ventas con cálculo de ingresos
- **Reportes**: Análisis de rentabilidad por lote con exportación a CSV/JSON

## 🏗️ Arquitectura

```
┌─────────────────┐     ┌─────────────────┐     ┌──────────────┐
│   Frontend      │────▶│   Backend       │────▶│   MongoDB    │
│   Next.js 14    │◀────│   Express       │◀────│   Mongoose   │
│   Tailwind CSS  │     │   TypeScript    │     │              │
└─────────────────┘     └─────────────────┘     └──────────────┘
```

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ 
- MongoDB 7+ (o Docker)

### Opción 1: Docker (Recomendado)

```bash
cd porcine-saas
docker-compose up -d
```

Accede a:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### Opción 2: Manual

#### 1. Iniciar MongoDB

```bash
# Con Docker
docker run -d -p 27017:27017 --name porcine-mongodb mongo:7

# O local
mongod --dbpath /data/db
```

#### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run seed        # Datos de ejemplo
npm run dev         # http://localhost:3001
```

#### 3. Frontend

```bash
cd frontend
npm install
npm run dev         # http://localhost:3000
```

## 📁 Estructura del Proyecto

```
porcine-saas/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuración de DB
│   │   ├── controllers/    # Lógica de negocio
│   │   ├── models/         # Schemas Mongoose
│   │   ├── routes/         # Endpoints API
│   │   ├── utils/          # Helpers y seed
│   │   └── server.ts       # Entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js App Router
│   │   ├── components/     # UI components
│   │   ├── lib/            # API client, utils
│   │   └── types/          # TypeScript types
│   ├── package.json
│   └── tailwind.config.ts
├── docker-compose.yml
└── README.md
```

## 📊 Modelos de Datos

### Lote
- Nombre, cantidad de cerdos, fecha inicio, estado

### ConcentradoTipo
- Nombre, descripción, precio actual, unidad (saco/kg)

### ConsumoRegistro (CORE)
- Lote, concentrado, cantidad, **precio capturado**, costo total, fecha

### InventarioMovimiento
- Tipo (entrada/salida/ajuste), cantidad, stock anterior/nuevo

### GastoAdicional
- Categoría, descripción, monto, lote (opcional)

### VentaRegistro
- Lote, cantidad, peso total, precio/kg, ingreso total

## 🔌 API Endpoints

### Lotes
- `GET /api/lotes` - Listar
- `POST /api/lotes` - Crear
- `GET /api/lotes/:id/resumen` - Resumen con costos

### Concentrados
- `GET /api/concentrados` - Listar tipos
- `POST /api/concentrados` - Crear
- `PUT /api/concentrados/:id` - Actualizar precio

### Inventario
- `GET /api/inventario` - Stock actual
- `POST /api/inventario/compra` - Registrar entrada
- `GET /api/inventario/historial` - Movimientos

### Consumos
- `POST /api/consumos` - Registrar (valida stock)
- `GET /api/consumos` - Listar con filtros

### Reportes
- `GET /api/reportes/rentabilidad/:loteId` - Análisis completo
- `GET /api/reportes/exportar/:loteId` - Exportar datos

## 💡 Reglas de Negocio Clave

1. **Precio Histórico**: El precio del concentrado se captura al momento del consumo y nunca cambia retroactivamente

2. **Validación de Stock**: No se permite registrar consumo mayor al stock disponible

3. **Cálculo Automático**: El costo total se calcula como `cantidad × precioUnitario`

4. **Rentabilidad**: 
   ```
   Utilidad = Ingresos - (Costos Concentrado + Otros Gastos)
   Margen = (Utilidad / Ingresos) × 100
   ```

## 🛠️ Tecnologías

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 14, React 18, Tailwind CSS, SWR, Recharts |
| Backend | Node.js, Express, TypeScript, Mongoose |
| Database | MongoDB 7 |
| DevOps | Docker, Docker Compose |

## 📝 Licencia

MIT

---

Desarrollado para gestión eficiente de granjas porcinas 🐷
