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
        // Migración 1: Reparar vacunaciones antiguas sin precioUnitario o cantidadAplicada
        const vacunacionesConProblemas = await VacunacionLote_1.default.countDocuments({
            $or: [
                { precioUnitario: { $exists: false } },
                { precioUnitario: null },
                { precioUnitario: 0 },
                { cantidadAplicada: { $exists: false } },
                { cantidadAplicada: null },
                { cantidadAplicada: 0 },
            ]
        });
        if (vacunacionesConProblemas > 0) {
            const resultado = await VacunacionLote_1.default.updateMany({
                $or: [
                    { precioUnitario: { $exists: false } },
                    { precioUnitario: null },
                    { precioUnitario: 0 },
                    { cantidadAplicada: { $exists: false } },
                    { cantidadAplicada: null },
                    { cantidadAplicada: 0 },
                ]
            }, {
                $set: {
                    precioUnitario: 150,
                    cantidadAplicada: 50,
                }
            });
            console.log(`✅ Reparadas ${resultado.modifiedCount} vacunaciones antiguas`);
        }
        // Migración 2: Reparar otros consumos sin precioUnitario
        const otrosConsumosConProblemas = await OtroConsumo_1.default.countDocuments({
            $or: [
                { precioUnitario: { $exists: false } },
                { precioUnitario: null },
            ]
        });
        if (otrosConsumosConProblemas > 0) {
            const resultado = await OtroConsumo_1.default.updateMany({
                $or: [
                    { precioUnitario: { $exists: false } },
                    { precioUnitario: null },
                ]
            }, {
                $set: {
                    precioUnitario: 100,
                }
            });
            console.log(`✅ Reparados ${resultado.modifiedCount} otros consumos antiguos`);
        }
        console.log('✅ Migraciones completadas exitosamente');
    }
    catch (error) {
        console.error('❌ Error en migraciones:', error);
        // No lanzamos error para no impedir el inicio del servidor
    }
}
//# sourceMappingURL=index.js.map