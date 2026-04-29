# 🚀 Inicio Rápido - Porcine SaaS

## Paso 1: Iniciar MongoDB

**Opción A - Con Docker (Recomendado):**
```bash
docker run -d -p 27017:27017 --name porcine-mongodb mongo:7
```

**Opción B - MongoDB local:**
```bash
mongod --dbpath /data/db
```

## Paso 2: Iniciar el Backend

```bash
cd /Users/homerpalada/porcine-saas/backend

# Instalar dependencias (ya hecho)
npm install

# Copiar variables de entorno (ya existe .env)
cp .env.example .env

# Sembrar datos de ejemplo (tipos de concentrado, lotes, stock inicial)
npm run seed

# Iniciar servidor en http://localhost:3001
npm run dev
```

## Paso 3: Iniciar el Frontend

```bash
cd /Users/homerpalada/porcine-saas/frontend

# Instalar dependencias (ya hecho)
npm install

# Iniciar Next.js en http://localhost:3000
npm run dev
```

## ✅ Acceder al Sistema

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/health

## 📋 Datos de Ejemplo Incluidos

El comando `npm run seed` crea:

### Tipos de Concentrado (5)
| Nombre | Precio |
|--------|--------|
| Fase 1 - Pre-inicio | $85,000 |
| Fase 2 - Inicio | $78,000 |
| Fase 3 - Crecimiento | $72,000 |
| Fase 4 - Engorde | $68,000 |
| Ceba Final | $65,000 |

### Lotes (3)
| Nombre | Cerdos | Estado |
|--------|--------|--------|
| Lote A-2026-01 | 500 | Activo |
| Lote B-2026-02 | 350 | Activo |
| Lote C-2025-12 | 400 | Finalizado |

### Stock Inicial
- Fase 1: 100 sacos
- Fase 2: 150 sacos
- Fase 3: 200 sacos
- Fase 4: 180 sacos
- Ceba Final: 120 sacos

## 🔁 Flujo de Uso Típico

1. **Dashboard** → Ver resumen general
2. **Inventario → Registrar Compra** → Aumentar stock si es necesario
3. **Consumos → Nuevo Consumo** → Registrar alimentación diaria
4. **Gastos → Nuevo Gasto** → Registrar gastos adicionales
5. **Ventas → Nueva Venta** → Cuando se venden cerdos
6. **Reportes → Seleccionar Lote** → Ver rentabilidad

## 🛑 Detener Servicios

```bash
# Si usaste Docker para MongoDB
docker stop porcine-mongodb
docker rm porcine-mongodb

# O simplemente Ctrl+C en las terminales del backend/frontend
```

## 🐛 Solución de Problemas

### Error: "MongoServerError: connect ECONNREFUSED"
- MongoDB no está corriendo. Inícialo con Docker o local.

### Error: "Module not found"
- Ejecuta `npm install` en el directorio correspondiente.

### Puerto ya en uso
- Cambia el puerto en `.env` (backend) o ajusta el comando (frontend).

---

**Soporte:** Revisa el README.md para documentación completa.
