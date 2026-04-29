import { Request, Response } from 'express';
import mongoose from 'mongoose';
import VacunacionLote from '../models/VacunacionLote';
import { Lote } from '../models/Lote';

const getEmpresaId = (req: Request) => (req as any).empresaId;

export const vacunacionController = {
  async porLote(req: Request, res: Response) {
    try {
      const empresaId = getEmpresaId(req);
      const loteId = new mongoose.Types.ObjectId(req.params.loteId);
      const registros = await VacunacionLote.find({ empresaId, loteId })
        .sort({ fecha: -1 })
        .select('-__v');
      res.json(registros);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener vacunaciones' });
    }
  },

  async index(req: Request, res: Response) {
    try {
      const empresaId = getEmpresaId(req);
      const { loteId, fechaDesde, fechaHasta } = req.query;
      const query: Record<string, any> = { empresaId };
      if (loteId) query.loteId = new mongoose.Types.ObjectId(loteId as string);
      if (fechaDesde || fechaHasta) {
        query.fecha = {};
        if (fechaDesde) query.fecha.$gte = new Date(fechaDesde as string);
        if (fechaHasta) query.fecha.$lte = new Date(fechaHasta as string);
      }
      const registros = await VacunacionLote.find(query)
        .populate('loteId', 'nombre')
        .sort({ fecha: -1 })
        .select('-__v');
      res.json(registros);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener vacunaciones' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const empresaId = getEmpresaId(req);
      if (!empresaId) return res.status(401).json({ error: 'No autenticado' });
      const { loteId, vacuna, fecha, dosis, aplicadoPor, observaciones, proximaFecha } = req.body;

      if (!loteId || !vacuna || !dosis) {
        return res.status(400).json({ error: 'loteId, vacuna y dosis son requeridos' });
      }

      // Verify lote ownership
      const lote = await Lote.findOne({ _id: loteId, empresaId });
      if (!lote) return res.status(404).json({ error: 'Lote no encontrado' });

      const registro = new VacunacionLote({
        empresaId,
        loteId,
        vacuna,
        fecha: fecha ? new Date(fecha) : new Date(),
        dosis,
        aplicadoPor,
        observaciones,
        proximaFecha: proximaFecha ? new Date(proximaFecha) : undefined,
      });

      await registro.save();
      res.status(201).json(registro);
    } catch (error) {
      res.status(400).json({ error: 'Error al registrar vacunación', message: error instanceof Error ? error.message : undefined });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const empresaId = getEmpresaId(req);
      const { vacuna, fecha, dosis, aplicadoPor, observaciones, proximaFecha } = req.body;
      const updateData: Record<string, any> = {};
      if (vacuna !== undefined) updateData.vacuna = vacuna;
      if (fecha !== undefined) updateData.fecha = new Date(fecha);
      if (dosis !== undefined) updateData.dosis = dosis;
      if (aplicadoPor !== undefined) updateData.aplicadoPor = aplicadoPor;
      if (observaciones !== undefined) updateData.observaciones = observaciones;
      if (proximaFecha !== undefined) updateData.proximaFecha = proximaFecha ? new Date(proximaFecha) : null;

      const registro = await VacunacionLote.findOneAndUpdate(
        { _id: req.params.id, empresaId },
        updateData,
        { new: true, runValidators: true }
      );
      if (!registro) return res.status(404).json({ error: 'Registro no encontrado' });
      res.json(registro);
    } catch (error) {
      res.status(400).json({ error: 'Error al actualizar vacunación' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const empresaId = getEmpresaId(req);
      const registro = await VacunacionLote.findOneAndDelete({ _id: req.params.id, empresaId });
      if (!registro) return res.status(404).json({ error: 'Registro no encontrado' });
      res.json({ message: 'Vacunación eliminada correctamente' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar vacunación' });
    }
  },
};
