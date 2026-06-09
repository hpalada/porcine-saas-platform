"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vacunacionController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const VacunacionLote_1 = __importDefault(require("../models/VacunacionLote"));
const Lote_1 = require("../models/Lote");
const getEmpresaId = (req) => req.empresaId;
exports.vacunacionController = {
    async porLote(req, res) {
        try {
            const empresaId = getEmpresaId(req);
            const loteId = new mongoose_1.default.Types.ObjectId(req.params.loteId);
            const registros = await VacunacionLote_1.default.find({ empresaId, loteId })
                .sort({ fecha: -1 })
                .select('-__v');
            res.json(registros);
        }
        catch (error) {
            res.status(500).json({ error: 'Error al obtener vacunaciones' });
        }
    },
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
            const registros = await VacunacionLote_1.default.find(query)
                .populate('loteId', 'nombre')
                .sort({ fecha: -1 })
                .select('-__v');
            res.json(registros);
        }
        catch (error) {
            res.status(500).json({ error: 'Error al obtener vacunaciones' });
        }
    },
    async create(req, res) {
        try {
            const empresaId = getEmpresaId(req);
            if (!empresaId)
                return res.status(401).json({ error: 'No autenticado' });
            const { loteId, vacuna, fecha, dosis, aplicadoPor, observaciones, proximaFecha, precioUnitario, cantidadAplicada } = req.body;
            if (!loteId || !vacuna || precioUnitario === undefined || cantidadAplicada === undefined) {
                return res.status(400).json({ error: 'loteId, vacuna, precioUnitario y cantidadAplicada son requeridos' });
            }
            if (Number(cantidadAplicada) <= 0) {
                return res.status(400).json({ error: 'La cantidad aplicada debe ser mayor a 0' });
            }
            if (Number(precioUnitario) < 0) {
                return res.status(400).json({ error: 'El precio unitario no puede ser negativo' });
            }
            const lote = await Lote_1.Lote.findOne({ _id: loteId, empresaId });
            if (!lote)
                return res.status(404).json({ error: 'Lote no encontrado' });
            if (lote.estado !== 'activo') {
                return res.status(400).json({ error: 'El lote debe estar activo para registrar vacunaciones' });
            }
            const registro = new VacunacionLote_1.default({
                empresaId,
                loteId,
                vacuna,
                fecha: fecha ? new Date(fecha) : new Date(),
                dosis,
                aplicadoPor,
                observaciones,
                proximaFecha: proximaFecha ? new Date(proximaFecha) : undefined,
                precioUnitario: Number(precioUnitario),
                cantidadAplicada: Number(cantidadAplicada),
            });
            await registro.save();
            res.status(201).json(registro);
        }
        catch (error) {
            res.status(400).json({ error: 'Error al registrar vacunación', message: error instanceof Error ? error.message : undefined });
        }
    },
    async update(req, res) {
        try {
            const empresaId = getEmpresaId(req);
            const { vacuna, fecha, dosis, aplicadoPor, observaciones, proximaFecha, precioUnitario, cantidadAplicada } = req.body;
            const updateData = {};
            if (vacuna !== undefined)
                updateData.vacuna = vacuna;
            if (fecha !== undefined)
                updateData.fecha = new Date(fecha);
            if (dosis !== undefined)
                updateData.dosis = dosis;
            if (aplicadoPor !== undefined)
                updateData.aplicadoPor = aplicadoPor;
            if (observaciones !== undefined)
                updateData.observaciones = observaciones;
            if (proximaFecha !== undefined)
                updateData.proximaFecha = proximaFecha ? new Date(proximaFecha) : null;
            if (precioUnitario !== undefined) {
                if (Number(precioUnitario) < 0) {
                    return res.status(400).json({ error: 'El precio unitario no puede ser negativo' });
                }
                updateData.precioUnitario = Number(precioUnitario);
            }
            if (cantidadAplicada !== undefined) {
                if (Number(cantidadAplicada) <= 0) {
                    return res.status(400).json({ error: 'La cantidad aplicada debe ser mayor a 0' });
                }
                updateData.cantidadAplicada = Number(cantidadAplicada);
            }
            const registro = await VacunacionLote_1.default.findOneAndUpdate({ _id: req.params.id, empresaId }, updateData, { new: true, runValidators: true });
            if (!registro)
                return res.status(404).json({ error: 'Registro no encontrado' });
            res.json(registro);
        }
        catch (error) {
            res.status(400).json({ error: 'Error al actualizar vacunación' });
        }
    },
    async delete(req, res) {
        try {
            const empresaId = getEmpresaId(req);
            const registro = await VacunacionLote_1.default.findOneAndDelete({ _id: req.params.id, empresaId });
            if (!registro)
                return res.status(404).json({ error: 'Registro no encontrado' });
            res.json({ message: 'Vacunación eliminada correctamente' });
        }
        catch (error) {
            res.status(500).json({ error: 'Error al eliminar vacunación' });
        }
    },
};
//# sourceMappingURL=vacunacion.controller.js.map