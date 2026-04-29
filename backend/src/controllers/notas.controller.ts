import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { NotaLote } from '../models/NotaLote';
import { Lote } from '../models/Lote';

export const notasController = {
  async porLote(req: Request, res: Response) {
    try {
      const { loteId } = req.params;
      const empresaId = (req as any).empresaId;
      const notas = await NotaLote.find({ loteId: new mongoose.Types.ObjectId(loteId), empresaId })
        .sort({ fecha: -1 })
        .lean();
      res.json(notas);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener notas' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const empresaId = (req as any).empresaId;
      if (!empresaId) return res.status(401).json({ error: 'No autenticado' });
      const { loteId, tipo, descripcion, fecha } = req.body;
      if (!loteId || !tipo || !descripcion) {
        return res.status(400).json({ error: 'loteId, tipo y descripcion son requeridos' });
      }
      // Verify lote ownership
      const lote = await Lote.findOne({ _id: loteId, empresaId });
      if (!lote) return res.status(404).json({ error: 'Lote no encontrado' });
      const nota = new NotaLote({ loteId, empresaId, tipo, descripcion, fecha: fecha ? new Date(fecha) : new Date() });
      await nota.save();
      res.status(201).json(nota);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear nota' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const empresaId = (req as any).empresaId;
      const nota = await NotaLote.findOneAndDelete({ _id: req.params.id, empresaId });
      if (!nota) return res.status(404).json({ error: 'Nota no encontrada' });
      res.json({ message: 'Nota eliminada' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar nota' });
    }
  },
};
