import { Router } from 'express';
import { getLotes, getLote, createLote, updateLote, deleteLote, updateCantidadSalida, getLotesStats, getLoteResumen } from '../controllers/lotes.controller';
import { concentradosController } from '../controllers/concentrados.controller';
import { inventarioController } from '../controllers/inventario.controller';
import { consumosController } from '../controllers/consumos.controller';
import { gastosController } from '../controllers/gastos.controller';
import { ventasController } from '../controllers/ventas.controller';
import { reportesController } from '../controllers/reportes.controller';
import { currencyController } from '../controllers/currency.controller';
import { notasController } from '../controllers/notas.controller';
import { empresaController } from '../controllers/empresa.controller';
import { vacunacionController } from '../controllers/vacunacion.controller';
import { otroConsumoController } from '../controllers/otroConsumo.controller';
import { mortalidadController } from '../controllers/mortalidad.controller';
import { verificarToken } from '../controllers/auth.controller';

const router = Router();

// ============== LOTES ==============
router.get('/lotes', verificarToken, getLotes);
router.get('/lotes/stats', verificarToken, getLotesStats);
router.get('/lotes/:id', verificarToken, getLote);
router.get('/lotes/:id/resumen', verificarToken, getLoteResumen);
router.post('/lotes', verificarToken, createLote);
router.put('/lotes/:id', verificarToken, updateLote);
router.put('/lotes/:id/cantidad-salida', verificarToken, updateCantidadSalida);
router.delete('/lotes/:id', verificarToken, deleteLote);

// ============== NOTAS DE LOTE ==============
router.get('/notas/lote/:loteId', verificarToken, notasController.porLote.bind(notasController));
router.post('/notas', verificarToken, notasController.create.bind(notasController));
router.delete('/notas/:id', verificarToken, notasController.delete.bind(notasController));

// ============== CONCENTRADOS ==============
router.get('/concentrados', verificarToken, concentradosController.index.bind(concentradosController));
router.get('/concentrados/:id', verificarToken, concentradosController.show.bind(concentradosController));
router.post('/concentrados', verificarToken, concentradosController.create.bind(concentradosController));
router.put('/concentrados/:id', verificarToken, concentradosController.update.bind(concentradosController));
router.delete('/concentrados/:id', verificarToken, concentradosController.delete.bind(concentradosController));

// ============== INVENTARIO ==============
router.get('/inventario', verificarToken, inventarioController.stockActual.bind(inventarioController));
router.get('/inventario/historial', verificarToken, inventarioController.historial.bind(inventarioController));
router.post('/inventario/compra', verificarToken, inventarioController.registrarCompra.bind(inventarioController));
router.post('/inventario/ajuste', verificarToken, inventarioController.registrarAjuste.bind(inventarioController));

// ============== CONSUMOS (CORE - ALIMENTO) ==============
router.get('/consumos', verificarToken, consumosController.index.bind(consumosController));
router.get('/consumos/lote/:id', verificarToken, consumosController.porLote.bind(consumosController));
router.get('/consumos/resumen/:id', verificarToken, consumosController.resumen.bind(consumosController));
router.post('/consumos', verificarToken, consumosController.registrar.bind(consumosController));
router.delete('/consumos/:id', verificarToken, consumosController.delete.bind(consumosController));

// ============== OTROS CONSUMOS (MEDICAMENTOS, VITAMINAS, AGUA, etc.) ==============
router.get('/otros-consumos', verificarToken, otroConsumoController.index.bind(otroConsumoController));
router.get('/otros-consumos/lote/:id', verificarToken, otroConsumoController.porLote.bind(otroConsumoController));
router.get('/otros-consumos/resumen/:id', verificarToken, otroConsumoController.resumenPorLote.bind(otroConsumoController));
router.post('/otros-consumos', verificarToken, otroConsumoController.registrar.bind(otroConsumoController));
router.put('/otros-consumos/:id', verificarToken, otroConsumoController.update.bind(otroConsumoController));
router.delete('/otros-consumos/:id', verificarToken, otroConsumoController.delete.bind(otroConsumoController));

