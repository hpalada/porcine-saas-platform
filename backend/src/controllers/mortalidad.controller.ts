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
      }).sort({ fecha: -1 }).select('-__v');
      res.json(registros);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener mortalidades del lote' });
    }
  },

  async crear(req: Request, res: Response) {
    try {
      const empresaId = getEmpresaId(req);
      if (!empresaId) return res.status(401).json({ error: 'No autenticado' });
      const { loteId, cantidadMuertas, fecha, motivo, observaciones } = req.body;

      if (!loteId || !cantidadMuertas || !motivo) {
        return res.status(400).json({ error: 'loteId, cantidadMuertas y motivo son requeridos' });
      }
      const cantidad = Number(cantidadMuertas);
      if (cantidad <= 0) {
        return res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });
      }

      const lote = await Lote.findOne({ _id: loteId, empresaId });
      if (!lote) return res.status(404).json({ error: 'Lote no encontrado' });
      if (lote.estado !== 'activo') {
        return res.status(400).json({ error: 'El lote debe estar activo para registrar mortalidades' });
      }
      if ((lote.cantidadActual || 0) < cantidad) {
        return res.status(400).json({ error: `No hay suficientes animales vivos. Actuales: ${lote.cantidadActual}` });
      }

      const mortalidad = await MortalidadLote.create({
        empresaId,
        loteId,
        cantidadMuertas: cantidad,
        fecha: fecha ? new Date(fecha) : new Date(),
        motivo,
        observaciones,
      });

      const nuevasMuertas = (lote.cantidadMuertas || 0) + cantidad;
      await Lote.findByIdAndUpdate(loteId, {
        cantidadMuertas: nuevasMuertas,
        cantidadActual: Math.max(0, lote.cantidadInicial - (lote.cantidadSalida || 0) - nuevasMuertas),
      });

      res.status(201).json(mortalidad);
    } catch (error) {
      res.status(400).json({ error: 'Error al registrar mortalidad', message: error instanceof Error ? error.message : undefined });
    }
  },

  async actualizar(req: Request, res: Response) {
    try {
      const empresaId = getEmpresaId(req);
      const { cantidadMuertas, fecha, motivo, observaciones } = req.body;

      const mortalidadAnterior = await MortalidadLote.findOne({ _id: req.params.id, empresaId });
      if (!mortalidadAnterior) return res.status(404).json({ error: 'Registro no encontrado' });

      const updateData: Record<string, any> = {};
      if (fecha !== undefined) updateData.fecha = new Date(fecha);
      if (motivo !== undefined) updateData.motivo = motivo;
      if (observaciones !== undefined) updateData.observaciones = observaciones;

      if (cantidadMuertas !== undefined) {
        const nuevaCantidad = Number(cantidadMuertas);
        if (nuevaCantidad <= 0) return res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });
        const diferencia = nuevaCantidad - mortalidadAnterior.cantidadMuertas;
        const lote = await Lote.findOne({ _id: mortalidadAnterior.loteId, empresaId });
        if (lote && diferencia > 0 && (lote.cantidadActual || 0) < diferencia) {
          return res.status(400).json({ error: `No hay suficientes animales vivos. Disponibles: ${lote.cantidadActual}` });
        }
        updateData.cantidadMuertas = nuevaCantidad;
        if (lote) {
          const nuevasMuertas = Math.max(0, (lote.cantidadMuertas || 0) + diferencia);
          await Lote.findByIdAndUpdate(mortalidadAnterior.loteId, {
            cantidadMuertas: nuevasMuertas,
            cantidadActual: Math.max(0, lote.cantidadInicial - (lote.cantidadSalida || 0) - nuevasMuertas),
          });
        }
      }

      const mortalidad = await MortalidadLote.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
      res.json(mortalidad);
    } catch (error) {
      res.status(400).json({ error: 'Error al actualizar mortalidad', message: error instanceof Error ? error.message : undefined });
    }
  },

  async eliminar(req: Request, res: Response) {
    try {
      const empresaId = getEmpresaId(req);
      const mortalidad = await MortalidadLote.findOneAndDelete({ _id: req.params.id, empresaId });
      if (!mortalidad) return res.status(404).json({ error: 'Mortalidad no encontrada' });
      const loteParaEliminar = await Lote.findById(mortalidad.loteId);
      if (loteParaEliminar) {
        const nuevasMuertas = Math.max(0, (loteParaEliminar.cantidadMuertas || 0) - mortalidad.cantidadMuertas);
        await Lote.findByIdAndUpdate(mortalidad.loteId, {
          cantidadMuertas: nuevasMuertas,
          cantidadActual: Math.max(0, loteParaEliminar.cantidadInicial - (loteParaEliminar.cantidadSalida || 0) - nuevasMuertas),
        });
      }
      res.json({ message: 'Mortalidad eliminada correctamente' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar mortalidad', message: error instanceof Error ? error.message : undefined });
    }
  },
};
