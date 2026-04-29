"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/porcine';
async function run() {
    await mongoose_1.default.connect(MONGO_URI);
    const result = await mongoose_1.default.connection.collection('empresas').updateMany({ suscripcionActiva: { $ne: true } }, { $set: { suscripcionActiva: true } });
    console.log(`✅ Actualizadas ${result.modifiedCount} empresas → suscripcionActiva: true`);
    await mongoose_1.default.disconnect();
}
run().catch((e) => { console.error(e); process.exit(1); });
//# sourceMappingURL=fix-suscripciones.js.map