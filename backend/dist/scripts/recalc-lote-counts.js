"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Recalcula cantidadSalida y cantidadActual de cada Lote a partir de las
 * ventas existentes en la base de datos. Útil para corregir lotes cuyas
 * ventas históricas se registraron antes de que el sistema actualizara
 * automáticamente el conteo de animales del lote.
 *
 * Idempotente: se puede correr varias veces sin efectos secundarios.
 *
 * Uso:
 *   cd backend
 *   npx ts-node src/scripts/recalc-lote-counts.ts
 */
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/porcine';
async function run() {
    await mongoose_1.default.connect(MONGO_URI);
    const db = mongoose_1.default.connection;
    const lotes = await db.collection('lotes').find({}).toArray();
    console.log(`Lotes encontrados: ${lotes.length}`);
    let updated = 0;
    for (const lote of lotes) {
        const agg = await db.collection('ventaregistros').aggregate([
            { $match: { loteId: lote._id } },
            { $group: { _id: null, totalCerdos: { $sum: '$cantidadCerdos' } } },
        ]).toArray();
        const totalVendidos = agg[0]?.totalCerdos || 0;
        const cantidadInicial = lote.cantidadInicial || 0;
        const nuevaSalida = Math.min(totalVendidos, cantidadInicial);
        const nuevaActual = Math.max(0, cantidadInicial - nuevaSalida);
        const nuevoEstado = nuevaActual === 0 && cantidadInicial > 0 ? 'finalizado' : (lote.estado || 'activo');
        if (lote.cantidadSalida !== nuevaSalida ||
            lote.cantidadActual !== nuevaActual ||
            lote.estado !== nuevoEstado) {
            await db.collection('lotes').updateOne({ _id: lote._id }, { $set: { cantidadSalida: nuevaSalida, cantidadActual: nuevaActual, estado: nuevoEstado } });
            updated++;
            console.log(`  · Lote "${lote.nombre}": vendidos=${totalVendidos}, salida=${nuevaSalida}, activos=${nuevaActual}, estado=${nuevoEstado}`);
        }
    }
    console.log(`\n✅ Lotes actualizados: ${updated} / ${lotes.length}`);
    await mongoose_1.default.disconnect();
}
run().catch((e) => { console.error('❌ Error en migración:', e); process.exit(1); });
//# sourceMappingURL=recalc-lote-counts.js.map