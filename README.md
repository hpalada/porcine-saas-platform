# Porcine SaaS Platform

Full-stack SaaS for pig farm operations management — batch tracking, feed cost control, inventory, and profitability analytics. Built from scratch and deployed to production; used daily by real clients in Honduras.

## Stack

**Frontend** — Next.js 14 · React 18 · Tailwind CSS · SWR  
**Backend** — Node.js · Express · TypeScript  
**Database** — MongoDB · Mongoose  
**Auth** — JWT with subscription gating  
**Infra** — Docker · Railway  

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌──────────────┐
│   Frontend      │────▶│   Backend API   │────▶│   MongoDB    │
│   Next.js 14    │◀────│   Express / TS  │◀────│   Mongoose   │
│   Tailwind CSS  │     │   JWT Auth      │     │   Atlas      │
└─────────────────┘     └─────────────────┘     └──────────────┘
```

## Features

**Batch management** — full lifecycle per pig batch: quantity, dates, status, from opening to sale.

**Feed cost tracking** — daily consumption logs with price locked at time of entry. Historical records are immutable — retroactive price changes never corrupt past data.

**Inventory control** — stock management with low-inventory alerts. Feed consumption is blocked when stock runs out.

**Expense logging** — categorized costs per batch: medicine, transport, labor, other.

**Sales module** — revenue entry with automatic profit calculation at sale time.

**Profitability reports** — per-batch breakdown of all costs vs. revenue, margin %, CSV/JSON export.

**Subscription gating** — access auto-revoked when a subscription lapses. Free vs. paid plan differentiation enforced at the API layer, not just the frontend.

**Email notifications** — transactional emails via SMTP for account and billing events.

## Data Model

| Model | Purpose |
|---|---|
| `Lote` | Pig batch — count, open date, status |
| `ConcentradoTipo` | Feed type with current price and unit |
| `ConsumoRegistro` | Daily feed usage with price snapshot |
| `InventarioMovimiento` | Stock entries, exits, adjustments |
| `GastoAdicional` | Miscellaneous expenses per batch |
| `VentaRegistro` | Sale event — weight, price, total revenue |

```
Profit = Revenue − (Feed Costs + Additional Expenses)
Margin = (Profit / Revenue) × 100
```

## Project Structure

```
porcine-saas/
├── backend/
│   └── src/
│       ├── config/         # DB connection
│       ├── controllers/    # Business logic
│       ├── models/         # Mongoose schemas
│       ├── routes/         # REST endpoints
│       └── middleware/     # Auth, subscription check
├── frontend/
│   └── src/
│       ├── app/            # Next.js App Router pages
│       ├── components/     # UI components
│       └── lib/            # API client, utilities
└── docker-compose.yml
```

## Local Setup

```bash
# Backend
cd backend
cp .env.example .env      # fill in MONGO_URI and JWT_SECRET
npm install
npm run dev               # http://localhost:3001

# Frontend
cd frontend
cp .env.local.example .env.local
npm install
npm run dev               # http://localhost:3000

# Or both at once
docker-compose up -d
```

## Core API Endpoints

```
GET  /api/lotes                       List batches
POST /api/lotes                       Create batch
GET  /api/lotes/:id/resumen           Batch cost summary

GET  /api/inventario                  Current stock
POST /api/inventario/compra           Record purchase

POST /api/consumos                    Log feed consumption (validates stock)

GET  /api/reportes/rentabilidad/:id   Profitability report
GET  /api/reportes/exportar/:id       Export batch data (CSV / JSON)
```

## Highlights

- Deployed and running in production with real paying clients
- Price-locked historical records prevent retroactive cost manipulation
- Subscription gating enforced at the API layer, not only the UI
- Containerized with Docker for consistent deployment on Railway

---

Built by Homer Palada — CS student at Universidad Católica de Honduras, graduating May 2027.
