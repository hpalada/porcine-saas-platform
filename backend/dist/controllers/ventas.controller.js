"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ventasController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const VentaRegistro_1 = __importDefault(require("../models/VentaRegistro"));
const Lote_1 = require("../models/Lote");
const KG_PER_LB = 0.453592;
const getEmpresaId = (req) => req.empresaId;
exports.ventasController = {
    async index(req, res) {
        try {
            const empresaId = getEmpresaId(req);
            const { loteId, fechaDesde, fechaHasta, limite = 100 } = req.query;
            const query = { empresaId };
            if (loteId)
                query.loteId = new mongoose_1.default.Types.ObjectId(loteId);
            if (fechaDesde || fechaHasta) {
                query.fechaVenta = {};
                if (fechaDesde)
                    query.fechaVenta.$gte = new Date(fechaDesde);
                if (fechaHasta)
                    query.fechaVenta.$lte = new Date(fechaHasta);
            }
            const ventas = await VentaRegistro_1.default.find(query)
                .populate('loteId', 'nombre')
                .sort({ fechaVenta: -1 })
                .limit(Number(limite))
                .select('-__v');
            res.json(ventas);
        }
        catch (error) {
            res.status(500).json({ error: 'Error al obtener ventas', message: error instanceof Error ? error.message : undefined });
        }
    },
    async show(req, res) {
        try {
            const empresaId = getEmpresaId(req);
            const venta = await VentaRegistro_1.default.findOne({ _id: req.params.id, empresaId }).populate('loteId', 'nombre');
            if (!venta)
                return res.status(404).json({ error: 'Venta no encontrada' });
            res.json(venta);
        }
        catch (error) {
            res.status(500).json({ error: 'Error al obtener venta' });
        }
    },
    async create(req, res) {
        try {
            const empresaId = getEmpresaId(req);
            const { loteId, cantidadCerdos, pesoTotal, unidadPeso = 'kg', precioPorKg, precioPorLb, fechaVenta, comprador } = req.body;
            if (!loteId || !cantidadCerdos || !pesoTotal) {
                return res.status(400).json({ error: 'loteId, cantidadCerdos y pesoTotal son requeridos' });
            }
            const lote = await Lote_1.Lote.findOne({ _id: loteId, empresaId });
            if (!lote)
                return res.status(404).json({ error: 'Lote no encontrado' });
            const cantidad = Number(cantidadCerdos);
            if (!Number.isFinite(cantidad) || cantidad < 1) {
                return res.status(400).json({ error: 'cantidadCerdos debe ser mayor a 0' });
            }
            if (cantidad > lote.cantidadActual) {
                return res.status(400).json({ error: `Solo hay ${lote.cantidadActual} animales activos en el lote` });
            }
            // Normalise to kg internally
            const pesoTotalKg = unidadPeso === 'lb' ? pesoTotal * KG_PER_LB : pesoTotal;
            const pesoTotalLb = unidadPeso === 'lb' ? pesoTotal : pesoTotal / KG_PER_LB;
            // Price: if entered as lb, convert to per-kg
            let precioKg = parseFloat(precioPorKg);
            if (unidadPeso === 'lb' && precioPorLb) {
                precioKg = parseFloat(precioPorLb) / KG_PER_LB;
            }
            const ingresoTotal = pesoTotalKg * precioKg;
            const venta = new VentaRegistro_1.default({
                empresaId,
                loteId,
                cantidadCerdos: cantidad,
                pesoTotalKg,
                pesoTotalLb,
                unidadPeso,
                precioPorKg: precioKg,
                ingresoTotal,
                fechaVenta: fechaVenta ? new Date(fechaVenta) : new Date(),
                comprador,
            });
            await venta.save();
            // Restar animales vendidos del lote
            lote.cantidadSalida = (lote.cantidadSalida || 0) + cantidad;
            lote.cantidadActual = Math.max(0, lote.cantidadInicial - lote.cantidadSalida);
            if (lote.cantidadActual === 0)
                lote.estado = 'finalizado';
            await lote.save();
            res.status(201).json(venta);
        }
        catch (error) {
            res.status(400).json({ error: 'Error al registrar venta', message: error instanceof Error ? error.message : undefined });
        }
    },
    async update(req, res) {
        try {
            const empresaId = getEmpresaId(req);
            const { cantidadCerdos, pesoTotal, unidadPeso, precioPorKg, precioPorLb, fechaVenta, comprador } = req.body;
            const existing = await VentaRegistro_1.default.findOne({ _id: req.params.id, empresaId });
            if (!existing)
                return res.status(404).json({ error: 'Venta no encontrada' });
            const updateData = {};
            if (cantidadCerdos !== undefined) {
                const nuevaCantidad = Number(cantidadCerdos);
                if (!Number.isFinite(nuevaCantidad) || nuevaCantidad < 1) {
                    return res.status(400).json({ error: 'cantidadCerdos debe ser mayor a 0' });
                }
                const diff = nuevaCantidad - existing.cantidadCerdos;
                if (diff !== 0) {
                    const lote = await Lote_1.Lote.findOne({ _id: existing.loteId, empresaId });
                    if (lote) {
                        if (diff > 0 && diff > lote.cantidadActual) {
                            return res.status(400).json({ error: `Solo hay ${lote.cantidadActual} animales activos en el lote` });
                        }
                        lote.cantidadSalida = (lote.cantidadSalida || 0) + diff;
                        lote.cantidadActual = Math.max(0, lote.cantidadInicial - lote.cantidadSalida);
                        lote.estado = lote.cantidadActual === 0 ? 'finalizado' : 'activo';
                        await lote.save();
                    }
                }
                updateData.cantidadCerdos = nuevaCantidad;
            }
            if (pesoTotal !== undefined) {
                updateData.pesoTotalKg = unidadPeso === 'lb' ? pesoTotal * KG_PER_LB : pesoTotal;
                updateData.pesoTotalLb = unidadPeso === 'lb' ? pesoTotal : pesoTotal / KG_PER_LB;
                updateData.unidadPeso = unidadPeso || 'kg';
            }
            if (precioPorKg !== undefined)
                updateData.precioPorKg = precioPorKg;
            if (precioPorLb !== undefined)
                updateData.precioPorKg = precioPorLb / KG_PER_LB;
            if (fechaVenta !== undefined)
                updateData.fechaVenta = new Date(fechaVenta);
            if (comprador !== undefined)
                updateData.comprador = comprador;
            if (updateData.pesoTotalKg !== undefined || updateData.precioPorKg !== undefined) {
                const kg = updateData.pesoTotalKg ?? existing.pesoTotalKg;
                const price = updateData.precioPorKg ?? existing.precioPorKg;
                updateData.ingresoTotal = kg * price;
            }
            const venta = await VentaRegistro_1.default.findOneAndUpdate({ _id: req.params.id, empresaId }, updateData, { new: true, runValidators: true });
            if (!venta)
                return res.status(404).json({ error: 'Venta no encontrada' });
            res.json(venta);
        }
        catch (error) {
            res.status(400).json({ error: 'Error al actualizar venta', message: error instanceof Error ? error.message : undefined });
        }
    },
    async delete(req, res) {
        try {
            const empresaId = getEmpresaId(req);
            const venta = await VentaRegistro_1.default.findOneAndDelete({ _id: req.params.id, empresaId });
            if (!venta)
                return res.status(404).json({ error: 'Venta no encontrada' });
            // Devolver animales al lote
            const lote = await Lote_1.Lote.findOne({ _id: venta.loteId, empresaId });
            if (lote) {
                lote.cantidadSalida = Math.max(0, (lote.cantidadSalida || 0) - venta.cantidadCerdos);
                lote.cantidadActual = Math.max(0, lote.cantidadInicial - lote.cantidadSalida);
                if (lote.cantidadActual > 0 && lote.estado === 'finalizado')
                    lote.estado = 'activo';
                await lote.save();
            }
            res.json({ message: 'Venta eliminada correctamente' });
        }
        catch (error) {
            res.status(500).json({ error: 'Error al eliminar venta' });
        }
    },
};
//# sourceMappingURL=ventas.controller.js.map