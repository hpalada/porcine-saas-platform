"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigrations = runMigrations;
const VacunacionLote_1 = __importDefault(require("../models/VacunacionLote"));
const OtroConsumo_1 = __importDefault(require("../models/OtroConsumo"));
async function runMigrations() {
    try {
        console.log('🔄 Iniciando migraciones...');
        // Migración 1: Solo rellenar campos que LITERALMENTE no existen en BD
        // No tocamos registros que tienen 0 (pueden ser datos reales del cliente)
        const resultado1 = await VacunacionLote_1.default.updateMany({
            $or: [
                { precioUnitario: { $exists: false } },
                { precioUnitario: null },
                { cantidadAplicada: { $exists: false } },
                { cantidadAplicada: null },
            ]
        }, [
            {
                $set: {
                    precioUnitario: { $cond: [{ $in: ['$precioUnitario', [null, undefined]] }, 0, '$precioUnitario'] },
                    cantidadAplicada: { $cond: [{ $in: ['$cantidadAplicada', [null, undefined]] }, 1, '$cantidadAplicada'] },
                }
            }
        ]);
        if (resultado1.modifiedCount > 0) {
            console.log(`✅ Vacunaciones sin precio normalizadas: ${resultado1.modifiedCount}`);
        }
        // Migración 2: Otros consumos sin precioUnitario
        const resultado2 = await OtroConsumo_1.default.updateMany({
            $or: [
                { precioUnitario: { $exists: false } },
                { precioUnitario: null },
            ]
        }, { $set: { precioUnitario: 0 } });
        if (resultado2.modifiedCount > 0) {
            console.log(`✅ Otros consumos normalizados: ${resultado2.modifiedCount}`);
        }
        console.log('✅ Migraciones completadas');
    }
    catch (error) {
        console.error('❌ Error en migraciones:', error);
    }
}
//# sourceMappingURL=index.js.map