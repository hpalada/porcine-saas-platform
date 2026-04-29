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

// ============== CONSUMOS (CORE) ==============
router.get('/consumos', verificarToken, consumosController.index.bind(consumosController));
router.get('/consumos/lote/:id', verificarToken, consumosController.porLote.bind(consumosController));
router.get('/consumos/resumen/:id', verificarToken, consumosController.resumen.bind(consumosController));
router.post('/consumos', verificarToken, consumosController.registrar.bind(consumosController));
router.delete('/consumos/:id', verificarToken, consumosController.delete.bind(consumosController));

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

// ============== EMPRESA ==============
router.get('/empresa', verificarToken, empresaController.get.bind(empresaController));
router.put('/empresa', verificarToken, empresaController.update.bind(empresaController));

// (Las configuraciones de empresa ahora se manejan via /api/empresa)

export default router;
