/**
 * Backfills empresaId on all records that were created before multi-tenancy was added.
 * Safe to run multiple times (only updates records missing empresaId).
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/porcine';

async function run() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection;

  // ── 1. Build loteId → empresaId lookup ──────────────────────────────────────
  const lotes = await db.collection('lotes').find({}, { projection: { _id: 1, empresaId: 1 } }).toArray();
  const loteMap = new Map<string, mongoose.Types.ObjectId>();
  for (const l of lotes) {
    if (l.empresaId) loteMap.set(l._id.toString(), l.empresaId);
  }
  console.log(`Lotes encontrados: ${loteMap.size}`);

  // ── 2. ConsumoRegistro ────────────────────────────────────────────────────────
  const consumos = await db.collection('consumoregistros').find({ empresaId: { $exists: false } }).toArray();
  let consumosUpdated = 0;
  for (const c of consumos) {
    const eId = loteMap.get(c.loteId?.toString());
    if (eId) {
      await db.collection('consumoregistros').updateOne({ _id: c._id }, { $set: { empresaId: eId } });
      consumosUpdated++;
    }
  }
  console.log(`ConsumoRegistro actualizados: ${consumosUpdated} / ${consumos.length}`);

  // ── 3. VentaRegistro ──────────────────────────────────────────────────────────
  const ventas = await db.collection('ventaregistros').find({ empresaId: { $exists: false } }).toArray();
  let ventasUpdated = 0;
  for (const v of ventas) {
    const eId = loteMap.get(v.loteId?.toString());
    if (eId) {
      await db.collection('ventaregistros').updateOne({ _id: v._id }, { $set: { empresaId: eId } });
      ventasUpdated++;
    }
  }
  console.log(`VentaRegistro actualizados: ${ventasUpdated} / ${ventas.length}`);

  // ── 4. GastoAdicional ─────────────────────────────────────────────────────────
  const gastos = await db.collection('gastoadicionals').find({ empresaId: { $exists: false } }).toArray();
  let gastosUpdated = 0;
  for (const g of gastos) {
    const eId = loteMap.get(g.loteId?.toString());
    if (eId) {
      await db.collection('gastoadicionals').updateOne({ _id: g._id }, { $set: { empresaId: eId } });
      gastosUpdated++;
    }
  }
  // Fallback: gastos without loteId → assign to empresa with most lotes
  const remainingGastos = await db.collection('gastoadicionals').find({ empresaId: { $exists: false } }).toArray();
  if (remainingGastos.length > 0) {
    const empresaConMasLotes = await db.collection('lotes').aggregate([
      { $group: { _id: '$empresaId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]).toArray();
    if (empresaConMasLotes[0]) {
      await db.collection('gastoadicionals').updateMany(
        { empresaId: { $exists: false } },
        { $set: { empresaId: empresaConMasLotes[0]._id } }
      );
      gastosUpdated += remainingGastos.length;
    }
  }
  console.log(`GastoAdicional actualizados: ${gastosUpdated} / ${gastos.length}`);

  // ── 5. ConcentradoTipo ────────────────────────────────────────────────────────
  // Infer empresa from InventarioMovimiento that references this concentrado and has a loteId-traceable empresa.
  // Strategy: look at which empresa's movimientos reference this concentrado.
  const concentrados = await db.collection('concentradotipos').find({ empresaId: { $exists: false } }).toArray();
  let concentradosUpdated = 0;
  for (const c of concentrados) {
    // Check consumoregistros linked to lotes with empresaId
    const consumo = await db.collection('consumoregistros').findOne({ concentradoTipoId: c._id, empresaId: { $exists: true } });
    if (consumo?.empresaId) {
      await db.collection('concentradotipos').updateOne({ _id: c._id }, { $set: { empresaId: consumo.empresaId } });
      concentradosUpdated++;
      continue;
    }
    // Fallback: find any inventario movimiento with this concentrado that has empresaId
    const mov = await db.collection('inventariomovimientos').findOne({ concentradoTipoId: c._id, empresaId: { $exists: true } });
    if (mov?.empresaId) {
      await db.collection('concentradotipos').updateOne({ _id: c._id }, { $set: { empresaId: mov.empresaId } });
      concentradosUpdated++;
    }
  }
  // Second pass: concentrados still without empresaId → assign to empresa with most lotes
  const remainingConcentrados = await db.collection('concentradotipos').find({ empresaId: { $exists: false } }).toArray();
  if (remainingConcentrados.length > 0) {
    const empresaConMasLotes = await db.collection('lotes').aggregate([
      { $group: { _id: '$empresaId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]).toArray();
    if (empresaConMasLotes[0]) {
      const defaultEmpresaId = empresaConMasLotes[0]._id;
      await db.collection('concentradotipos').updateMany(
        { empresaId: { $exists: false } },
        { $set: { empresaId: defaultEmpresaId } }
      );
      concentradosUpdated += remainingConcentrados.length;
    }
  }
  console.log(`ConcentradoTipo actualizados: ${concentradosUpdated} / ${concentrados.length}`);

  // ── 6. InventarioMovimiento ────────────────────────────────────────────────────
  const movimientos = await db.collection('inventariomovimientos').find({ empresaId: { $exists: false } }).toArray();
  let movUpdated = 0;
  // Build concentradoTipo → empresaId lookup (now they should all have it after step 5)
  const concentradoMap = new Map<string, mongoose.Types.ObjectId>();
  const allConcentrados = await db.collection('concentradotipos').find({ empresaId: { $exists: true } }, { projection: { _id: 1, empresaId: 1 } }).toArray();
  for (const c of allConcentrados) concentradoMap.set(c._id.toString(), c.empresaId);

  for (const m of movimientos) {
    const eId = concentradoMap.get(m.concentradoTipoId?.toString());
    if (eId) {
      await db.collection('inventariomovimientos').updateOne({ _id: m._id }, { $set: { empresaId: eId } });
      movUpdated++;
    }
  }
  // Fallback: remaining movimientos → empresa with most lotes
  const remainingMovs = await db.collection('inventariomovimientos').find({ empresaId: { $exists: false } }).toArray();
  if (remainingMovs.length > 0) {
    const empresaConMasLotes = await db.collection('lotes').aggregate([
      { $group: { _id: '$empresaId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]).toArray();
    if (empresaConMasLotes[0]) {
      await db.collection('inventariomovimientos').updateMany(
        { empresaId: { $exists: false } },
        { $set: { empresaId: empresaConMasLotes[0]._id } }
      );
      movUpdated += remainingMovs.length;
    }
  }
  console.log(`InventarioMovimiento actualizados: ${movUpdated} / ${movimientos.length}`);

  // ── 7. VentaRegistro: fix old field name (pesoTotal → pesoTotalKg) ────────────
  const ventasOldSchema = await db.collection('ventaregistros').find({ pesoTotalKg: { $exists: false }, pesoTotal: { $exists: true } }).toArray();
  for (const v of ventasOldSchema) {
    await db.collection('ventaregistros').updateOne(
      { _id: v._id },
      { $rename: { pesoTotal: 'pesoTotalKg' }, $set: { unidadPeso: 'kg' } }
    );
  }
  console.log(`VentaRegistro campo pesoTotal → pesoTotalKg: ${ventasOldSchema.length}`);

  console.log('\n✅ Migración completada.');
  await mongoose.disconnect();
}

run().catch((e) => { console.error('❌ Error en migración:', e); process.exit(1); });
