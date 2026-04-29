"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gastosController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const GastoAdicional_1 = __importDefault(require("../models/GastoAdicional"));
const Lote_1 = require("../models/Lote");
const getEmpresaId = (req) => req.empresaId;
exports.gastosController = {
    async index(req, res) {
        try {
            const empresaId = getEmpresaId(req);
            const { loteId, categoria, fechaDesde, fechaHasta, limite = 100 } = req.query;
            const query = { empresaId };
            if (loteId)
                query.loteId = new mongoose_1.default.Types.ObjectId(loteId);
            if (categoria)
                query.categoria = categoria;
            if (fechaDesde || fechaHasta) {
                query.fecha = {};
                if (fechaDesde)
                    query.fecha.$gte = new Date(fechaDesde);
                if (fechaHasta)
                    query.fecha.$lte = new Date(fechaHasta);
            }
            const gastos = await GastoAdicional_1.default.find(query)
                .populate('loteId', 'nombre')
                .sort({ fecha: -1 })
                .limit(Number(limite))
                .select('-__v');
            res.json(gastos);
        }
        catch (error) {
            res.status(500).json({ error: 'Error al obtener gastos' });
        }
    },
    async show(req, res) {
        try {
            const empresaId = getEmpresaId(req);
            const gasto = await GastoAdicional_1.default.findOne({ _id: req.params.id, empresaId }).populate('loteId', 'nombre');
            if (!gasto)
                return res.status(404).json({ error: 'Gasto no encontrado' });
            res.json(gasto);
        }
        catch (error) {
            res.status(500).json({ error: 'Error al obtener gasto' });
        }
    },
    async create(req, res) {
        try {
            const empresaId = getEmpresaId(req);
            if (!empresaId)
                return res.status(401).json({ error: 'No autenticado' });
            const { loteId, categoria, descripcion, monto, fecha } = req.body;
            if (!categoria || !descripcion || !monto) {
                return res.status(400).json({ error: 'categoria, descripcion y monto son requeridos' });
            }
            if (Number(monto) <= 0) {
                return res.status(400).json({ error: 'El monto debe ser mayor a 0' });
            }
            // If loteId provided, verify ownership
            if (loteId) {
                const lote = await Lote_1.Lote.findOne({ _id: loteId, empresaId });
                if (!lote)
                    return res.status(404).json({ error: 'Lote no encontrado' });
            }
            const gasto = new GastoAdicional_1.default({
                loteId: loteId || undefined,
                empresaId,
                categoria,
                descripcion,
                monto: Number(monto),
                fecha: fecha ? new Date(fecha) : new Date(),
            });
            await gasto.save();
            res.status(201).json(gasto);
        }
        catch (error) {
            res.status(400).json({ error: 'Error al registrar gasto', message: error instanceof Error ? error.message : undefined });
        }
    },
    async update(req, res) {
        try {
            const empresaId = getEmpresaId(req);
            const { loteId, categoria, descripcion, monto, fecha } = req.body;
            const updateData = {};
            if (loteId !== undefined) {
                if (loteId) {
                    const lote = await Lote_1.Lote.findOne({ _id: loteId, empresaId });
                    if (!lote)
                        return res.status(404).json({ error: 'Lote no encontrado' });
                    updateData.loteId = loteId;
                }
                else {
                    updateData.loteId = null;
                }
            }
            if (categoria !== undefined)
                updateData.categoria = categoria;
            if (descripcion !== undefined)
                updateData.descripcion = descripcion;
            if (monto !== undefined) {
                if (Number(monto) <= 0)
                    return res.status(400).json({ error: 'El monto debe ser mayor a 0' });
                updateData.monto = Number(monto);
            }
            if (fecha !== undefined)
                updateData.fecha = new Date(fecha);
            const gasto = await GastoAdicional_1.default.findOneAndUpdate({ _id: req.params.id, empresaId }, updateData, { new: true, runValidators: true });
            if (!gasto)
                return res.status(404).json({ error: 'Gasto no encontrado' });
            res.json(gasto);
        }
        catch (error) {
            res.status(400).json({ error: 'Error al actualizar gasto' });
        }
    },
    async delete(req, res) {
        try {
            const empresaId = getEmpresaId(req);
            const gasto = await GastoAdicional_1.default.findOneAndDelete({ _id: req.params.id, empresaId });
            if (!gasto)
                return res.status(404).json({ error: 'Gasto no encontrado' });
            res.json({ message: 'Gasto eliminado correctamente' });
        }
        catch (error) {
            res.status(500).json({ error: 'Error al eliminar gasto' });
        }
    },
};
//# sourceMappingURL=gastos.controller.js.map