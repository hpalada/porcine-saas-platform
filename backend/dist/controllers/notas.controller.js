"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notasController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const NotaLote_1 = require("../models/NotaLote");
const Lote_1 = require("../models/Lote");
exports.notasController = {
    async porLote(req, res) {
        try {
            const { loteId } = req.params;
            const empresaId = req.empresaId;
            const notas = await NotaLote_1.NotaLote.find({ loteId: new mongoose_1.default.Types.ObjectId(loteId), empresaId })
                .sort({ fecha: -1 })
                .lean();
            res.json(notas);
        }
        catch (error) {
            res.status(500).json({ error: 'Error al obtener notas' });
        }
    },
    async create(req, res) {
        try {
            const empresaId = req.empresaId;
            if (!empresaId)
                return res.status(401).json({ error: 'No autenticado' });
            const { loteId, tipo, descripcion, fecha } = req.body;
            if (!loteId || !tipo || !descripcion) {
                return res.status(400).json({ error: 'loteId, tipo y descripcion son requeridos' });
            }
            // Verify lote ownership
            const lote = await Lote_1.Lote.findOne({ _id: loteId, empresaId });
            if (!lote)
                return res.status(404).json({ error: 'Lote no encontrado' });
            const nota = new NotaLote_1.NotaLote({ loteId, empresaId, tipo, descripcion, fecha: fecha ? new Date(fecha) : new Date() });
            await nota.save();
            res.status(201).json(nota);
        }
        catch (error) {
            res.status(500).json({ error: 'Error al crear nota' });
        }
    },
    async delete(req, res) {
        try {
            const empresaId = req.empresaId;
            const nota = await NotaLote_1.NotaLote.findOneAndDelete({ _id: req.params.id, empresaId });
            if (!nota)
                return res.status(404).json({ error: 'Nota no encontrada' });
            res.json({ message: 'Nota eliminada' });
        }
        catch (error) {
            res.status(500).json({ error: 'Error al eliminar nota' });
        }
    },
};
//# sourceMappingURL=notas.controller.js.map