// ============== GASTOS ==============
router.get('/gastos', verificarToken, gastosController.index.bind(gastosController));
router.get('/gastos/:id', verificarToken, gastosController.show.bind(gastosController));
router.post('/gastos', verificarToken, gastosController.create.bind(gastosController));
router.put('/gastos/:id', verificarToken, gastosController.update.bind(gastosController));
router.delete('/gastos/:id', verificarToken, gastosController.delete.bind(gastosController));

// ============== VENTAS ==============
router.get('/ventas', verificarToken, ventasController.index.bind(ventasController));
router.get('/ventas/:id', verificarToken, ventasController.show.bind(ventasController));
router.post('/ventas', verificarToken, ventasController.create.bind(ventasController));
router.put('/ventas/:id', verificarToken, ventasController.update.bind(ventasController));
router.delete('/ventas/:id', verificarToken, ventasController.delete.bind(ventasController));

// ============== REPORTES ==============
router.get('/reportes/dashboard', verificarToken, reportesController.dashboard.bind(reportesController));
router.get('/reportes/rentabilidad/:loteId', verificarToken, reportesController.rentabilidad.bind(reportesController));
router.get('/reportes/resumen-completo/:loteId', verificarToken, reportesController.resumenCompletoPorLote.bind(reportesController));
router.get('/reportes/consumo-diario', verificarToken, reportesController.consumoDiario.bind(reportesController));
router.get('/reportes/costo-acumulado/:loteId', verificarToken, reportesController.costoAcumulado.bind(reportesController));
router.get('/reportes/exportar/:loteId', verificarToken, reportesController.exportar.bind(reportesController));

// ============== MONEDA ==============
router.post('/moneda/convertir', currencyController.convertToHNL.bind(currencyController));
router.get('/moneda/tipo-cambio', currencyController.exchangeRate.bind(currencyController));

// ============== VACUNACIONES ==============
router.get('/vacunaciones', verificarToken, vacunacionController.index.bind(vacunacionController));
router.get('/vacunaciones/lote/:loteId', verificarToken, vacunacionController.porLote.bind(vacunacionController));
router.post('/vacunaciones', verificarToken, vacunacionController.create.bind(vacunacionController));
router.put('/vacunaciones/:id', verificarToken, vacunacionController.update.bind(vacunacionController));
router.delete('/vacunaciones/:id', verificarToken, vacunacionController.delete.bind(vacunacionController));

// ============== MORTALIDADES ==============
router.get('/mortalidades', verificarToken, mortalidadController.index.bind(mortalidadController));
router.get('/mortalidades/lote/:id', verificarToken, mortalidadController.porLote.bind(mortalidadController));
router.post('/mortalidades', verificarToken, mortalidadController.crear.bind(mortalidadController));
router.put('/mortalidades/:id', verificarToken, mortalidadController.actualizar.bind(mortalidadController));
router.delete('/mortalidades/:id', verificarToken, mortalidadController.eliminar.bind(mortalidadController));

// ============== EMPRESA ==============
router.get('/empresa', verificarToken, empresaController.get.bind(empresaController));
router.put('/empresa', verificarToken, empresaController.update.bind(empresaController));
router.post('/empresa/cancelar-suscripcion', verificarToken, empresaController.cancelarSuscripcion.bind(empresaController));
router.post('/empresa/reactivar-suscripcion', verificarToken, empresaController.reactivarSuscripcion.bind(empresaController));

// ============== DEBUG ==============
router.get('/debug/lote/:loteId', verificarToken, async (req, res) => {
  try {
    const empresaId = (req as any).empresaId;
    const loteId = new (require('mongoose')).Types.ObjectId(req.params.loteId);
    const Lote = require('../models/Lote').Lote;
    const VacunacionLote = require('../models/VacunacionLote').default;
    const MortalidadLote = require('../models/MortalidadLote').default;
    const ConsumoRegistro = require('../models/ConsumoRegistro');
    const VentaRegistro = require('../models/VentaRegistro');
    const GastoAdicional = require('../models/GastoAdicional');

    const [lote, vacunaciones, mortalidades, consumos, ventas, gastos] = await Promise.all([
      Lote.findOne({ _id: loteId, empresaId }),
      VacunacionLote.countDocuments({ loteId, empresaId }),
      MortalidadLote.countDocuments({ loteId, empresaId }),
      ConsumoRegistro.countDocuments({ loteId, empresaId }),
      VentaRegistro.countDocuments({ loteId, empresaId }),
      GastoAdicional.countDocuments({ loteId, empresaId }),
    ]);

    res.json({
      lote: lote ? { _id: lote._id, nombre: lote.nombre, cantidadInicial: lote.cantidadInicial } : null,
      vacunaciones: vacunaciones,
      mortalidades: mortalidades,
      consumos: consumos,
      ventas: ventas,
      gastos: gastos,
      empresaId: empresaId,
      loteId: req.params.loteId,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/debug/seed-test-data/:loteId', verificarToken, async (req, res) => {
  try {
    const empresaId = (req as any).empresaId;
    const loteId = new (require('mongoose')).Types.ObjectId(req.params.loteId);
    const Lote = require('../models/Lote').Lote;
    const ConsumoRegistro = require('../models/ConsumoRegistro');
    const VacunacionLote = require('../models/VacunacionLote').default;
    const VentaRegistro = require('../models/VentaRegistro');
    const GastoAdicional = require('../models/GastoAdicional');
    const mongoose = require('mongoose');

    const lote = await Lote.findOne({ _id: loteId, empresaId });
    if (!lote) return res.status(404).json({ error: 'Lote no encontrado' });

    // Crear datos de prueba
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Consumos de alimento
    const mockConcentrado = new mongoose.Types.ObjectId();
    await ConsumoRegistro.create([
      {
        empresaId,
        loteId,
        concentradoTipoId: mockConcentrado,
        cantidad: 50,
        precioUnitario: 250,
        costoTotal: 12500,
        fecha: oneWeekAgo,
      },
      {
        empresaId,
        loteId,
        concentradoTipoId: mockConcentrado,
        cantidad: 50,
        precioUnitario: 250,
        costoTotal: 12500,
        fecha: new Date(oneWeekAgo.getTime() + 3 * 24 * 60 * 60 * 1000),
      },
    ]);

    // Vacunaciones
    await VacunacionLote.create([
      {
        empresaId,
        loteId,
        vacuna: 'Neumovac (Pneumococcal)',
        cantidadAplicada: 50,
        precioUnitario: 150,
        fecha: oneWeekAgo,
        dosis: '2ml',
      },
      {
        empresaId,
        loteId,
        vacuna: 'PCV13 + PPSV23',
        cantidadAplicada: 50,
        precioUnitario: 200,
        fecha: new Date(oneWeekAgo.getTime() + 5 * 24 * 60 * 60 * 1000),
        dosis: '1ml',
      },
    ]);

    // Gastos adicionales
    await GastoAdicional.create([
      {
        empresaId,
        loteId,
        categoria: 'transporte',
        descripcion: 'Transporte de alimento',
        monto: 5000,
        fecha: oneWeekAgo,
      },
      {
        empresaId,
        loteId,
        categoria: 'medicina',
        descripcion: 'Medicinas varias',
        monto: 3000,
        fecha: new Date(oneWeekAgo.getTime() + 2 * 24 * 60 * 60 * 1000),
      },
    ]);

    // Ventas
    await VentaRegistro.create({
      empresaId,
      loteId,
      cantidadCerdos: 45,
      pesoTotalKg: 1350,
      precioPorKg: 45,
      ingresoTotal: 60750,
      comprador: 'Test Buyer',
      fechaVenta: today,
    });

    res.json({
      message: 'Datos de prueba creados exitosamente',
      consumos: 2,
      vacunaciones: 2,
      gastos: 2,
      ventas: 1,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/debug/fix-vacunaciones', verificarToken, async (req, res) => {
  try {
    const empresaId = (req as any).empresaId;
    const VacunacionLote = require('../models/VacunacionLote').default;

    const updated = await VacunacionLote.updateMany(
      {
        empresaId,
        $or: [
          { precioUnitario: { $exists: false } },
          { precioUnitario: null },
          { precioUnitario: 0 },
          { cantidadAplicada: { $exists: false } },
          { cantidadAplicada: null },
        ]
      },
      {
        $set: {
          precioUnitario: 150,
          cantidadAplicada: 50,
        }
      }
    );

    res.json({
      message: 'Vacunaciones reparadas exitosamente',
      actualizado: updated.modifiedCount,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// (Las configuraciones de empresa ahora se manejan via /api/empresa)

export default router;