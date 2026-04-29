/**
 * Seed script para inicializar la base de datos con datos de ejemplo
 * Ejecutar: npm run seed
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ConcentradoTipo from '../models/ConcentradoTipo';
import { Lote } from '../models/Lote';
import InventarioMovimiento from '../models/InventarioMovimiento';
import { Settings } from '../models/Settings';

dotenv.config();

async function seed() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/porcine-saas';

  try {
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB conectado');

    // Limpiar datos existentes
    await ConcentradoTipo.deleteMany({});
    await Lote.deleteMany({});
    await InventarioMovimiento.deleteMany({});
    console.log('🗑️ Datos existentes eliminados');

    // Crear configuración por defecto
    await Settings.deleteMany({});
    const settings = new Settings({
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

    const concentrados = await ConcentradoTipo.insertMany(concentradosData);
    console.log(`✅ ${concentrados.length} tipos de concentrado creados`);

    // Crear lotes de ejemplo
    const lotesData = [
      { nombre: 'Lote A-2026-01', cantidadCerdos: 500, fechaInicio: new Date('2026-01-15'), estado: 'activo' },
      { nombre: 'Lote B-2026-02', cantidadCerdos: 350, fechaInicio: new Date('2026-02-01'), estado: 'activo' },
      { nombre: 'Lote C-2025-12', cantidadCerdos: 400, fechaInicio: new Date('2025-12-01'), estado: 'finalizado' }
    ];

    const lotes = await Lote.insertMany(lotesData);
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
      await InventarioMovimiento.create({
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
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
}

seed();
