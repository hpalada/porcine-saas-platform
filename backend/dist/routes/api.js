"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lotes_controller_1 = require("../controllers/lotes.controller");
const concentrados_controller_1 = require("../controllers/concentrados.controller");
const inventario_controller_1 = require("../controllers/inventario.controller");
const consumos_controller_1 = require("../controllers/consumos.controller");
const gastos_controller_1 = require("../controllers/gastos.controller");
const ventas_controller_1 = require("../controllers/ventas.controller");
const reportes_controller_1 = require("../controllers/reportes.controller");
const currency_controller_1 = require("../controllers/currency.controller");
const notas_controller_1 = require("../controllers/notas.controller");
const empresa_controller_1 = require("../controllers/empresa.controller");
const vacunacion_controller_1 = require("../controllers/vacunacion.controller");
const otroConsumo_controller_1 = require("../controllers/otroConsumo.controller");
const mortalidad_controller_1 = require("../controllers/mortalidad.controller");
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
// ============== LOTES ==============
router.get('/lotes', auth_controller_1.verificarToken, lotes_controller_1.getLotes);
router.get('/lotes/stats', auth_controller_1.verificarToken, lotes_controller_1.getLotesStats);
router.get('/lotes/:id', auth_controller_1.verificarToken, lotes_controller_1.getLote);
router.get('/lotes/:id/resumen', auth_controller_1.verificarToken, lotes_controller_1.getLoteResumen);
router.post('/lotes', auth_controller_1.verificarToken, lotes_controller_1.createLote);
router.put('/lotes/:id', auth_controller_1.verificarToken, lotes_controller_1.updateLote);
router.put('/lotes/:id/cantidad-salida', auth_controller_1.verificarToken, lotes_controller_1.updateCantidadSalida);
router.delete('/lotes/:id', auth_controller_1.verificarToken, lotes_controller_1.deleteLote);
// ============== NOTAS DE LOTE ==============
router.get('/notas/lote/:loteId', auth_controller_1.verificarToken, notas_controller_1.notasController.porLote.bind(notas_controller_1.notasController));
router.post('/notas', auth_controller_1.verificarToken, notas_controller_1.notasController.create.bind(notas_controller_1.notasController));
router.delete('/notas/:id', auth_controller_1.verificarToken, notas_controller_1.notasController.delete.bind(notas_controller_1.notasController));
// ============== CONCENTRADOS ==============
router.get('/concentrados', auth_controller_1.verificarToken, concentrados_controller_1.concentradosController.index.bind(concentrados_controller_1.concentradosController));
router.get('/concentrados/:id', auth_controller_1.verificarToken, concentrados_controller_1.concentradosController.show.bind(concentrados_controller_1.concentradosController));
router.post('/concentrados', auth_controller_1.verificarToken, concentrados_controller_1.concentradosController.create.bind(concentrados_controller_1.concentradosController));
router.put('/concentrados/:id', auth_controller_1.verificarToken, concentrados_controller_1.concentradosController.update.bind(concentrados_controller_1.concentradosController));
router.delete('/concentrados/:id', auth_controller_1.verificarToken, concentrados_controller_1.concentradosController.delete.bind(concentrados_controller_1.concentradosController));
// ============== INVENTARIO ==============
router.get('/inventario', auth_controller_1.verificarToken, inventario_controller_1.inventarioController.stockActual.bind(inventario_controller_1.inventarioController));
router.get('/inventario/historial', auth_controller_1.verificarToken, inventario_controller_1.inventarioController.historial.bind(inventario_controller_1.inventarioController));
router.post('/inventario/compra', auth_controller_1.verificarToken, inventario_controller_1.inventarioController.registrarCompra.bind(inventario_controller_1.inventarioController));
router.post('/inventario/ajuste', auth_controller_1.verificarToken, inventario_controller_1.inventarioController.registrarAjuste.bind(inventario_controller_1.inventarioController));
// ============== CONSUMOS (CORE - ALIMENTO) ==============
router.get('/consumos', auth_controller_1.verificarToken, consumos_controller_1.consumosController.index.bind(consumos_controller_1.consumosController));
router.get('/consumos/lote/:id', auth_controller_1.verificarToken, consumos_controller_1.consumosController.porLote.bind(consumos_controller_1.consumosController));
router.get('/consumos/resumen/:id', auth_controller_1.verificarToken, consumos_controller_1.consumosController.resumen.bind(consumos_controller_1.consumosController));
router.post('/consumos', auth_controller_1.verificarToken, consumos_controller_1.consumosController.registrar.bind(consumos_controller_1.consumosController));
router.delete('/consumos/:id', auth_controller_1.verificarToken, consumos_controller_1.consumosController.delete.bind(consumos_controller_1.consumosController));
// ============== OTROS CONSUMOS (MEDICAMENTOS, VITAMINAS, AGUA, etc.) ==============
router.get('/otros-consumos', auth_controller_1.verificarToken, otroConsumo_controller_1.otroConsumoController.index.bind(otroConsumo_controller_1.otroConsumoController));
router.get('/otros-consumos/lote/:id', auth_controller_1.verificarToken, otroConsumo_controller_1.otroConsumoController.porLote.bind(otroConsumo_controller_1.otroConsumoController));
router.get('/otros-consumos/resumen/:id', auth_controller_1.verificarToken, otroConsumo_controller_1.otroConsumoController.resumenPorLote.bind(otroConsumo_controller_1.otroConsumoController));
router.post('/otros-consumos', auth_controller_1.verificarToken, otroConsumo_controller_1.otroConsumoController.registrar.bind(otroConsumo_controller_1.otroConsumoController));
router.put('/otros-consumos/:id', auth_controller_1.verificarToken, otroConsumo_controller_1.otroConsumoController.update.bind(otroConsumo_controller_1.otroConsumoController));
router.delete('/otros-consumos/:id', auth_controller_1.verificarToken, otroConsumo_controller_1.otroConsumoController.delete.bind(otroConsumo_controller_1.otroConsumoController));
// ============== GASTOS ==============
router.get('/gastos', auth_controller_1.verificarToken, gastos_controller_1.gastosController.index.bind(gastos_controller_1.gastosController));
router.get('/gastos/:id', auth_controller_1.verificarToken, gastos_controller_1.gastosController.show.bind(gastos_controller_1.gastosController));
router.post('/gastos', auth_controller_1.verificarToken, gastos_controller_1.gastosController.create.bind(gastos_controller_1.gastosController));
router.put('/gastos/:id', auth_controller_1.verificarToken, gastos_controller_1.gastosController.update.bind(gastos_controller_1.gastosController));
router.delete('/gastos/:id', auth_controller_1.verificarToken, gastos_controller_1.gastosController.delete.bind(gastos_controller_1.gastosController));
// ============== VENTAS ==============
router.get('/ventas', auth_controller_1.verificarToken, ventas_controller_1.ventasController.index.bind(ventas_controller_1.ventasController));
router.get('/ventas/:id', auth_controller_1.verificarToken, ventas_controller_1.ventasController.show.bind(ventas_controller_1.ventasController));
router.post('/ventas', auth_controller_1.verificarToken, ventas_controller_1.ventasController.create.bind(ventas_controller_1.ventasController));
router.put('/ventas/:id', auth_controller_1.verificarToken, ventas_controller_1.ventasController.update.bind(ventas_controller_1.ventasController));
router.delete('/ventas/:id', auth_controller_1.verificarToken, ventas_controller_1.ventasController.delete.bind(ventas_controller_1.ventasController));
// ============== REPORTES ==============
router.get('/reportes/dashboard', auth_controller_1.verificarToken, reportes_controller_1.reportesController.dashboard.bind(reportes_controller_1.reportesController));
router.get('/reportes/por-fecha', auth_controller_1.verificarToken, reportes_controller_1.reportesController.porFecha.bind(reportes_controller_1.reportesController));
router.get('/reportes/rentabilidad/:loteId', auth_controller_1.verificarToken, reportes_controller_1.reportesController.rentabilidad.bind(reportes_controller_1.reportesController));
router.get('/reportes/resumen-completo/:loteId', auth_controller_1.verificarToken, reportes_controller_1.reportesController.resumenCompletoPorLote.bind(reportes_controller_1.reportesController));
router.get('/reportes/consumo-diario', auth_controller_1.verificarToken, reportes_controller_1.reportesController.consumoDiario.bind(reportes_controller_1.reportesController));
router.get('/reportes/costo-acumulado/:loteId', auth_controller_1.verificarToken, reportes_controller_1.reportesController.costoAcumulado.bind(reportes_controller_1.reportesController));
router.get('/reportes/exportar/:loteId', auth_controller_1.verificarToken, reportes_controller_1.reportesController.exportar.bind(reportes_controller_1.reportesController));
// ============== MONEDA ==============
router.post('/moneda/convertir', currency_controller_1.currencyController.convertToHNL.bind(currency_controller_1.currencyController));
router.get('/moneda/tipo-cambio', currency_controller_1.currencyController.exchangeRate.bind(currency_controller_1.currencyController));
// ============== VACUNACIONES ==============
router.get('/vacunaciones', auth_controller_1.verificarToken, vacunacion_controller_1.vacunacionController.index.bind(vacunacion_controller_1.vacunacionController));
router.get('/vacunaciones/lote/:loteId', auth_controller_1.verificarToken, vacunacion_controller_1.vacunacionController.porLote.bind(vacunacion_controller_1.vacunacionController));
router.post('/vacunaciones', auth_controller_1.verificarToken, vacunacion_controller_1.vacunacionController.create.bind(vacunacion_controller_1.vacunacionController));
router.put('/vacunaciones/:id', auth_controller_1.verificarToken, vacunacion_controller_1.vacunacionController.update.bind(vacunacion_controller_1.vacunacionController));
router.delete('/vacunaciones/:id', auth_controller_1.verificarToken, vacunacion_controller_1.vacunacionController.delete.bind(vacunacion_controller_1.vacunacionController));
// ============== MORTALIDADES ==============
router.get('/mortalidades', auth_controller_1.verificarToken, mortalidad_controller_1.mortalidadController.index.bind(mortalidad_controller_1.mortalidadController));
router.get('/mortalidades/lote/:id', auth_controller_1.verificarToken, mortalidad_controller_1.mortalidadController.porLote.bind(mortalidad_controller_1.mortalidadController));
router.post('/mortalidades', auth_controller_1.verificarToken, mortalidad_controller_1.mortalidadController.crear.bind(mortalidad_controller_1.mortalidadController));
router.put('/mortalidades/:id', auth_controller_1.verificarToken, mortalidad_controller_1.mortalidadController.actualizar.bind(mortalidad_controller_1.mortalidadController));
router.delete('/mortalidades/:id', auth_controller_1.verificarToken, mortalidad_controller_1.mortalidadController.eliminar.bind(mortalidad_controller_1.mortalidadController));
// ============== EMPRESA ==============
router.get('/empresa', auth_controller_1.verificarToken, empresa_controller_1.empresaController.get.bind(empresa_controller_1.empresaController));
router.put('/empresa', auth_controller_1.verificarToken, empresa_controller_1.empresaController.update.bind(empresa_controller_1.empresaController));
router.post('/empresa/cancelar-suscripcion', auth_controller_1.verificarToken, empresa_controller_1.empresaController.cancelarSuscripcion.bind(empresa_controller_1.empresaController));
router.post('/empresa/reactivar-suscripcion', auth_controller_1.verificarToken, empresa_controller_1.empresaController.reactivarSuscripcion.bind(empresa_controller_1.empresaController));
// ============== DEBUG ==============
router.get('/debug/lote/:loteId', auth_controller_1.verificarToken, async (req, res) => {
    try {
        const empresaId = req.empresaId;
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post('/debug/seed-test-data/:loteId', auth_controller_1.verificarToken, async (req, res) => {
    try {
        const empresaId = req.empresaId;
        const loteId = new (require('mongoose')).Types.ObjectId(req.params.loteId);
        const Lote = require('../models/Lote').Lote;
        const ConsumoRegistro = require('../models/ConsumoRegistro');
        const VacunacionLote = require('../models/VacunacionLote').default;
        const VentaRegistro = require('../models/VentaRegistro');
        const GastoAdicional = require('../models/GastoAdicional');
        const mongoose = require('mongoose');
        const lote = await Lote.findOne({ _id: loteId, empresaId });
        if (!lote)
            return res.status(404).json({ error: 'Lote no encontrado' });
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post('/debug/fix-vacunaciones', auth_controller_1.verificarToken, async (req, res) => {
    try {
        const empresaId = req.empresaId;
        const VacunacionLote = require('../models/VacunacionLote').default;
        const updated = await VacunacionLote.updateMany({
            empresaId,
            $or: [
                { precioUnitario: { $exists: false } },
                { precioUnitario: null },
                { precioUnitario: 0 },
                { cantidadAplicada: { $exists: false } },
                { cantidadAplicada: null },
            ]
        }, {
            $set: {
                precioUnitario: 150,
                cantidadAplicada: 50,
            }
        });
        res.json({
            message: 'Vacunaciones reparadas exitosamente',
            actualizado: updated.modifiedCount,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// (Las configuraciones de empresa ahora se manejan via /api/empresa)
exports.default = router;
//# sourceMappingURL=api.js.map