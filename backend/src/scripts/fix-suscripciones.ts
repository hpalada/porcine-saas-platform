import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/porcine';

async function run() {
  await mongoose.connect(MONGO_URI);
  const result = await mongoose.connection.collection('empresas').updateMany(
    { suscripcionActiva: { $ne: true } },
    { $set: { suscripcionActiva: true } }
  );
  console.log(`✅ Actualizadas ${result.modifiedCount} empresas → suscripcionActiva: true`);
  await mongoose.disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });
