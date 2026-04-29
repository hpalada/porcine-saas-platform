"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Setea valores por defecto en empresas y concentrados que aún tienen
 * campos undefined (creados antes de añadir esos campos al schema).
 * Idempotente.
 */
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/porcine-saas';
async function run() {
    await mongoose_1.default.connect(MONGO_URI);
    const db = mongoose_1.default.connection;
    const empresaDefaults = {
        notificacionesActivas: true,
        alertaStockBajo: true,
        nivelStockCritico: 50,
    };
    let empresasAct = 0;
    for (const [field, defVal] of Object.entries(empresaDefaults)) {
        const r = await db.collection('empresas').updateMany({ [field]: { $exists: false } }, { $set: { [field]: defVal } });
        empresasAct += r.modifiedCount;
    }
    console.log(`✅ Empresas: ${empresasAct} campos completados`);
    const r2 = await db.collection('concentradotipos').updateMany({ pesoPorSaco: { $exists: false } }, { $set: { pesoPorSaco: 50 } });
    console.log(`✅ Concentrados: ${r2.modifiedCount} con pesoPorSaco=50`);
    await mongoose_1.default.disconnect();
}
run().catch((e) => { console.error('❌ Error:', e); process.exit(1); });
//# sourceMappingURL=backfill-defaults.js.map