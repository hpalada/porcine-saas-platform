/**
 * Setea valores por defecto en empresas y concentrados que aún tienen
 * campos undefined (creados antes de añadir esos campos al schema).
 * Idempotente.
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/porcine-saas';

async function run() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection;

  const empresaDefaults: Record<string, any> = {
    notificacionesActivas: true,
    alertaStockBajo: true,
    nivelStockCritico: 50,
  };

  let empresasAct = 0;
  for (const [field, defVal] of Object.entries(empresaDefaults)) {
    const r = await db.collection('empresas').updateMany(
      { [field]: { $exists: false } },
      { $set: { [field]: defVal } }
    );
    empresasAct += r.modifiedCount;
  }
  console.log(`✅ Empresas: ${empresasAct} campos completados`);

  const r2 = await db.collection('concentradotipos').updateMany(
    { pesoPorSaco: { $exists: false } },
    { $set: { pesoPorSaco: 50 } }
  );
  console.log(`✅ Concentrados: ${r2.modifiedCount} con pesoPorSaco=50`);

  await mongoose.disconnect();
}

run().catch((e) => { console.error('❌ Error:', e); process.exit(1); });
