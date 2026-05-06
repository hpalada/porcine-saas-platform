# Porcine SaaS Platform

Full-stack SaaS platform for pig farm management — production tracking, cost control, inventory, and profitability analytics. Built and deployed to production; used daily by real clients.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React 18, Tailwind CSS, SWR |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB, Mongoose |
| Auth | JWT with subscription gating |
| Infra | Docker, Railway |

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌──────────────┐
│   Frontend      │────▶│   Backend API   │────▶│   MongoDB    │
│   Next.js 14    │◀────│   Express/TS    │◀────│   Mongoose   │
│   Tailwind CSS  │     │   JWT Auth      │     │   Atlas      │
└─────────────────┘     └─────────────────┘     └──────────────┘
```

## Key Features

- **Batch management** — full lifecycle tracking of pig batches (quantity, dates, status)
- **Feed cost tracking** — daily consumption with historical price capture (price locked at time of entry)
- **Inventory control** — stock management with low-inventory alerts; consumption blocked when stock runs out
- **Expense logging** — categorized additional costs (medicine, transport, labor) per batch
- **Sales module** — revenue entry with automatic profit calculation
- **Profitability reports** — per-batch breakdown of costs vs. revenue, margin %, CSV/JSON export
- **Subscription gating** — multi-tenant architecture; access auto-revoked when subscription lapses
- **Email notifications** — transactional emails via SMTP for account and billing events

## Data Model

| Model | Purpose |
|---|---|
| `Lote` | Pig batch (count, start date, status) |
| `ConcentradoTipo` | Feed type with current price and unit |
| `ConsumoRegistro` | Daily feed usage with price snapshot |
| `InventarioMovimiento` | Stock entries, exits, adjustments |
| `GastoAdicional` | Miscellaneous expenses per batch |
| `VentaRegistro` | Sale events with weight, price, revenue |

### Profitability Formula

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
│       ├── app/            # Next.js App Router
│       ├── components/     # UI components
│       └── lib/            # API client, utils
└── docker-compose.yml
```

## Local Setup

```bash
# 1. Backend
cd backend
cp .env.example .env      # fill in MongoDB URI and JWT secret
npm install
npm run seed              # optional: seed sample data
npm run dev               # http://localhost:3001

# 2. Frontend
cd frontend
cp .env.local.example .env.local
npm install
npm run dev               # http://localhost:3000

# Or run both with Docker
docker-compose up -d
```

## REST API — Core Endpoints

```
GET  /api/lotes                       List batches
POST /api/lotes                       Create batch
GET  /api/lotes/:id/resumen           Batch cost summary

GET  /api/inventario                  Current stock
POST /api/inventario/compra           Record purchase

POST /api/consumos                    Log feed consumption (validates stock)

GET  /api/reportes/rentabilidad/:id   Full profitability report
GET  /api/reportes/exportar/:id       Export batch data (CSV/JSON)
```

## Highlights

- Deployed and running in production with real clients
- Designed the relational data model and full REST API from scratch
- Implemented subscription-based access control that auto-revokes on cancellation
- Historical price capture ensures cost records are immutable after entry
- Containerized with Docker for consistent local and cloud deployment on Railway
