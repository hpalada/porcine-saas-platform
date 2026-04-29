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
// ============== CONSUMOS (CORE) ==============
router.get('/consumos', auth_controller_1.verificarToken, consumos_controller_1.consumosController.index.bind(consumos_controller_1.consumosController));
router.get('/consumos/lote/:id', auth_controller_1.verificarToken, consumos_controller_1.consumosController.porLote.bind(consumos_controller_1.consumosController));
router.get('/consumos/resumen/:id', auth_controller_1.verificarToken, consumos_controller_1.consumosController.resumen.bind(consumos_controller_1.consumosController));
router.post('/consumos', auth_controller_1.verificarToken, consumos_controller_1.consumosController.registrar.bind(consumos_controller_1.consumosController));
router.delete('/consumos/:id', auth_controller_1.verificarToken, consumos_controller_1.consumosController.delete.bind(consumos_controller_1.consumosController));
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
router.get('/reportes/rentabilidad/:loteId', auth_controller_1.verificarToken, reportes_controller_1.reportesController.rentabilidad.bind(reportes_controller_1.reportesController));
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
// ============== EMPRESA ==============
router.get('/empresa', auth_controller_1.verificarToken, empresa_controller_1.empresaController.get.bind(empresa_controller_1.empresaController));
router.put('/empresa', auth_controller_1.verificarToken, empresa_controller_1.empresaController.update.bind(empresa_controller_1.empresaController));
// (Las configuraciones de empresa ahora se manejan via /api/empresa)
exports.default = router;
//# sourceMappingURL=api.js.map