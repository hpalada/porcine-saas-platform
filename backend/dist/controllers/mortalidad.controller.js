"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mortalidadController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const MortalidadLote_1 = __importDefault(require("../models/MortalidadLote"));
const Lote_1 = require("../models/Lote");
const getEmpresaId = (req) => req.empresaId;
exports.mortalidadController = {
    async index(req, res) {
        try {
            const empresaId = getEmpresaId(req);
            const { loteId, fechaDesde, fechaHasta } = req.query;
            const query = { empresaId };
            if (loteId)
                query.loteId = new mongoose_1.default.Types.ObjectId(loteId);
            if (fechaDesde || fechaHasta) {
                query.fecha = {};
                if (fechaDesde)
                    query.fecha.$gte = new Date(fechaDesde);
                if (fechaHasta)
                    query.fecha.$lte = new Date(fechaHasta);
            }
            const registros = await MortalidadLote_1.default.find(query)
                .populate('loteId', 'nombre')
                .sort({ fecha: -1 })
                .select('-__v');
            res.json(registros);
        }
        catch (error) {
            res.status(500).json({ error: 'Error al obtener mortalidades' });
        }
    },
    async porLote(req, res) {
        try {
            const empresaId = getEmpresaId(req);
            const registros = await MortalidadLote_1.default.find({
                loteId: new mongoose_1.default.Types.ObjectId(req.params.id),
                empresaId,
            }).sort({ fecha: -1 }).select('-__v');
            res.json(registros);
        }
        catch (error) {
            res.status(500).json({ error: 'Error al obtener mortalidades del lote' });
        }
    },
    async crear(req, res) {
        try {
            const empresaId = getEmpresaId(req);
            if (!empresaId)
                return res.status(401).json({ error: 'No autenticado' });
            const { loteId, cantidadMuertas, fecha, motivo, observaciones } = req.body;
            if (!loteId || !cantidadMuertas || !motivo) {
                return res.status(400).json({ error: 'loteId, cantidadMuertas y motivo son requeridos' });
            }
            const cantidad = Number(cantidadMuertas);
            if (cantidad <= 0) {
                return res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });
            }
            const lote = await Lote_1.Lote.findOne({ _id: loteId, empresaId });
            if (!lote)
                return res.status(404).json({ error: 'Lote no encontrado' });
            if (lote.estado !== 'activo') {
                return res.status(400).json({ error: 'El lote debe estar activo para registrar mortalidades' });
            }
            if ((lote.cantidadActual || 0) < cantidad) {
                return res.status(400).json({ error: `No hay suficientes animales vivos. Actuales: ${lote.cantidadActual}` });
            }
            const mortalidad = await MortalidadLote_1.default.create({
                empresaId,
                loteId,
                cantidadMuertas: cantidad,
                fecha: fecha ? new Date(fecha) : new Date(),
                motivo,
                observaciones,
            });
            const nuevasMuertas = (lote.cantidadMuertas || 0) + cantidad;
            const nuevaActual = Math.max(0, lote.cantidadInicial - (lote.cantidadSalida || 0) - nuevasMuertas);
            await Lote_1.Lote.findByIdAndUpdate(loteId, {
                cantidadMuertas: nuevasMuertas,
                cantidadActual: nuevaActual,
                estado: nuevaActual === 0 ? 'finalizado' : 'activo',
            });
            res.status(201).json(mortalidad);
        }
        catch (error) {
            res.status(400).json({ error: 'Error al registrar mortalidad', message: error instanceof Error ? error.message : undefined });
        }
    },
    async actualizar(req, res) {
        try {
            const empresaId = getEmpresaId(req);
            const { cantidadMuertas, fecha, motivo, observaciones } = req.body;
            const mortalidadAnterior = await MortalidadLote_1.default.findOne({ _id: req.params.id, empresaId });
            if (!mortalidadAnterior)
                return res.status(404).json({ error: 'Registro no encontrado' });
            const updateData = {};
            if (fecha !== undefined)
                updateData.fecha = new Date(fecha);
            if (motivo !== undefined)
                updateData.motivo = motivo;
            if (observaciones !== undefined)
                updateData.observaciones = observaciones;
            if (cantidadMuertas !== undefined) {
                const nuevaCantidad = Number(cantidadMuertas);
                if (nuevaCantidad <= 0)
                    return res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });
                const diferencia = nuevaCantidad - mortalidadAnterior.cantidadMuertas;
                const lote = await Lote_1.Lote.findOne({ _id: mortalidadAnterior.loteId, empresaId });
                if (lote && diferencia > 0 && (lote.cantidadActual || 0) < diferencia) {
                    return res.status(400).json({ error: `No hay suficientes animales vivos. Disponibles: ${lote.cantidadActual}` });
                }
                updateData.cantidadMuertas = nuevaCantidad;
                if (lote) {
                    const nuevasMuertas = Math.max(0, (lote.cantidadMuertas || 0) + diferencia);
                    const nuevaActual = Math.max(0, lote.cantidadInicial - (lote.cantidadSalida || 0) - nuevasMuertas);
                    await Lote_1.Lote.findByIdAndUpdate(mortalidadAnterior.loteId, {
                        cantidadMuertas: nuevasMuertas,
                        cantidadActual: nuevaActual,
                        estado: nuevaActual === 0 ? 'finalizado' : 'activo',
                    });
                }
            }
            const mortalidad = await MortalidadLote_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
            res.json(mortalidad);
        }
        catch (error) {
            res.status(400).json({ error: 'Error al actualizar mortalidad', message: error instanceof Error ? error.message : undefined });
        }
    },
    async eliminar(req, res) {
        try {
            const empresaId = getEmpresaId(req);
            const mortalidad = await MortalidadLote_1.default.findOneAndDelete({ _id: req.params.id, empresaId });
            if (!mortalidad)
                return res.status(404).json({ error: 'Mortalidad no encontrada' });
            const loteParaEliminar = await Lote_1.Lote.findById(mortalidad.loteId);
            if (loteParaEliminar) {
                const nuevasMuertas = Math.max(0, (loteParaEliminar.cantidadMuertas || 0) - mortalidad.cantidadMuertas);
                const nuevaActual = Math.max(0, loteParaEliminar.cantidadInicial - (loteParaEliminar.cantidadSalida || 0) - nuevasMuertas);
                await Lote_1.Lote.findByIdAndUpdate(mortalidad.loteId, {
                    cantidadMuertas: nuevasMuertas,
                    cantidadActual: nuevaActual,
                    estado: nuevaActual === 0 ? 'finalizado' : 'activo',
                });
            }
            res.json({ message: 'Mortalidad eliminada correctamente' });
        }
        catch (error) {
            res.status(500).json({ error: 'Error al eliminar mortalidad', message: error instanceof Error ? error.message : undefined });
        }
    },
};
//# sourceMappingURL=mortalidad.controller.js.map