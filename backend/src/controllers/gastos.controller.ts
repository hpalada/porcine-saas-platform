import { Request, Response } from 'express';
import mongoose from 'mongoose';
import GastoAdicional from '../models/GastoAdicional';
import { Lote } from '../models/Lote';

const getEmpresaId = (req: Request) => (req as any).empresaId;

export const gastosController = {
  async index(req: Request, res: Response) {
    try {
      const empresaId = getEmpresaId(req);
      const { loteId, categoria, fechaDesde, fechaHasta, limite = 100 } = req.query;
      const query: Record<string, any> = { empresaId };
      if (loteId) query.loteId = new mongoose.Types.ObjectId(loteId as string);
      if (categoria) query.categoria = categoria;
      if (fechaDesde || fechaHasta) {
        query.fecha = {};
        if (fechaDesde) query.fecha.$gte = new Date(fechaDesde as string);
        if (fechaHasta) query.fecha.$lte = new Date(fechaHasta as string);
      }
      const gastos = await GastoAdicional.find(query)
        .populate('loteId', 'nombre')
        .sort({ fecha: -1 })
        .limit(Number(limite))
        .select('-__v');
      res.json(gastos);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener gastos' });
    }
  },

  async show(req: Request, res: Response) {
    try {
      const empresaId = getEmpresaId(req);
      const gasto = await GastoAdicional.findOne({ _id: req.params.id, empresaId }).populate('loteId', 'nombre');
      if (!gasto) return res.status(404).json({ error: 'Gasto no encontrado' });
      res.json(gasto);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener gasto' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const empresaId = getEmpresaId(req);
      if (!empresaId) return res.status(401).json({ error: 'No autenticado' });
      const { loteId, categoria, descripcion, monto, fecha } = req.body;
      if (!categoria || !descripcion || !monto) {
        return res.status(400).json({ error: 'categoria, descripcion y monto son requeridos' });
      }
      if (Number(monto) <= 0) {
        return res.status(400).json({ error: 'El monto debe ser mayor a 0' });
      }
      // If loteId provided, verify ownership
      if (loteId) {
        const lote = await Lote.findOne({ _id: loteId, empresaId });
        if (!lote) return res.status(404).json({ error: 'Lote no encontrado' });
      }
      const gasto = new GastoAdicional({
        loteId: loteId || undefined,
        empresaId,
        categoria,
        descripcion,
        monto: Number(monto),
        fecha: fecha ? new Date(fecha) : new Date(),
      });
      await gasto.save();
      res.status(201).json(gasto);
    } catch (error) {
      res.status(400).json({ error: 'Error al registrar gasto', message: error instanceof Error ? error.message : undefined });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const empresaId = getEmpresaId(req);
      const { loteId, categoria, descripcion, monto, fecha } = req.body;
      const updateData: Record<string, any> = {};
      if (loteId !== undefined) {
        if (loteId) {
          const lote = await Lote.findOne({ _id: loteId, empresaId });
          if (!lote) return res.status(404).json({ error: 'Lote no encontrado' });
          updateData.loteId = loteId;
        } else {
          updateData.loteId = null;
        }
      }
      if (categoria !== undefined) updateData.categoria = categoria;
      if (descripcion !== undefined) updateData.descripcion = descripcion;
      if (monto !== undefined) {
        if (Number(monto) <= 0) return res.status(400).json({ error: 'El monto debe ser mayor a 0' });
        updateData.monto = Number(monto);
      }
      if (fecha !== undefined) updateData.fecha = new Date(fecha);
      const gasto = await GastoAdicional.findOneAndUpdate(
        { _id: req.params.id, empresaId },
        updateData,
        { new: true, runValidators: true }
      );
      if (!gasto) return res.status(404).json({ error: 'Gasto no encontrado' });
      res.json(gasto);
    } catch (error) {
      res.status(400).json({ error: 'Error al actualizar gasto' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const empresaId = getEmpresaId(req);
      const gasto = await GastoAdicional.findOneAndDelete({ _id: req.params.id, empresaId });
      if (!gasto) return res.status(404).json({ error: 'Gasto no encontrado' });
      res.json({ message: 'Gasto eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar gasto' });
    }
  },
};
