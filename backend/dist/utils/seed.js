"use strict";
/**
 * Seed script para inicializar la base de datos con datos de ejemplo
 * Ejecutar: npm run seed
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const ConcentradoTipo_1 = __importDefault(require("../models/ConcentradoTipo"));
const Lote_1 = require("../models/Lote");
const InventarioMovimiento_1 = __importDefault(require("../models/InventarioMovimiento"));
const Settings_1 = require("../models/Settings");
dotenv_1.default.config();
async function seed() {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/porcine-saas';
    try {
        await mongoose_1.default.connect(mongoUri);
        console.log('✅ MongoDB conectado');
        // Limpiar datos existentes
        await ConcentradoTipo_1.default.deleteMany({});
        await Lote_1.Lote.deleteMany({});
        await InventarioMovimiento_1.default.deleteMany({});
        console.log('🗑️ Datos existentes eliminados');
        // Crear configuración por defecto
        await Settings_1.Settings.deleteMany({});
        const settings = new Settings_1.Settings({
            idioma: 'es',
            tema: 'dark',
            nombreGranja: 'Mi Granja Porcina',
            ubicacion: 'Honduras',
            contacto: '+504 0000-0000',
            email: 'contacto@granja.com',
            moneda: 'HNL',
            tasaCambio: 24.5,
            notificacionesActivas: true,
            alertaStockBajo: true,
            nivelStockCritico: 50,
            horaBackup: '02:00',
            backupAutomatico: true,
            registroAuditoria: true,
        });
        await settings.save();
        console.log('✅ Configuración por defecto creada');
        // Crear tipos de concentrado
        const concentradosData = [
            { nombre: 'Fase 1 - Pre-inicio', descripcion: 'Para lechones hasta 10kg', precioActual: 85000, unidad: 'saco' },
            { nombre: 'Fase 2 - Inicio', descripcion: 'Para cerdos 10-25kg', precioActual: 78000, unidad: 'saco' },
            { nombre: 'Fase 3 - Crecimiento', descripcion: 'Para cerdos 25-50kg', precioActual: 72000, unidad: 'saco' },
            { nombre: 'Fase 4 - Engorde', descripcion: 'Para cerdos 50-80kg', precioActual: 68000, unidad: 'saco' },
            { nombre: 'Ceba Final', descripcion: 'Para cerdos 80kg+', precioActual: 65000, unidad: 'saco' }
        ];
        const concentrados = await ConcentradoTipo_1.default.insertMany(concentradosData);
        console.log(`✅ ${concentrados.length} tipos de concentrado creados`);
        // Crear lotes de ejemplo
        const lotesData = [
            { nombre: 'Lote A-2026-01', cantidadCerdos: 500, fechaInicio: new Date('2026-01-15'), estado: 'activo' },
            { nombre: 'Lote B-2026-02', cantidadCerdos: 350, fechaInicio: new Date('2026-02-01'), estado: 'activo' },
            { nombre: 'Lote C-2025-12', cantidadCerdos: 400, fechaInicio: new Date('2025-12-01'), estado: 'finalizado' }
        ];
        const lotes = await Lote_1.Lote.insertMany(lotesData);
        console.log(`✅ ${lotes.length} lotes creados`);
        // Crear stock inicial de inventario
        const stockInicial = [
            { concentrado: concentrados[0], cantidad: 100 },
            { concentrado: concentrados[1], cantidad: 150 },
            { concentrado: concentrados[2], cantidad: 200 },
            { concentrado: concentrados[3], cantidad: 180 },
            { concentrado: concentrados[4], cantidad: 120 }
        ];
        for (const item of stockInicial) {
            await InventarioMovimiento_1.default.create({
                concentradoTipoId: item.concentrado._id,
                tipo: 'entrada',
                cantidad: item.cantidad,
                stockAnterior: 0,
                stockNuevo: item.cantidad,
                motivo: 'Stock inicial - Seed',
                fecha: new Date()
            });
        }
        console.log('✅ Stock inicial registrado');
        console.log('\n🎉 Seed completado exitosamente!');
        console.log('\nDatos creados:');
        console.log('- Configuración por defecto del sistema');
        console.log('- 5 tipos de concentrado con precios');
        console.log('- 3 lotes (2 activos, 1 finalizado)');
        console.log('- Stock inicial para cada concentrado');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error en seed:', error);
        process.exit(1);
    }
}
seed();
//# sourceMappingURL=seed.js.map