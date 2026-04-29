"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.consumosController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ConsumoRegistro_1 = __importDefault(require("../models/ConsumoRegistro"));
const ConcentradoTipo_1 = __importDefault(require("../models/ConcentradoTipo"));
const InventarioMovimiento_1 = __importDefault(require("../models/InventarioMovimiento"));
const Lote_1 = require("../models/Lote");
const getEmpresaId = (req) => req.empresaId;
async function getStockActual(concentradoTipoId, empresaId) {
    const movimientos = await InventarioMovimiento_1.default.aggregate([
        { $match: { concentradoTipoId, empresaId } },
        {
            $group: {
                _id: null,
                entradas: { $sum: { $cond: [{ $eq: ['$tipo', 'entrada'] }, '$cantidad', 0] } },
                salidas: { $sum: { $cond: [{ $eq: ['$tipo', 'salida'] }, '$cantidad', 0] } },
                ajustes: { $sum: { $cond: [{ $eq: ['$tipo', 'ajuste'] }, '$cantidad', 0] } },
            },
        },
    ]);
    const m = movimientos[0] || { entradas: 0, salidas: 0, ajustes: 0 };
    return m.entradas - m.salidas + m.ajustes;
}
exports.consumosController = {
    async index(req, res) {
        try {
            const empresaId = getEmpresaId(req);
            const { loteId, concentradoTipoId, fechaDesde, fechaHasta, limite = 100 } = req.query;
            const query = { empresaId };
            if (loteId)
                query.loteId = new mongoose_1.default.Types.ObjectId(loteId);
            if (concentradoTipoId)
                query.concentradoTipoId = new mongoose_1.default.Types.ObjectId(concentradoTipoId);
            if (fechaDesde || fechaHasta) {
                query.fecha = {};
                if (fechaDesde)
                    query.fecha.$gte = new Date(fechaDesde);
                if (fechaHasta)
                    query.fecha.$lte = new Date(fechaHasta);
            }
            const consumos = await ConsumoRegistro_1.default.find(query)
                .populate('loteId', 'nombre')
                .populate('concentradoTipoId', 'nombre unidad')
                .sort({ fecha: -1, createdAt: -1 })
                .limit(Number(limite))
                .select('-__v');
            res.json(consumos);
        }
        catch (error) {
            res.status(500).json({ error: 'Error al obtener consumos', message: error instanceof Error ? error.message : undefined });
        }
    },
    async porLote(req, res) {
        try {
            const empresaId = getEmpresaId(req);
            const consumos = await ConsumoRegistro_1.default.find({
                loteId: new mongoose_1.default.Types.ObjectId(req.params.id),
                empresaId,
            })
                .populate('concentradoTipoId', 'nombre unidad')
                .sort({ fecha: -1 })
                .select('-__v');
            res.json(consumos);
        }
        catch (error) {
            res.status(500).json({ error: 'Error al obtener consumos del lote', message: error instanceof Error ? error.message : undefined });
        }
    },
    async resumen(req, res) {
        try {
            const empresaId = getEmpresaId(req);
            if (!empresaId)
                return res.status(400).json({ error: 'empresaId requerido' });
            const empresaOid = new mongoose_1.default.Types.ObjectId(empresaId);
            const loteId = new mongoose_1.default.Types.ObjectId(req.params.id);
            // Verify lote ownership
            const lote = await Lote_1.Lote.findOne({ _id: loteId, empresaId });
            if (!lote)
                return res.status(404).json({ error: 'Lote no encontrado' });
            const resumenPorTipo = await ConsumoRegistro_1.default.aggregate([
                { $match: { loteId, empresaId: empresaOid } },
                {
                    $group: {
                        _id: '$concentradoTipoId',
                        cantidadTotal: { $sum: '$cantidad' },
                        costoTotal: { $sum: '$costoTotal' },
                        registros: { $sum: 1 },
                    },
                },
                { $lookup: { from: 'concentradotipos', localField: '_id', foreignField: '_id', as: 'concentrado' } },
                { $unwind: '$concentrado' },
                {
                    $project: {
                        _id: 0,
                        concentradoId: '$_id',
                        nombre: '$concentrado.nombre',
                        cantidadTotal: 1,
                        costoTotal: 1,
                        registros: 1,
                    },
                },
            ]);
            const totales = await ConsumoRegistro_1.default.aggregate([
                { $match: { loteId, empresaId: empresaOid } },
                {
                    $group: {
                        _id: null,
                        cantidadTotal: { $sum: '$cantidad' },
                        costoTotal: { $sum: '$costoTotal' },
                        registros: { $sum: 1 },
                    },
                },
            ]);
            res.json({
                porTipo: resumenPorTipo,
                totales: totales[0] || { cantidadTotal: 0, costoTotal: 0, registros: 0 },
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Error al calcular resumen', message: error instanceof Error ? error.message : undefined });
        }
    },
    async registrar(req, res) {
        try {
            const empresaId = getEmpresaId(req);
            if (!empresaId)
                return res.status(401).json({ error: 'No autenticado' });
            const empresaOid = new mongoose_1.default.Types.ObjectId(empresaId);
            const { loteId, concentradoTipoId, cantidad, observaciones, fecha } = req.body;
            if (!loteId || !concentradoTipoId || !cantidad) {
                return res.status(400).json({ error: 'loteId, concentradoTipoId y cantidad son requeridos' });
            }
            if (Number(cantidad) <= 0) {
                return res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });
            }
            // Verify lote belongs to this empresa AND is active
            const lote = await Lote_1.Lote.findOne({ _id: loteId, empresaId });
            if (!lote)
                return res.status(404).json({ error: 'Lote no encontrado' });
            if (lote.estado !== 'activo') {
                return res.status(400).json({ error: 'El lote debe estar activo para registrar consumos' });
            }
            // Verify concentrado belongs to this empresa
            const concentrado = await ConcentradoTipo_1.default.findOne({ _id: concentradoTipoId, empresaId });
            if (!concentrado)
                return res.status(404).json({ error: 'Tipo de concentrado no encontrado' });
            // Get current stock for this empresa
            const stockActual = await getStockActual(new mongoose_1.default.Types.ObjectId(concentradoTipoId), empresaOid);
            if (Number(cantidad) > stockActual) {
                return res.status(400).json({
                    error: 'Stock insuficiente',
                    message: `Stock disponible: ${stockActual} ${concentrado.unidad}, solicitado: ${cantidad} ${concentrado.unidad}`,
                    stockDisponible: stockActual,
                    solicitado: Number(cantidad),
                });
            }
            const precioUnitario = concentrado.precioActual;
            const costoTotal = Number(cantidad) * precioUnitario;
            const consumo = new ConsumoRegistro_1.default({
                empresaId: empresaOid,
                loteId,
                concentradoTipoId,
                cantidad: Number(cantidad),
                precioUnitario,
                costoTotal,
                observaciones,
                fecha: fecha ? new Date(fecha) : new Date(),
            });
            await consumo.save();
            const stockNuevo = stockActual - Number(cantidad);
            const movimiento = new InventarioMovimiento_1.default({
                empresaId: empresaOid,
                concentradoTipoId,
                tipo: 'salida',
                cantidad: Number(cantidad),
                stockAnterior: stockActual,
                stockNuevo,
                motivo: `Consumo Lote ${lote.nombre}`,
                referenciaId: consumo._id,
                fecha: consumo.fecha,
            });
            await movimiento.save();
            res.status(201).json({
                message: 'Consumo registrado correctamente',
                consumo: { ...consumo.toObject(), lote: lote.nombre, concentrado: concentrado.nombre },
                inventario: { stockAnterior: stockActual, stockNuevo, descuento: Number(cantidad) },
                calculo: { cantidad: Number(cantidad), precioUnitario, costoTotal },
            });
        }
        catch (error) {
            console.error('Error al registrar consumo:', error);
            res.status(400).json({ error: 'Error al registrar consumo', message: error instanceof Error ? error.message : undefined });
        }
    },
    async delete(req, res) {
        try {
            const empresaId = getEmpresaId(req);
            if (!empresaId)
                return res.status(401).json({ error: 'No autenticado' });
            const empresaOid = new mongoose_1.default.Types.ObjectId(empresaId);
            const consumo = await ConsumoRegistro_1.default.findOne({ _id: req.params.id, empresaId });
            if (!consumo)
                return res.status(404).json({ error: 'Consumo no encontrado' });
            // Reverse inventory
            const stockActual = await getStockActual(consumo.concentradoTipoId, empresaOid);
            const stockNuevo = stockActual + consumo.cantidad;
            await InventarioMovimiento_1.default.create({
                empresaId: empresaOid,
                concentradoTipoId: consumo.concentradoTipoId,
                tipo: 'ajuste',
                cantidad: consumo.cantidad,
                stockAnterior: stockActual,
                stockNuevo,
                motivo: `Reversión de consumo ${consumo._id}`,
                referenciaId: consumo._id,
                fecha: new Date(),
            });
            await ConsumoRegistro_1.default.deleteOne({ _id: req.params.id, empresaId });
            res.json({ message: 'Consumo eliminado, inventario revertido' });
        }
        catch (error) {
            res.status(500).json({ error: 'Error al eliminar consumo', message: error instanceof Error ? error.message : undefined });
        }
    },
};
//# sourceMappingURL=consumos.controller.js.map