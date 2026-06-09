"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportesController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const exceljs_1 = __importDefault(require("exceljs"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const ConsumoRegistro_1 = __importDefault(require("../models/ConsumoRegistro"));
const GastoAdicional_1 = __importDefault(require("../models/GastoAdicional"));
const VentaRegistro_1 = __importDefault(require("../models/VentaRegistro"));
const OtroConsumo_1 = __importDefault(require("../models/OtroConsumo"));
const VacunacionLote_1 = __importDefault(require("../models/VacunacionLote"));
const MortalidadLote_1 = __importDefault(require("../models/MortalidadLote"));
const Lote_1 = require("../models/Lote");
const Empresa_1 = require("../models/Empresa");
const CATEGORIAS_LABEL = {
    lechon: 'Precio Lechón', trabajador: 'Trabajadores', medicina: 'Medicina',
    transporte: 'Transporte', mano_obra: 'Mano de Obra', servicios: 'Servicios', otro: 'Otro',
};
const fmtMoney = (n) => `L ${(n || 0).toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-HN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';
const sanitizeFile = (s) => s.replace(/[^\w\d-]+/g, '_').slice(0, 60);
const getEmpresaId = (req) => req.empresaId || req.query.empresaId;
exports.reportesController = {
    async rentabilidad(req, res) {
        try {
            const empresaId = getEmpresaId(req);
            if (!empresaId)
                return res.status(400).json({ error: 'empresaId requerido' });
            const empresaOid = new mongoose_1.default.Types.ObjectId(empresaId);
            const loteId = new mongoose_1.default.Types.ObjectId(req.params.loteId);
            const lote = await Lote_1.Lote.findOne({ _id: loteId, empresaId });
            if (!lote)
                return res.status(404).json({ error: 'Lote no encontrado' });
            const [consumos, gastosPorCategoria, gastosTotales, ventas, vacunaciones, otrosConsumosData, mortalidades] = await Promise.all([
                ConsumoRegistro_1.default.aggregate([
                    { $match: { loteId, empresaId: empresaOid } },
                    { $group: { _id: null, totalCostos: { $sum: '$costoTotal' }, cantidadTotal: { $sum: '$cantidad' } } },
                ]),
                GastoAdicional_1.default.aggregate([
                    { $match: { loteId, empresaId: empresaOid } },
                    { $group: { _id: '$categoria', total: { $sum: '$monto' } } },
                ]),
                GastoAdicional_1.default.aggregate([
                    { $match: { loteId, empresaId: empresaOid } },
                    { $group: { _id: null, total: { $sum: '$monto' } } },
                ]),
                VentaRegistro_1.default.aggregate([
                    { $match: { loteId, empresaId: empresaOid } },
                    { $group: { _id: null, totalIngresos: { $sum: '$ingresoTotal' }, totalCerdos: { $sum: '$cantidadCerdos' }, totalPeso: { $sum: '$pesoTotalKg' } } },
                ]),
                VacunacionLote_1.default.aggregate([
                    { $match: { loteId, empresaId: empresaOid } },
                    { $group: { _id: null, totalCosto: { $sum: { $multiply: ['$precioUnitario', '$cantidadAplicada'] } }, registros: { $sum: 1 } } },
                ]),
                OtroConsumo_1.default.aggregate([
                    { $match: { loteId, empresaId: empresaOid } },
                    { $group: { _id: null, totalCosto: { $sum: '$costoTotal' }, cantidad: { $sum: '$cantidad' } } },
                ]),
                MortalidadLote_1.default.aggregate([
                    { $match: { loteId, empresaId: empresaOid } },
                    { $group: { _id: null, totalMuertas: { $sum: '$cantidadMuertas' }, registros: { $sum: 1 } } },
                ]),
            ]);
            const costosConcentrado = consumos[0]?.totalCostos || 0;
            const cantidadConcentrado = consumos[0]?.cantidadTotal || 0;
            const otrosGastos = gastosTotales[0]?.total || 0;
            const costosVacunas = vacunaciones[0]?.totalCosto || 0;
            const costosOtrosConsumosTotal = otrosConsumosData[0]?.totalCosto || 0;
            const totalMuertas = mortalidades[0]?.totalMuertas || 0;
            const ingresos = ventas[0]?.totalIngresos || 0;
            const cerdosVendidos = ventas[0]?.totalCerdos || 0;
            const pesoVendido = ventas[0]?.totalPeso || 0;
            const costosTotales = costosConcentrado + otrosGastos + costosVacunas + costosOtrosConsumosTotal;
            const utilidad = ingresos - costosTotales;
            const margen = ingresos > 0 ? (utilidad / ingresos) * 100 : 0;
            const costoPorCerdo = lote.cantidadInicial > 0 ? costosTotales / lote.cantidadInicial : 0;
            const costoPorKg = pesoVendido > 0 ? costosTotales / pesoVendido : 0;
            res.json({
                lote: {
                    _id: lote._id,
                    nombre: lote.nombre,
                    cantidadInicial: lote.cantidadInicial,
                    cantidadActual: lote.cantidadActual,
                    cantidadSalida: lote.cantidadSalida,
                    fechaIngreso: lote.fechaIngreso,
                    estado: lote.estado,
                },
                ingresos: {
                    total: ingresos,
                    cerdosVendidos,
                    pesoTotal: pesoVendido,
                    precioPromedio: pesoVendido > 0 ? ingresos / pesoVendido : 0,
                },
                costos: {
                    concentrado: { total: costosConcentrado, cantidad: cantidadConcentrado },
                    vacunas: { total: costosVacunas },
                    otrosConsumosTotal: { total: costosOtrosConsumosTotal },
                    otrosGastos: {
                        total: otrosGastos,
                        porCategoria: Object.fromEntries(gastosPorCategoria.map((g) => [g._id, g.total])),
                    },
                    totales: costosTotales,
                },
                mortalidad: {
                    totalMuertas,
                    cerdosIniciales: lote.cantidadInicial,
                    cerdosSobrevivientes: lote.cantidadInicial - totalMuertas,
                    tasaMortalidad: lote.cantidadInicial > 0 ? ((totalMuertas / lote.cantidadInicial) * 100).toFixed(2) : '0',
                },
                resultado: {
                    utilidad,
                    margen: Math.round(margen * 100) / 100,
                    estado: utilidad > 0 ? 'rentable' : utilidad < 0 ? 'perdida' : 'equilibrio',
                },
                indicadores: {
                    costoPorCerdo: Math.round(costoPorCerdo * 100) / 100,
                    costoPorKg: Math.round(costoPorKg * 100) / 100,
                    cerdosActuales: lote.cantidadActual,
                },
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Error al calcular rentabilidad', message: error instanceof Error ? error.message : undefined });
        }
    },
    async dashboard(req, res) {
        try {
            const empresaId = getEmpresaId(req);
            if (!empresaId)
                return res.status(400).json({ error: 'empresaId requerido' });
            const empresaOid = new mongoose_1.default.Types.ObjectId(empresaId);
            const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
            const [lotesActivos, totalAnimales, costosDelMes, costosConcentradoDelMes, costosVacunasDelMes, costosOtrosConsumosDelMes, ingresosDelMes, totalMortalidadesDelMes, registrosVacunacionDelMes] = await Promise.all([
                Lote_1.Lote.countDocuments({ empresaId, estado: 'activo' }),
                Lote_1.Lote.aggregate([
                    { $match: { empresaId: empresaOid, estado: 'activo' } },
                    { $group: { _id: null, total: { $sum: '$cantidadActual' } } },
                ]),
                GastoAdicional_1.default.aggregate([
                    { $match: { empresaId: empresaOid, fecha: { $gte: startOfMonth } } },
                    { $group: { _id: null, total: { $sum: '$monto' } } },
                ]),
                ConsumoRegistro_1.default.aggregate([
                    { $match: { empresaId: empresaOid, fecha: { $gte: startOfMonth } } },
                    { $group: { _id: null, total: { $sum: '$costoTotal' } } },
                ]),
                VacunacionLote_1.default.aggregate([
                    { $match: { empresaId: empresaOid, fecha: { $gte: startOfMonth } } },
                    { $group: { _id: null, total: { $sum: { $multiply: ['$precioUnitario', '$cantidadAplicada'] } } } },
                ]),
                OtroConsumo_1.default.aggregate([
                    { $match: { empresaId: empresaOid, fecha: { $gte: startOfMonth } } },
                    { $group: { _id: null, total: { $sum: '$costoTotal' } } },
                ]),
                VentaRegistro_1.default.aggregate([
                    { $match: { empresaId: empresaOid, fechaVenta: { $gte: startOfMonth } } },
                    { $group: { _id: null, total: { $sum: '$ingresoTotal' } } },
                ]),
                MortalidadLote_1.default.aggregate([
                    { $match: { empresaId: empresaOid, fecha: { $gte: startOfMonth } } },
                    { $group: { _id: null, total: { $sum: '$cantidadMuertas' } } },
                ]),
                VacunacionLote_1.default.countDocuments({ empresaId, fecha: { $gte: startOfMonth } }),
            ]);
            const totalCostos = (costosDelMes[0]?.total || 0) + (costosConcentradoDelMes[0]?.total || 0) + (costosVacunasDelMes[0]?.total || 0) + (costosOtrosConsumosDelMes[0]?.total || 0);
            res.json({
                lotesActivos,
                totalAnimalesActivos: totalAnimales[0]?.total || 0,
                costosDelMes: Math.round(totalCostos * 100) / 100,
                desgloseCostos: {
                    gastosAdicionales: Math.round((costosDelMes[0]?.total || 0) * 100) / 100,
                    concentrados: Math.round((costosConcentradoDelMes[0]?.total || 0) * 100) / 100,
                    vacunas: Math.round((costosVacunasDelMes[0]?.total || 0) * 100) / 100,
                    otrosConsumosTotal: Math.round((costosOtrosConsumosDelMes[0]?.total || 0) * 100) / 100,
                },
                ingresosDelMes: Math.round((ingresosDelMes[0]?.total || 0) * 100) / 100,
                utilidadDelMes: Math.round(((ingresosDelMes[0]?.total || 0) - totalCostos) * 100) / 100,
                mortalidadDelMes: {
                    totalMuertas: totalMortalidadesDelMes[0]?.total || 0,
                },
                vacunacionesDelMes: registrosVacunacionDelMes,
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Error al obtener dashboard' });
        }
    },
    async consumoDiario(req, res) {
        try {
            const empresaId = getEmpresaId(req);
            if (!empresaId)
                return res.status(400).json({ error: 'empresaId requerido' });
            const empresaOid = new mongoose_1.default.Types.ObjectId(empresaId);
            const { fechaDesde, fechaHasta, concentradoTipoId } = req.query;
            const matchQuery = { empresaId: empresaOid };
            if (fechaDesde || fechaHasta) {
                matchQuery.fecha = {};
                if (fechaDesde)
                    matchQuery.fecha.$gte = new Date(fechaDesde);
                if (fechaHasta)
                    matchQuery.fecha.$lte = new Date(fechaHasta);
            }
            if (concentradoTipoId)
                matchQuery.concentradoTipoId = new mongoose_1.default.Types.ObjectId(concentradoTipoId);
            // Get consumo diario from alimento (ConsumoRegistro)
            const alimentoPorDia = await ConsumoRegistro_1.default.aggregate([
                { $match: matchQuery },
                { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$fecha' } }, cantidadAlimento: { $sum: '$cantidad' }, costoAlimento: { $sum: '$costoTotal' }, registrosAlimento: { $sum: 1 } } },
                { $sort: { _id: 1 } },
            ]);
            // Get consumo diario from otros consumos (OtroConsumo)
            const otrosMatchQuery = { empresaId: empresaOid };
            if (fechaDesde || fechaHasta) {
                otrosMatchQuery.fecha = {};
                if (fechaDesde)
                    otrosMatchQuery.fecha.$gte = new Date(fechaDesde);
                if (fechaHasta)
                    otrosMatchQuery.fecha.$lte = new Date(fechaHasta);
            }
            // Note: OtroConsumo does not have concentradoTipoId, so we ignore that filter for now.
            const otrosPorDia = await OtroConsumo_1.default.aggregate([
                { $match: otrosMatchQuery },
                { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$fecha' } }, cantidadOtros: { $sum: '$cantidad' }, registrosOtros: { $sum: 1 } } },
                { $sort: { _id: 1 } },
            ]);
            // Combine by date
            const consumoPorDiaMap = new Map();
            alimentoPorDia.forEach((item) => {
                consumoPorDiaMap.set(item._id, {
                    fecha: item._id,
                    cantidadAlimento: item.cantidadAlimento,
                    costoAlimento: item.costoAlimento,
                    cantidadOtros: 0,
                    registrosAlimento: item.registrosAlimento,
                    registrosOtros: 0,
                });
            });
            otrosPorDia.forEach((item) => {
                const existing = consumoPorDiaMap.get(item._id);
                if (existing) {
                    existing.cantidadOtros = item.cantidadOtros;
                    existing.registrosOtros = item.registrosOtros;
                }
                else {
                    consumoPorDiaMap.set(item._id, {
                        fecha: item._id,
                        cantidadAlimento: 0,
                        costoAlimento: 0,
                        cantidadOtros: item.cantidadOtros,
                        registrosAlimento: 0,
                        registrosOtros: item.registrosOtros,
                    });
                }
            });
            // Convert map to array and compute totals
            const consumoPorDia = Array.from(consumoPorDiaMap.values()).map((item) => ({
                fecha: item.fecha,
                cantidadTotal: item.cantidadAlimento + item.cantidadOtros,
                costoTotal: item.costoAlimento, // assuming otros consumos have no cost
                registros: item.registrosAlimento + item.registrosOtros,
            })).sort((a, b) => a.fecha.localeCompare(b.fecha));
            res.json(consumoPorDia);
        }
        catch (error) {
            res.status(500).json({ error: 'Error al obtener consumo diario' });
        }
    },
    async exportar(req, res) {
        try {
            const empresaId = getEmpresaId(req);
            if (!empresaId)
                return res.status(400).json({ error: 'empresaId requerido' });
            const loteId = new mongoose_1.default.Types.ObjectId(req.params.loteId);
            const formato = req.query.formato || 'excel';
            const lote = await Lote_1.Lote.findOne({ _id: loteId, empresaId });
            if (!lote)
                return res.status(404).json({ error: 'Lote no encontrado' });
            const empresa = await Empresa_1.Empresa.findById(empresaId);
            const empresaOid = new mongoose_1.default.Types.ObjectId(empresaId);
            const [consumos, gastos, ventas, gastosPorCat, vacunaciones, otrosConsumos, mortalidades] = await Promise.all([
                ConsumoRegistro_1.default.find({ loteId, empresaId }).populate('concentradoTipoId', 'nombre').sort({ fecha: 1 }),
                GastoAdicional_1.default.find({ loteId, empresaId }).sort({ fecha: 1 }),
                VentaRegistro_1.default.find({ loteId, empresaId }).sort({ fechaVenta: 1 }),
                GastoAdicional_1.default.aggregate([
                    { $match: { loteId, empresaId: empresaOid } },
                    { $group: { _id: '$categoria', total: { $sum: '$monto' } } },
                ]),
                VacunacionLote_1.default.find({ loteId, empresaId }).sort({ fecha: 1 }),
                OtroConsumo_1.default.find({ loteId, empresaId }).sort({ fecha: 1 }),
                MortalidadLote_1.default.find({ loteId, empresaId }).sort({ fecha: 1 }),
            ]);
            const totalConsumo = consumos.reduce((s, c) => s + (c.costoTotal || 0), 0);
            const totalGastos = gastos.reduce((s, g) => s + (g.monto || 0), 0);
            const totalVacunas = vacunaciones.reduce((s, v) => s + ((v.precioUnitario || 0) * (v.cantidadAplicada || 0)), 0);
            const totalOtrosConsumos = otrosConsumos.reduce((s, o) => s + (o.costoTotal || 0), 0);
            const totalMuertas = mortalidades.reduce((s, m) => s + (m.cantidadMuertas || 0), 0);
            const totalIngresos = ventas.reduce((s, v) => s + (v.ingresoTotal || 0), 0);
            const totalCerdosVendidos = ventas.reduce((s, v) => s + (v.cantidadCerdos || 0), 0);
            const totalPesoVendido = ventas.reduce((s, v) => s + (v.pesoTotalKg || 0), 0);
            const totalCostos = totalConsumo + totalGastos + totalVacunas + totalOtrosConsumos;
            const utilidad = totalIngresos - totalCostos;
            const margen = totalIngresos > 0 ? (utilidad / totalIngresos) * 100 : 0;
            const estado = utilidad > 0 ? 'RENTABLE' : utilidad < 0 ? 'PÉRDIDA' : 'EQUILIBRIO';
            const baseFile = sanitizeFile(`${empresa?.nombre || 'reporte'}_${lote.nombre}`);
            if (formato === 'excel' || formato === 'xlsx') {
                const wb = new exceljs_1.default.Workbook();
                wb.creator = 'Porcine SaaS';
                wb.created = new Date();
                // ============ HOJA 1: RESUMEN ============
                const ws = wb.addWorksheet('Resumen', {
                    properties: { tabColor: { argb: 'FF16A34A' } },
                    views: [{ showGridLines: false }],
                });
                ws.columns = [
                    { width: 28 }, { width: 22 }, { width: 22 }, { width: 22 },
                ];
                // Header banner
                ws.mergeCells('A1:D1');
                const hCell = ws.getCell('A1');
                hCell.value = (empresa?.nombre || 'Porcine SaaS').toUpperCase();
                hCell.font = { name: 'Calibri', size: 22, bold: true, color: { argb: 'FFFFFFFF' } };
                hCell.alignment = { vertical: 'middle', horizontal: 'center' };
                hCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF15803D' } };
                ws.getRow(1).height = 38;
                ws.mergeCells('A2:D2');
                const sCell = ws.getCell('A2');
                sCell.value = `Reporte de rentabilidad — ${lote.nombre}`;
                sCell.font = { name: 'Calibri', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
                sCell.alignment = { vertical: 'middle', horizontal: 'center' };
                sCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF22C55E' } };
                ws.getRow(2).height = 24;
                ws.mergeCells('A3:D3');
                const dCell = ws.getCell('A3');
                dCell.value = `Generado el ${fmtDate(new Date())}`;
                dCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF6B7280' } };
                dCell.alignment = { horizontal: 'center' };
                ws.getRow(3).height = 18;
                // Sección: Información del lote
                const sectionHeader = (row, text) => {
                    ws.mergeCells(`A${row}:D${row}`);
                    const c = ws.getCell(`A${row}`);
                    c.value = text;
                    c.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
                    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF374151' } };
                    c.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
                    ws.getRow(row).height = 22;
                };
                const kvRow = (row, k1, v1, k2, v2) => {
                    const cellA = ws.getCell(`A${row}`);
                    cellA.value = k1;
                    cellA.font = { bold: true, color: { argb: 'FF4B5563' }, size: 10 };
                    cellA.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
                    cellA.border = { bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } } };
                    const cellB = ws.getCell(`B${row}`);
                    cellB.value = v1;
                    cellB.font = { color: { argb: 'FF111827' }, size: 11 };
                    cellB.border = { bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } } };
                    if (k2 !== undefined) {
                        const cellC = ws.getCell(`C${row}`);
                        cellC.value = k2;
                        cellC.font = { bold: true, color: { argb: 'FF4B5563' }, size: 10 };
                        cellC.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
                        cellC.border = { bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } } };
                        const cellD = ws.getCell(`D${row}`);
                        cellD.value = v2;
                        cellD.font = { color: { argb: 'FF111827' }, size: 11 };
                        cellD.border = { bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } } };
                    }
                };
                sectionHeader(5, 'INFORMACIÓN DEL LOTE');
                kvRow(6, 'Nombre', lote.nombre, 'Estado', (lote.estado || '').toUpperCase());
                kvRow(7, 'Fecha de ingreso', fmtDate(lote.fechaIngreso), 'Cantidad inicial', lote.cantidadInicial);
                kvRow(8, 'Cantidad vendida', lote.cantidadSalida || 0, 'Cantidad activa', lote.cantidadActual ?? 0);
                sectionHeader(10, 'INDICADORES FINANCIEROS');
                kvRow(11, 'Ingresos totales', fmtMoney(totalIngresos), 'Costos totales', fmtMoney(totalCostos));
                kvRow(12, 'Costo concentrado', fmtMoney(totalConsumo), 'Otros gastos adicionales', fmtMoney(totalGastos));
                kvRow(13, 'Vacunas', fmtMoney(totalVacunas), 'Otros consumos', fmtMoney(totalOtrosConsumos));
                kvRow(14, 'Cerdos vendidos', totalCerdosVendidos, 'Peso total vendido', `${totalPesoVendido.toFixed(2)} kg`);
                kvRow(15, 'Mortalidades', totalMuertas, 'Tasa mortalidad', lote.cantidadInicial > 0 ? `${((totalMuertas / lote.cantidadInicial) * 100).toFixed(2)}%` : '0%');
                // Resultado destacado
                ws.mergeCells('A17:B17');
                const utilLabel = ws.getCell('A17');
                utilLabel.value = 'UTILIDAD';
                utilLabel.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
                utilLabel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2937' } };
                utilLabel.alignment = { vertical: 'middle', horizontal: 'center' };
                ws.mergeCells('C17:D17');
                const utilVal = ws.getCell('C17');
                utilVal.value = fmtMoney(utilidad);
                const utilColor = utilidad > 0 ? 'FF15803D' : utilidad < 0 ? 'FFB91C1C' : 'FF6B7280';
                utilVal.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
                utilVal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: utilColor } };
                utilVal.alignment = { vertical: 'middle', horizontal: 'center' };
                ws.getRow(17).height = 32;
                kvRow(18, 'Margen de utilidad', `${margen.toFixed(2)} %`, 'Resultado', estado);
                // Desglose por categoría de gastos
                if (gastosPorCat.length > 0) {
                    sectionHeader(20, 'DESGLOSE DE GASTOS POR CATEGORÍA');
                    gastosPorCat.forEach((g, i) => {
                        const row = 21 + i;
                        const a = ws.getCell(`A${row}`);
                        a.value = CATEGORIAS_LABEL[g._id] || g._id;
                        a.font = { bold: true, color: { argb: 'FF4B5563' } };
                        a.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
                        a.border = { bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } } };
                        ws.mergeCells(`B${row}:D${row}`);
                        const b = ws.getCell(`B${row}`);
                        b.value = fmtMoney(g.total);
                        b.font = { color: { argb: 'FFB91C1C' }, bold: true };
                        b.alignment = { horizontal: 'right' };
                        b.border = { bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } } };
                    });
                }
                // ============ HOJA 2: VENTAS ============
                const wsVentas = wb.addWorksheet('Ventas', { views: [{ showGridLines: false }] });
                addTableSheet(wsVentas, 'VENTAS', [
                    { header: 'Fecha', key: 'fecha', width: 14 },
                    { header: 'Cerdos', key: 'cerdos', width: 10 },
                    { header: 'Peso (kg)', key: 'peso', width: 12 },
                    { header: 'Precio/kg', key: 'precio', width: 14 },
                    { header: 'Ingreso total', key: 'ingreso', width: 18 },
                    { header: 'Comprador', key: 'comprador', width: 24 },
                ], ventas.map((v) => ({
                    fecha: fmtDate(v.fechaVenta),
                    cerdos: v.cantidadCerdos,
                    peso: Number((v.pesoTotalKg || 0).toFixed(2)),
                    precio: fmtMoney(v.precioPorKg),
                    ingreso: fmtMoney(v.ingresoTotal),
                    comprador: v.comprador || '—',
                })), {
                    totalRow: { fecha: 'TOTAL', cerdos: totalCerdosVendidos, peso: Number(totalPesoVendido.toFixed(2)), precio: '', ingreso: fmtMoney(totalIngresos), comprador: '' },
                });
                // ============ HOJA 3: CONSUMOS ============
                const wsCon = wb.addWorksheet('Consumos', { views: [{ showGridLines: false }] });
                addTableSheet(wsCon, 'CONSUMOS DE CONCENTRADO', [
                    { header: 'Fecha', key: 'fecha', width: 14 },
                    { header: 'Concentrado', key: 'tipo', width: 24 },
                    { header: 'Cantidad', key: 'cantidad', width: 12 },
                    { header: 'Precio unitario', key: 'precio', width: 16 },
                    { header: 'Costo total', key: 'costo', width: 16 },
                ], consumos.map((c) => ({
                    fecha: fmtDate(c.fecha),
                    tipo: c.concentradoTipoId?.nombre || '—',
                    cantidad: c.cantidad,
                    precio: fmtMoney(c.precioUnitario),
                    costo: fmtMoney(c.costoTotal),
                })), {
                    totalRow: { fecha: 'TOTAL', tipo: '', cantidad: '', precio: '', costo: fmtMoney(totalConsumo) },
                });
                // ============ HOJA 4: GASTOS ============
                const wsG = wb.addWorksheet('Gastos', { views: [{ showGridLines: false }] });
                addTableSheet(wsG, 'GASTOS ADICIONALES', [
                    { header: 'Fecha', key: 'fecha', width: 14 },
                    { header: 'Categoría', key: 'cat', width: 18 },
                    { header: 'Descripción', key: 'desc', width: 32 },
                    { header: 'Monto', key: 'monto', width: 16 },
                ], gastos.map((g) => ({
                    fecha: fmtDate(g.fecha),
                    cat: CATEGORIAS_LABEL[g.categoria] || g.categoria,
                    desc: g.descripcion || '—',
                    monto: fmtMoney(g.monto),
                })), {
                    totalRow: { fecha: 'TOTAL', cat: '', desc: '', monto: fmtMoney(totalGastos) },
                });
                // ============ HOJA 5: VACUNACIONES ============
                const wsVac = wb.addWorksheet('Vacunaciones', { views: [{ showGridLines: false }] });
                addTableSheet(wsVac, 'VACUNACIONES', [
                    { header: 'Fecha', key: 'fecha', width: 14 },
                    { header: 'Vacuna', key: 'vacuna', width: 28 },
                    { header: 'Cant. aplicada', key: 'cantidad', width: 14 },
                    { header: 'Precio unitario', key: 'precio', width: 16 },
                    { header: 'Costo total', key: 'costo', width: 16 },
                ], vacunaciones.map((v) => ({
                    fecha: fmtDate(v.fecha),
                    vacuna: v.vacuna || '—',
                    cantidad: v.cantidadAplicada,
                    precio: fmtMoney(v.precioUnitario),
                    costo: fmtMoney((v.precioUnitario || 0) * (v.cantidadAplicada || 0)),
                })), {
                    totalRow: { fecha: 'TOTAL', vacuna: '', cantidad: '', precio: '', costo: fmtMoney(totalVacunas) },
                });
                // ============ HOJA 6: OTROS CONSUMOS ============
                const wsOtros = wb.addWorksheet('Otros Consumos', { views: [{ showGridLines: false }] });
                addTableSheet(wsOtros, 'OTROS CONSUMOS', [
                    { header: 'Fecha', key: 'fecha', width: 14 },
                    { header: 'Tipo', key: 'tipo', width: 24 },
                    { header: 'Cantidad', key: 'cantidad', width: 12 },
                    { header: 'Precio unitario', key: 'precio', width: 16 },
                    { header: 'Costo total', key: 'costo', width: 16 },
                ], otrosConsumos.map((o) => ({
                    fecha: fmtDate(o.fecha),
                    tipo: o.tipo || '—',
                    cantidad: o.cantidad,
                    precio: fmtMoney(o.precioUnitario),
                    costo: fmtMoney(o.costoTotal),
                })), {
                    totalRow: { fecha: 'TOTAL', tipo: '', cantidad: '', precio: '', costo: fmtMoney(totalOtrosConsumos) },
                });
                // ============ HOJA 7: MORTALIDADES ============
                const wsMort = wb.addWorksheet('Mortalidades', { views: [{ showGridLines: false }] });
                addTableSheet(wsMort, 'MORTALIDADES', [
                    { header: 'Fecha', key: 'fecha', width: 14 },
                    { header: 'Cantidad', key: 'cantidad', width: 12 },
                    { header: 'Motivo', key: 'motivo', width: 40 },
                ], mortalidades.map((m) => ({
                    fecha: fmtDate(m.fecha),
                    cantidad: m.cantidadMuertas,
                    motivo: m.motivo || '—',
                })), {
                    totalRow: { fecha: 'TOTAL', cantidad: totalMuertas, motivo: '' },
                });
                const buf = await wb.xlsx.writeBuffer();
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', `attachment; filename=${baseFile}.xlsx`);
                return res.send(Buffer.from(buf));
            }
            if (formato === 'pdf') {
                const pdfBuffer = await new Promise((resolve, reject) => {
                    const chunks = [];
                    const doc = new pdfkit_1.default({ size: 'LETTER', margin: 48, info: {
                            Title: `Reporte ${lote.nombre}`,
                            Author: empresa?.nombre || 'Porcine SaaS',
                            Subject: 'Reporte de rentabilidad',
                        } });
                    doc.on('data', (chunk) => chunks.push(chunk));
                    doc.on('end', () => resolve(Buffer.concat(chunks)));
                    doc.on('error', reject);
                    const PAGE_W = doc.page.width;
                    const PAGE_H = doc.page.height;
                    const M = 48;
                    const COL_W = PAGE_W - M * 2;
                    const CONTENT_H = PAGE_H - M * 2; // espacio útil por página
                    // Colores
                    const GREEN = '#16a34a';
                    const GREEN_DARK = '#15803d';
                    const RED = '#b91c1c';
                    const GREY_DARK = '#374151';
                    const GREY = '#6b7280';
                    const GREY_LIGHT = '#f3f4f6';
                    const TEXT = '#111827';
                    // Trackear posición Y manualmente
                    let currentY = M;
                    const addPageIfNeeded = (needed) => {
                        if (currentY + needed > PAGE_H - M - 10) { // -10 para margen inferior
                            doc.addPage();
                            currentY = M;
                            return true;
                        }
                        return false;
                    };
                    // ===== HEADER (página 1) =====
                    doc.rect(0, 0, PAGE_W, 85).fill(GREEN_DARK);
                    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(16)
                        .text((empresa?.nombre || 'Porcine SaaS').toUpperCase(), M, 18, { width: COL_W, align: 'center' });
                    doc.font('Helvetica').fontSize(10).fillColor('#ffffff')
                        .text('Reporte de Rentabilidad', M, 44, { width: COL_W, align: 'center' });
                    doc.fontSize(8).fillColor('#d1fae5')
                        .text(`Generado: ${fmtDate(new Date())}`, M, 64, { width: COL_W, align: 'center' });
                    currentY = 105;
                    // ===== TÍTULO LOTE =====
                    doc.fillColor(TEXT).font('Helvetica-Bold').fontSize(14)
                        .text(lote.nombre, M, currentY, { width: COL_W });
                    currentY += 16;
                    doc.fillColor(GREY).font('Helvetica').fontSize(9)
                        .text(`Estado: ${(lote.estado || '').toUpperCase()} | Ingresó: ${fmtDate(lote.fechaIngreso)}`, M, currentY, { width: COL_W });
                    currentY += 18;
                    // ===== KPI cards =====
                    const KPI_H = 60;
                    const kpiGap = 8;
                    const kpiW = (COL_W - kpiGap * 2) / 3;
                    const kpiY = currentY;
                    // Card 1: Ingresos
                    doc.rect(M, kpiY, kpiW, KPI_H).fillAndStroke('#ffffff', '#e5e7eb');
                    doc.fillColor(GREY).font('Helvetica-Bold').fontSize(7)
                        .text('INGRESOS', M + 8, kpiY + 8, { width: kpiW - 16 });
                    doc.fillColor(GREEN).font('Helvetica-Bold').fontSize(12)
                        .text(fmtMoney(totalIngresos), M + 8, kpiY + 22, { width: kpiW - 16 });
                    // Card 2: Costos
                    doc.rect(M + kpiW + kpiGap, kpiY, kpiW, KPI_H).fillAndStroke('#ffffff', '#e5e7eb');
                    doc.fillColor(GREY).font('Helvetica-Bold').fontSize(7)
                        .text('COSTOS', M + kpiW + kpiGap + 8, kpiY + 8, { width: kpiW - 16 });
                    doc.fillColor(RED).font('Helvetica-Bold').fontSize(12)
                        .text(fmtMoney(totalCostos), M + kpiW + kpiGap + 8, kpiY + 22, { width: kpiW - 16 });
                    // Card 3: Utilidad
                    doc.rect(M + (kpiW + kpiGap) * 2, kpiY, kpiW, KPI_H).fillAndStroke('#ffffff', '#e5e7eb');
                    doc.fillColor(GREY).font('Helvetica-Bold').fontSize(7)
                        .text('UTILIDAD', M + (kpiW + kpiGap) * 2 + 8, kpiY + 8, { width: kpiW - 16 });
                    doc.fillColor(utilidad >= 0 ? GREEN : RED).font('Helvetica-Bold').fontSize(12)
                        .text(fmtMoney(utilidad), M + (kpiW + kpiGap) * 2 + 8, kpiY + 22, { width: kpiW - 16 });
                    currentY = kpiY + KPI_H + 16;
                    // ===== INFO LOTE =====
                    addPageIfNeeded(50);
                    const infoY = currentY;
                    doc.rect(M, infoY, COL_W, 22).fill(GREY_DARK);
                    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10)
                        .text('INFORMACIÓN DEL LOTE', M + 10, infoY + 6, { width: COL_W - 20 });
                    currentY = infoY + 28;
                    // Fila 1
                    const kvRowY = currentY;
                    const colW = COL_W / 2;
                    doc.rect(M, kvRowY, COL_W, 36).fill(GREY_LIGHT);
                    doc.fillColor(GREY).font('Helvetica-Bold').fontSize(7)
                        .text('CANTIDAD INICIAL', M + 8, kvRowY + 6, { width: colW - 16 })
                        .text('CANTIDAD ACTUAL', M + colW + 8, kvRowY + 6, { width: colW - 16 });
                    doc.fillColor(TEXT).font('Helvetica').fontSize(9)
                        .text(String(lote.cantidadInicial), M + 8, kvRowY + 16, { width: colW - 16 })
                        .text(String(lote.cantidadActual ?? 0), M + colW + 8, kvRowY + 16, { width: colW - 16 });
                    currentY = kvRowY + 42;
                    // Fila 2
                    const kvRowY2 = currentY;
                    doc.rect(M, kvRowY2, COL_W, 36).fill(GREY_LIGHT);
                    doc.fillColor(GREY).font('Helvetica-Bold').fontSize(7)
                        .text('CANTIDAD VENDIDA', M + 8, kvRowY2 + 6, { width: colW - 16 })
                        .text('ESTADO', M + colW + 8, kvRowY2 + 6, { width: colW - 16 });
                    doc.fillColor(TEXT).font('Helvetica').fontSize(9)
                        .text(String(lote.cantidadSalida || 0), M + 8, kvRowY2 + 16, { width: colW - 16 })
                        .text((lote.estado || '').toUpperCase(), M + colW + 8, kvRowY2 + 16, { width: colW - 16 });
                    currentY = kvRowY2 + 48;
                    // ===== INDICADORES =====
                    addPageIfNeeded(90);
                    const indY = currentY;
                    doc.rect(M, indY, COL_W, 22).fill(GREY_DARK);
                    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10)
                        .text('INDICADORES FINANCIEROS', M + 10, indY + 6, { width: COL_W - 20 });
                    currentY = indY + 28;
                    // 5 filas de indicadores
                    const indicators = [
                        ['INGRESOS TOTALES', fmtMoney(totalIngresos), 'COSTOS TOTALES', fmtMoney(totalCostos)],
                        ['COSTO CONCENTRADO', fmtMoney(totalConsumo), 'GASTOS ADICIONALES', fmtMoney(totalGastos)],
                        ['VACUNAS', fmtMoney(totalVacunas), 'OTROS CONSUMOS', fmtMoney(totalOtrosConsumos)],
                        ['CERDOS VENDIDOS', String(totalCerdosVendidos), 'PESO TOTAL', `${totalPesoVendido.toFixed(2)} kg`],
                        ['MORTALIDADES', String(totalMuertas), 'TASA MORTALIDAD', lote.cantidadInicial > 0 ? `${((totalMuertas / lote.cantidadInicial) * 100).toFixed(2)}%` : '0%'],
                    ];
                    indicators.forEach(([k1, v1, k2, v2]) => {
                        const rowY = currentY;
                        doc.rect(M, rowY, COL_W, 36).fill(GREY_LIGHT);
                        doc.fillColor(GREY).font('Helvetica-Bold').fontSize(7)
                            .text(k1, M + 8, rowY + 6, { width: colW - 16 })
                            .text(k2, M + colW + 8, rowY + 6, { width: colW - 16 });
                        doc.fillColor(TEXT).font('Helvetica').fontSize(9)
                            .text(v1, M + 8, rowY + 16, { width: colW - 16 })
                            .text(v2, M + colW + 8, rowY + 16, { width: colW - 16 });
                        currentY = rowY + 42;
                    });
                    // Margen y resultado
                    const margY = currentY;
                    doc.rect(M, margY, COL_W, 36).fill(GREY_LIGHT);
                    doc.fillColor(GREY).font('Helvetica-Bold').fontSize(7)
                        .text('MARGEN', M + 8, margY + 6, { width: colW - 16 })
                        .text('RESULTADO', M + colW + 8, margY + 6, { width: colW - 16 });
                    doc.fillColor(TEXT).font('Helvetica').fontSize(9)
                        .text(`${margen.toFixed(2)}%`, M + 8, margY + 16, { width: colW - 16 })
                        .text(estado, M + colW + 8, margY + 16, { width: colW - 16 });
                    currentY = margY + 50;
                    // ===== TABLA helper =====
                    const drawTable = (title, headers, rows, widths, totals) => {
                        if (rows.length === 0)
                            return;
                        const ROW_H = 16;
                        const HEADER_H = 18;
                        const tableTotalH = HEADER_H + rows.length * ROW_H + (totals ? 18 : 0) + 30;
                        addPageIfNeeded(tableTotalH);
                        // Header de sección
                        const secY = currentY;
                        doc.rect(M, secY, COL_W, 20).fill(GREY_DARK);
                        doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10)
                            .text(title.toUpperCase(), M + 10, secY + 5, { width: COL_W - 20 });
                        currentY = secY + 26;
                        // Header de columnas
                        const headY = currentY;
                        doc.rect(M, headY, COL_W, HEADER_H).fill('#1f2937');
                        let cx = M;
                        doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(7);
                        headers.forEach((h, i) => {
                            doc.text(h.toUpperCase(), cx + 5, headY + 5, {
                                width: widths[i] - 10,
                                align: i === headers.length - 1 ? 'right' : 'left'
                            });
                            cx += widths[i];
                        });
                        currentY = headY + HEADER_H;
                        // Filas de datos
                        rows.forEach((row, idx) => {
                            let rowY = currentY;
                            // Check si necesita nueva página para esta fila
                            if (rowY + ROW_H > PAGE_H - M) {
                                doc.addPage();
                                currentY = M + 26;
                                doc.rect(M, currentY - 26, COL_W, HEADER_H).fill('#1f2937');
                                cx = M;
                                doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(7);
                                headers.forEach((h, j) => {
                                    doc.text(h.toUpperCase(), cx + 5, currentY - 21, {
                                        width: widths[j] - 10,
                                        align: j === headers.length - 1 ? 'right' : 'left'
                                    });
                                    cx += widths[j];
                                });
                                doc.fillColor(TEXT).font('Helvetica').fontSize(7);
                                rowY = currentY;
                            }
                            const bg = idx % 2 === 0 ? '#ffffff' : '#f9fafb';
                            doc.rect(M, rowY, COL_W, ROW_H).fill(bg);
                            doc.strokeColor('#e5e7eb').lineWidth(0.25).rect(M, rowY, COL_W, ROW_H).stroke();
                            cx = M;
                            doc.fillColor(TEXT).font('Helvetica').fontSize(7);
                            row.forEach((cell, i) => {
                                doc.text(String(cell), cx + 5, rowY + 4, {
                                    width: widths[i] - 10,
                                    align: i === row.length - 1 ? 'right' : 'left'
                                });
                                cx += widths[i];
                            });
                            currentY = rowY + ROW_H;
                        });
                        // Fila de totales
                        if (totals) {
                            const totY = currentY;
                            doc.rect(M, totY, COL_W, 18).fill('#374151');
                            cx = M;
                            doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8);
                            totals.forEach((cell, i) => {
                                doc.text(String(cell), cx + 5, totY + 5, {
                                    width: widths[i] - 10,
                                    align: i === totals.length - 1 ? 'right' : 'left'
                                });
                                cx += widths[i];
                            });
                            currentY = totY + 22;
                        }
                        currentY += 6;
                    };
                    // Calcular anchos de columnas dinámicamente
                    const ventasWidths = [80, 50, 70, 90];
                    ventasWidths.push(COL_W - ventasWidths.reduce((a, b) => a + b, 0));
                    const consumosWidths = [80, 100, 60, 80];
                    consumosWidths.push(COL_W - consumosWidths.reduce((a, b) => a + b, 0));
                    const gastosWidths = [80, 90, COL_W - 280, 110];
                    // ===== VENTAS =====
                    if (ventas.length > 0) {
                        drawTable('VENTAS', ['Fecha', 'Cerdos', 'Peso (kg)', '$/kg', 'Ingreso'], ventas.map((v) => [
                            fmtDate(v.fechaVenta),
                            String(v.cantidadCerdos),
                            (v.pesoTotalKg || 0).toFixed(0),
                            fmtMoney(v.precioPorKg).replace('$', ''),
                            fmtMoney(v.ingresoTotal),
                        ]), ventasWidths, ['TOTAL', String(totalCerdosVendidos), totalPesoVendido.toFixed(0), '', fmtMoney(totalIngresos)]);
                    }
                    // ===== CONSUMOS =====
                    if (consumos.length > 0) {
                        drawTable('CONSUMOS', ['Fecha', 'Tipo', 'Cant', '$/unid', 'Costo'], consumos.map((c) => [
                            fmtDate(c.fecha),
                            (c.concentradoTipoId?.nombre || '—').substring(0, 14),
                            String(c.cantidad),
                            fmtMoney(c.precioUnitario).replace('$', ''),
                            fmtMoney(c.costoTotal),
                        ]), consumosWidths, ['TOTAL', '', '', '', fmtMoney(totalConsumo)]);
                    }
                    // ===== GASTOS =====
                    if (gastos.length > 0) {
                        drawTable('GASTOS', ['Fecha', 'Categ', 'Desc', 'Monto'], gastos.map((g) => [
                            fmtDate(g.fecha),
                            (CATEGORIAS_LABEL[g.categoria] || g.categoria).substring(0, 12),
                            (g.descripcion || '—').substring(0, 20),
                            fmtMoney(g.monto),
                        ]), gastosWidths, ['TOTAL', '', '', fmtMoney(totalGastos)]);
                    }
                    // ===== VACUNACIONES =====
                    if (vacunaciones.length > 0) {
                        const vacWidths = [80, COL_W - 80 - 60 - 80 - 80, 60, 80, 80];
                        drawTable('VACUNACIONES', ['Fecha', 'Vacuna', 'Cant', '$/unid', 'Costo'], vacunaciones.map((v) => [
                            fmtDate(v.fecha),
                            (v.vacuna || '—').substring(0, 20),
                            String(v.cantidadAplicada),
                            fmtMoney(v.precioUnitario).replace('$', ''),
                            fmtMoney((v.precioUnitario || 0) * (v.cantidadAplicada || 0)),
                        ]), vacWidths, ['TOTAL', '', '', '', fmtMoney(totalVacunas)]);
                    }
                    // ===== OTROS CONSUMOS =====
                    if (otrosConsumos.length > 0) {
                        const otrosWidths = [80, COL_W - 80 - 60 - 80 - 80, 60, 80, 80];
                        drawTable('OTROS CONSUMOS', ['Fecha', 'Tipo', 'Cant', '$/unid', 'Costo'], otrosConsumos.map((o) => [
                            fmtDate(o.fecha),
                            (o.tipo || '—').substring(0, 20),
                            String(o.cantidad),
                            fmtMoney(o.precioUnitario).replace('$', ''),
                            fmtMoney(o.costoTotal),
                        ]), otrosWidths, ['TOTAL', '', '', '', fmtMoney(totalOtrosConsumos)]);
                    }
                    // ===== MORTALIDADES =====
                    if (mortalidades.length > 0) {
                        const mortWidths = [80, 60, COL_W - 140];
                        drawTable('MORTALIDADES', ['Fecha', 'Cantidad', 'Motivo'], mortalidades.map((m) => [
                            fmtDate(m.fecha),
                            String(m.cantidadMuertas),
                            (m.motivo || '—').substring(0, 40),
                        ]), mortWidths, ['TOTAL', String(totalMuertas), '']);
                    }
                    // ===== FOOTER =====
                    const range = doc.bufferedPageRange();
                    for (let i = 0; i < range.count; i++) {
                        doc.switchToPage(range.start + i);
                        doc.fontSize(7).fillColor(GREY).font('Helvetica')
                            .text(`${empresa?.nombre || 'Porcine SaaS'}`, M, PAGE_H - 22, { width: COL_W / 2 })
                            .text(`Página ${i + 1}`, M + COL_W / 2, PAGE_H - 22, { width: COL_W / 2, align: 'right' });
                    }
                    doc.end();
                });
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename=${baseFile}.pdf`);
                res.setHeader('Content-Length', pdfBuffer.length);
                return res.send(pdfBuffer);
            }
            return res.status(400).json({ error: 'Formato no soportado. Use excel o pdf.' });
        }
        catch (error) {
            console.error('Error al exportar:', error);
            res.status(500).json({ error: 'Error al exportar datos', message: error instanceof Error ? error.message : undefined });
        }
    },
    async costoAcumulado(req, res) {
        try {
            const empresaId = getEmpresaId(req);
            if (!empresaId)
                return res.status(400).json({ error: 'empresaId requerido' });
            const empresaOid = new mongoose_1.default.Types.ObjectId(empresaId);
            const loteId = new mongoose_1.default.Types.ObjectId(req.params.loteId);
            const lote = await Lote_1.Lote.findOne({ _id: loteId, empresaId });
            if (!lote)
                return res.status(404).json({ error: 'Lote no encontrado' });
            // Get diario cost and quantity from alimento (ConsumoRegistro)
            const alimentoDiario = await ConsumoRegistro_1.default.aggregate([
                { $match: { loteId, empresaId: empresaOid } },
                { $sort: { fecha: 1 } },
                { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$fecha' } }, diario: { $sum: '$costoTotal' }, cantidadAlimento: { $sum: '$cantidad' } } },
                { $sort: { _id: 1 } },
            ]);
            // Get diario quantity from otros consumos (OtroConsumo)
            const otrosDiario = await OtroConsumo_1.default.aggregate([
                { $match: { loteId, empresaId: empresaOid } },
                { $sort: { fecha: 1 } },
                { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$fecha' } }, cantidadOtros: { $sum: '$cantidad' } } },
                { $sort: { _id: 1 } },
            ]);
            // Combine by date
            const costoAcumuladoMap = new Map();
            alimentoDiario.forEach((item) => {
                costoAcumuladoMap.set(item._id, {
                    fecha: item._id,
                    diario: item.diario, // cost from alimento
                    cantidadAlimento: item.cantidadAlimento,
                    cantidadOtros: 0,
                });
            });
            otrosDiario.forEach((item) => {
                const existing = costoAcumuladoMap.get(item._id);
                if (existing) {
                    existing.cantidadOtros = item.cantidadOtros;
                }
                else {
                    costoAcumuladoMap.set(item._id, {
                        fecha: item._id,
                        diario: 0, // no cost from otros
                        cantidadAlimento: 0,
                        cantidadOtros: item.cantidadOtros,
                    });
                }
            });
            // Convert map to array and compute accumulated cost and total quantity
            let acumulado = 0;
            const resultado = Array.from(costoAcumuladoMap.values())
                .sort((a, b) => a.fecha.localeCompare(b.fecha))
                .map((item) => {
                acumulado += item.diario;
                return {
                    fecha: item._id,
                    diario: item.diario, // daily cost
                    cantidad: item.cantidadAlimento + item.cantidadOtros, // total daily quantity
                    acumulado: Math.round(acumulado * 100) / 100, // accumulated cost
                };
            });
            res.json(resultado);
        }
        catch (error) {
            res.status(500).json({ error: 'Error al calcular costo acumulado' });
        }
    },
    async porFecha(req, res) {
        try {
            const empresaId = getEmpresaId(req);
            if (!empresaId)
                return res.status(400).json({ error: 'empresaId requerido' });
            const empresaOid = new mongoose_1.default.Types.ObjectId(empresaId);
            const { fechaDesde, fechaHasta } = req.query;
            const dateFilter = {};
            if (fechaDesde)
                dateFilter.$gte = new Date(fechaDesde);
            if (fechaHasta) {
                const hasta = new Date(fechaHasta);
                hasta.setHours(23, 59, 59, 999);
                dateFilter.$lte = hasta;
            }
            const [ventasRaw, mortalidadesRaw, consumosRaw, gastosRaw] = await Promise.all([
                VentaRegistro_1.default.aggregate([
                    { $match: { empresaId: empresaOid, ...(Object.keys(dateFilter).length ? { fechaVenta: dateFilter } : {}) } },
                    { $group: { _id: '$loteId', total: { $sum: '$ingresoTotal' }, registros: { $sum: 1 }, cerdosVendidos: { $sum: '$cantidadCerdos' } } },
                ]),
                MortalidadLote_1.default.aggregate([
                    { $match: { empresaId: empresaOid, ...(Object.keys(dateFilter).length ? { fecha: dateFilter } : {}) } },
                    { $group: { _id: '$loteId', total: { $sum: '$cantidadMuertas' }, registros: { $sum: 1 } } },
                ]),
                ConsumoRegistro_1.default.aggregate([
                    { $match: { empresaId: empresaOid, ...(Object.keys(dateFilter).length ? { fecha: dateFilter } : {}) } },
                    { $group: { _id: '$loteId', total: { $sum: '$costoTotal' }, registros: { $sum: 1 } } },
                ]),
                GastoAdicional_1.default.aggregate([
                    { $match: { empresaId: empresaOid, ...(Object.keys(dateFilter).length ? { fecha: dateFilter } : {}) } },
                    { $group: { _id: '$loteId', total: { $sum: '$monto' }, registros: { $sum: 1 } } },
                ]),
            ]);
            const loteIds = [...new Set([
                    ...ventasRaw.map((v) => v._id?.toString()),
                    ...mortalidadesRaw.map((m) => m._id?.toString()),
                    ...consumosRaw.map((c) => c._id?.toString()),
                    ...gastosRaw.map((g) => g._id?.toString()),
                ].filter(Boolean))];
            const lotes = await Lote_1.Lote.find({ _id: { $in: loteIds }, empresaId }).lean();
            const toMap = (arr) => new Map(arr.map((r) => [r._id?.toString(), r]));
            const vMap = toMap(ventasRaw);
            const mMap = toMap(mortalidadesRaw);
            const cMap = toMap(consumosRaw);
            const gMap = toMap(gastosRaw);
            const lotesData = lotes.map((lote) => {
                const id = lote._id.toString();
                const ventas = vMap.get(id) || { total: 0, registros: 0, cerdosVendidos: 0 };
                const mort = mMap.get(id) || { total: 0, registros: 0 };
                const cons = cMap.get(id) || { total: 0, registros: 0 };
                const gast = gMap.get(id) || { total: 0, registros: 0 };
                const costosTotales = Math.round((cons.total + gast.total) * 100) / 100;
                const utilidad = Math.round((ventas.total - costosTotales) * 100) / 100;
                return {
                    lote: {
                        _id: lote._id,
                        nombre: lote.nombre,
                        estado: lote.estado,
                        fechaIngreso: lote.fechaIngreso,
                        cantidadInicial: lote.cantidadInicial,
                        cantidadActual: lote.cantidadActual,
                    },
                    ventas: { total: Math.round(ventas.total * 100) / 100, registros: ventas.registros, cerdosVendidos: ventas.cerdosVendidos },
                    mortalidades: { total: mort.total, registros: mort.registros },
                    consumos: { total: Math.round(cons.total * 100) / 100, registros: cons.registros },
                    gastos: { total: Math.round(gast.total * 100) / 100, registros: gast.registros },
                    costosTotales,
                    utilidad,
                };
            }).sort((a, b) => a.lote.nombre.localeCompare(b.lote.nombre));
            const totales = lotesData.reduce((acc, l) => ({
                ingresos: Math.round((acc.ingresos + l.ventas.total) * 100) / 100,
                costos: Math.round((acc.costos + l.costosTotales) * 100) / 100,
                utilidad: Math.round((acc.utilidad + l.utilidad) * 100) / 100,
                mortalidades: acc.mortalidades + l.mortalidades.total,
            }), { ingresos: 0, costos: 0, utilidad: 0, mortalidades: 0 });
            res.json({
                periodo: {
                    desde: fechaDesde || null,
                    hasta: fechaHasta || null,
                },
                totales,
                lotes: lotesData,
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Error al obtener reporte por fecha', message: error instanceof Error ? error.message : undefined });
        }
    },
    async resumenCompletoPorLote(req, res) {
        try {
            const empresaId = getEmpresaId(req);
            if (!empresaId)
                return res.status(400).json({ error: 'empresaId requerido' });
            const empresaOid = new mongoose_1.default.Types.ObjectId(empresaId);
            const loteId = new mongoose_1.default.Types.ObjectId(req.params.loteId);
            const lote = await Lote_1.Lote.findOne({ _id: loteId, empresaId });
            if (!lote)
                return res.status(404).json({ error: 'Lote no encontrado' });
            const [consumos, vacunaciones, otrosConsumosRecords, mortalidades, gastos, ventas] = await Promise.all([
                ConsumoRegistro_1.default.find({ loteId, empresaId })
                    .populate('concentradoTipoId', 'nombre')
                    .sort({ fecha: 1 })
                    .lean(),
                VacunacionLote_1.default.find({ loteId, empresaId }).sort({ fecha: 1 }).lean(),
                OtroConsumo_1.default.find({ loteId, empresaId }).sort({ fecha: 1 }).lean(),
                MortalidadLote_1.default.find({ loteId, empresaId }).sort({ fecha: 1 }).lean(),
                GastoAdicional_1.default.find({ loteId, empresaId }).sort({ fecha: 1 }).lean(),
                VentaRegistro_1.default.find({ loteId, empresaId }).sort({ fechaVenta: 1 }).lean(),
            ]);
            // Convierte cualquier valor de MongoDB (Decimal128, string, null) a número seguro
            const n = (v) => {
                if (v === null || v === undefined)
                    return 0;
                if (typeof v === 'object' && typeof v.toString === 'function')
                    return parseFloat(v.toString()) || 0;
                const num = Number(v);
                return isNaN(num) ? 0 : num;
            };
            // Calcular totales
            const totalConsumosAlimento = consumos.reduce((sum, c) => sum + n(c.costoTotal), 0);
            const totalVacunas = vacunaciones.reduce((sum, v) => sum + (n(v.precioUnitario) * n(v.cantidadAplicada)), 0);
            const totalOtrosConsumos = otrosConsumosRecords.reduce((sum, o) => sum + n(o.costoTotal), 0);
            const totalMortalidades = mortalidades.reduce((sum, m) => sum + n(m.cantidadMuertas), 0);
            const totalGastos = gastos.reduce((sum, g) => sum + n(g.monto), 0);
            const totalIngresos = ventas.reduce((sum, v) => sum + n(v.ingresoTotal), 0);
            const costosTotales = Math.round((totalConsumosAlimento + totalVacunas + totalOtrosConsumos + totalGastos) * 100) / 100;
            const utilidad = Math.round((totalIngresos - costosTotales) * 100) / 100;
            const margen = totalIngresos > 0 ? ((utilidad / totalIngresos) * 100).toFixed(2) : '0.00';
            res.json({
                lote: {
                    _id: lote._id,
                    nombre: lote.nombre,
                    fechaIngreso: lote.fechaIngreso,
                    estado: lote.estado,
                    cantidadInicial: lote.cantidadInicial,
                    cantidadActual: lote.cantidadActual,
                    cantidadSalida: lote.cantidadSalida,
                },
                costos: {
                    consumosAlimento: {
                        total: Math.round(totalConsumosAlimento * 100) / 100,
                        registros: consumos.length,
                        items: consumos.map((c) => ({
                            fecha: fmtDate(c.fecha),
                            tipo: c.concentradoTipoId?.nombre,
                            cantidad: c.cantidad,
                            precioUnitario: c.precioUnitario,
                            costoTotal: c.costoTotal,
                        })),
                    },
                    vacunas: {
                        total: Math.round(totalVacunas * 100) / 100,
                        registros: vacunaciones.length,
                        items: vacunaciones.map((v) => ({
                            fecha: fmtDate(v.fecha),
                            vacuna: v.vacuna,
                            cantidadAplicada: v.cantidadAplicada,
                            precioUnitario: v.precioUnitario,
                            costoTotal: v.precioUnitario * v.cantidadAplicada,
                        })),
                    },
                    otrosConsumosDetalle: {
                        total: Math.round(totalOtrosConsumos * 100) / 100,
                        registros: otrosConsumosRecords.length,
                        items: otrosConsumosRecords.map((o) => ({
                            fecha: fmtDate(o.fecha),
                            tipo: o.tipo,
                            cantidad: o.cantidad,
                            precioUnitario: o.precioUnitario,
                            costoTotal: o.costoTotal,
                        })),
                    },
                    gastosAdicionales: {
                        total: Math.round(totalGastos * 100) / 100,
                        registros: gastos.length,
                    },
                    totalCostos: Math.round(costosTotales * 100) / 100,
                },
                mortalidad: {
                    totalMuertas: totalMortalidades,
                    tasaMortalidad: lote.cantidadInicial > 0 ? ((totalMortalidades / lote.cantidadInicial) * 100).toFixed(2) : '0',
                    registros: mortalidades.length,
                    items: mortalidades.map((m) => ({
                        fecha: fmtDate(m.fecha),
                        cantidad: m.cantidadMuertas,
                        motivo: m.motivo,
                    })),
                },
                ingresos: {
                    total: Math.round(totalIngresos * 100) / 100,
                    registros: ventas.length,
                },
                resultado: {
                    utilidad: Math.round(utilidad * 100) / 100,
                    margen: margen,
                    estado: utilidad > 0 ? 'rentable' : utilidad < 0 ? 'perdida' : 'equilibrio',
                },
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Error al calcular resumen completo', message: error instanceof Error ? error.message : undefined });
        }
    },
};
// Helper para hojas de Excel con tabla con encabezado verde y totales
function addTableSheet(ws, title, cols, rows, opts = {}) {
    // Title banner
    const lastCol = String.fromCharCode(64 + cols.length);
    ws.mergeCells(`A1:${lastCol}1`);
    const t = ws.getCell('A1');
    t.value = title;
    t.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
    t.alignment = { vertical: 'middle', horizontal: 'center' };
    t.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF15803D' } };
    ws.getRow(1).height = 32;
    cols.forEach((c, i) => { ws.getColumn(i + 1).width = c.width; });
    // Header row
    const headerRow = ws.getRow(3);
    cols.forEach((c, i) => {
        const cell = headerRow.getCell(i + 1);
        cell.value = c.header;
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2937' } };
        cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        cell.border = { bottom: { style: 'medium', color: { argb: 'FF15803D' } } };
    });
    headerRow.height = 24;
    // Data rows
    rows.forEach((r, idx) => {
        const row = ws.getRow(4 + idx);
        cols.forEach((c, i) => {
            const cell = row.getCell(i + 1);
            cell.value = r[c.key];
            cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
            cell.font = { size: 10, color: { argb: 'FF111827' } };
            if (idx % 2 === 1) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
            }
            cell.border = { bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } } };
        });
        row.height = 20;
    });
    // Total row
    if (opts.totalRow) {
        const totalRowNum = 4 + rows.length;
        const tr = ws.getRow(totalRowNum);
        cols.forEach((c, i) => {
            const cell = tr.getCell(i + 1);
            cell.value = opts.totalRow[c.key];
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF374151' } };
            cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        });
        tr.height = 26;
    }
    // Empty state
    if (rows.length === 0) {
        ws.mergeCells(`A4:${lastCol}4`);
        const e = ws.getCell('A4');
        e.value = 'Sin registros';
        e.font = { italic: true, color: { argb: 'FF9CA3AF' } };
        e.alignment = { horizontal: 'center', vertical: 'middle' };
        ws.getRow(4).height = 30;
    }
    ws.views = [{ state: 'frozen', ySplit: 3, showGridLines: false }];
}
//# sourceMappingURL=reportes.controller.js.map