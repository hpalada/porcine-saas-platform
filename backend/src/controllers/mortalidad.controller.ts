import { Request, Response } from 'express';
import mongoose from 'mongoose';
import MortalidadLote from '../models/MortalidadLote';
import { Lote } from '../models/Lote';

const getEmpresaId = (req: Request) => (req as any).empresaId;

export const mortalidadController = {
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
      const registros = await MortalidadLote.find(query)
        .populate('loteId', 'nombre')
        .sort({ fecha: -1 })
        .select('-__v');
      res.json(registros);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener mortalidades' });
    }
  },

  async porLote(req: Request, res: Response) {
    try {
      const empresaId = getEmpresaId(req);
      const registros = await MortalidadLote.find({
        loteId: new mongoose.Types.ObjectId(req.params.id),
        empresaId,
      })
        .sort({ fecha: -1 })
        .select('-__v');
      res.json(registros);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener mortalidades del lote' });
    }
  },

  async crear(req: Request, res: Response) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const empresaId = getEmpresaId(req);
      if (!empresaId) return res.status(401).json({ error: 'No autenticado' });
      const { loteId, cantidadMuertas, fecha, motivo, observaciones } = req.body;

      if (!loteId || !cantidadMuertas || !motivo) {
        return res.status(400).json({ error: 'loteId, cantidadMuertas y motivo son requeridos' });
      }
      if (Number(cantidadMuertas) <= 0) {
        return res.status(400).json({ error: 'La cantidad de muertes debe ser mayor a 0' });
      }

      // Verify lote belongs to this empresa AND is active
      const lote = await Lote.findOne({ _id: loteId, empresaId }).session(session);
      if (!lote) return res.status(404).json({ error: 'Lote no encontrado' });
      if (lote.estado !== 'activo') {
        return res.status(400).json({ error: 'El lote debe estar activo para registrar mortalidades' });
      }
      // Check that we have enough animals
      if (lote.cantidadActual < Number(cantidadMuertas)) {
        return res.status(400).json({ error: 'No hay suficientes animales vivos en el lote' });
      }

      const mortalidad = new MortalidadLote({
        empresaId,
        loteId,
        cantidadMuertas: Number(cantidadMuertas),
        fecha: fecha ? new Date(fecha) : new Date(),
        motivo,
        observaciones,
      });
      await mortalidad.save({ session });

      // Update lote: decrease cantidadActual by cantidadMuertas
      lote.cantidadActual -= Number(cantidadMuertas);
      // If cantidadActual becomes 0, we might want to change estado? Not required, but we can leave it.
      await lote.save({ session });

      await session.commitTransaction();
      session.endSession();

      res.status(201).json(mortalidad);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      res.status(400).json({ error: 'Error al registrar mortalidad', message: error instanceof Error ? error.message : undefined });
    }
  },

  async actualizar(req: Request, res: Response) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const empresaId = getEmpresaId(req);
      const { cantidadMuertas, fecha, motivo, observaciones } = req.body;
      const updateData: Record<string, any> = {};
      if (cantidadMuertas !== undefined) {
        if (Number(cantidadMuertas) <= 0) {
          return res.status(400).json({ error: 'La cantidad de muertes debe ser mayor a 0' });
        }
        updateData.cantidadMuertas = Number(cantidadMuertas);
      }
      if (fecha !== undefined) updateData.fecha = new Date(fecha);
      if (motivo !== undefined) updateData.motivo = motivo;
      if (observaciones !== undefined) updateData.observaciones = observaciones;

      const mortalidad = await MortalidadLote.findOneAndUpdate(
        { _id: req.params.id, empresaId },
        updateData,
        { new: true, runValidators: true, session }
      );
      if (!mortalidad) return res.status(404).json({ error: 'Registro no encontrado' });

      // We need to update the lote: first, we have to reverse the old mortality and then apply the new one?
      // Since we don't store the old cantidadMuertas in the update, we have to get the old record.
      // For simplicity, we will not support updating the cantidadMuertas in this version? Or we do it by fetching the old record.
      // Given the complexity, we will only allow updating fecha, motivo, observaciones and not cantidadMuertas.
      // But the requirement might expect to update the cantidadMueltas.
      // We'll do: if cantidadMuertas is being updated, we will adjust the lote accordingly.
      // We'll fetch the old record to get the old cantidadMuertas.

      if (updateData.cantidadMuertas !== undefined) {
        const oldMortalidad = await MortalidadLote.findById(req.params.id).session(session);
        if (!oldMortalidad) {
          throw new Error('Mortalidad no encontrada para reversión');
        }
        // Reverse the old mortality: add back the old cantidadMuertas to the lote
        const lote = await Lote.findOne({ _id: oldMortalidad.loteId, empresaId }).session(session);
        if (lote) {
          lote.cantidadActual += oldMortalidad.cantidadMuertas;
          lote.cantidadActual -= updateData.cantidadMuertas;
          await lote.save({ session });
        }
      }

      await session.commitTransaction();
      session.endSession();

      res.json(mortalidad);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      res.status(400).json({ error: 'Error al actualizar mortalidad', message: error instanceof Error ? error.message : undefined });
    }
  },

  async eliminar(req: Request, res: Response) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const empresaId = getEmpresaId(req);
      const mortalidad = await MortalidadLote.findOneAndDelete({ _id: req.params.id, empresaId }).session(session);
      if (!mortalidad) return res.status(404).json({ error: 'Mortalidad no encontrada' });

      // Reverse the mortality: add the cantidadMuertas back to the lote
      const lote = await Lote.findOne({ _id: mortalidad.loteId, empresaId }).session(session);
      if (lote) {
        lote.cantidadActual += mortalidad.cantidadMuertas;
        await lote.save({ session });
      }

      await session.commitTransaction();
      session.endSession();

      res.json({ message: 'Mortalidad eliminada correctamente' });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      res.status(500).json({ error: 'Error al eliminar mortalidad', message: error instanceof Error ? error.message : undefined });
    }
  },
};
