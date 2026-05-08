import { Request, Response } from 'express';
import mongoose from 'mongoose';
import OtroConsumo from '../models/OtroConsumo';
import { Lote } from '../models/Lote';

const getEmpresaId = (req: Request) => (req as any).empresaId;

export const otroConsumoController = {
  async index(req: Request, res: Response) {
    try {
      const empresaId = getEmpresaId(req);
      const { loteId, tipo, fechaDesde, fechaHasta, limite = 100 } = req.query;

      const query: Record<string, any> = { empresaId };
      if (loteId) query.loteId = new mongoose.Types.ObjectId(loteId as string);
      if (tipo) query.tipo = new RegExp(tipo as string, 'i'); // case-insensitive
      if (fechaDesde || fechaHasta) {
        query.fecha = {};
        if (fechaDesde) query.fecha.$gte = new Date(fechaDesde as string);
        if (fechaHasta) query.fecha.$lte = new Date(fechaHasta as string);
      }

      const consumos = await OtroConsumo.find(query)
        .populate('loteId', 'nombre')
        .sort({ fecha: -1, createdAt: -1 })
        .limit(Number(limite))
        .select('-__v');

      res.json(consumos);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener otros consumos', message: error instanceof Error ? error.message : undefined });
    }
  },

  async porLote(req: Request, res: Response) {
    try {
      const empresaId = getEmpresaId(req);
      const consumos = await OtroConsumo.find({
        loteId: new mongoose.Types.ObjectId(req.params.id),
        empresaId,
      })
        .sort({ fecha: -1 })
        .select('-__v');

      res.json(consumos);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener otros consumos del lote', message: error instanceof Error ? error.message : undefined });
    }
  },

  async resumenPorLote(req: Request, res: Response) {
    try {
      const empresaId = getEmpresaId(req);
      if (!empresaId) return res.status(400).json({ error: 'empresaId requerido' });
      const empresaOid = new mongoose.Types.ObjectId(empresaId as string);
      const loteId = new mongoose.Types.ObjectId(req.params.id);

      // Verify lote ownership
      const lote = await Lote.findOne({ _id: loteId, empresaId });
      if (!lote) return res.status(404).json({ error: 'Lote no encontrado' });

      const resumenPorTipo = await OtroConsumo.aggregate([
        { $match: { loteId, empresaId: empresaOid } },
        {
          $group: {
            _id: '$tipo',
            cantidadTotal: { $sum: '$cantidad' },
            registros: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            tipo: '$_id',
            cantidadTotal: 1,
            registros: 1,
          },
        },
        { $sort: { tipo: 1 } },
      ]);

      const totales = await OtroConsumo.aggregate([
        { $match: { loteId, empresaId: empresaOid } },
        {
          $group: {
            _id: null,
            cantidadTotal: { $sum: '$cantidad' },
            registros: { $sum: 1 },
          },
        },
      ]);

      res.json({
        porTipo: resumenPorTipo,
        totales: totales[0] || { cantidadTotal: 0, registros: 0 },
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al calcular resumen de otros consumos', message: error instanceof Error ? error.message : undefined });
    }
  },

  async registrar(req: Request, res: Response) {
    try {
      const empresaId = getEmpresaId(req);
      if (!empresaId) return res.status(401).json({ error: 'No autenticado' });
      const empresaOid = new mongoose.Types.ObjectId(empresaId);
      const { loteId, tipo, cantidad, precioUnitario, observaciones, fecha } = req.body;

      if (!loteId || !tipo || !cantidad) {
        return res.status(400).json({ error: 'loteId, tipo y cantidad son requeridos' });
      }
      if (Number(cantidad) <= 0) {
        return res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });
      }
      if (precioUnitario !== undefined && Number(precioUnitario) < 0) {
        return res.status(400).json({ error: 'El precio unitario no puede ser negativo' });
      }

      const lote = await Lote.findOne({ _id: loteId, empresaId });
      if (!lote) return res.status(404).json({ error: 'Lote no encontrado' });
      if (lote.estado !== 'activo') {
        return res.status(400).json({ error: 'El lote debe estar activo para registrar consumos' });
      }

      const consumo = new OtroConsumo({
        empresaId: empresaOid,
        loteId,
        tipo: tipo.toLowerCase().trim(),
        cantidad: Number(cantidad),
        precioUnitario: precioUnitario ? Number(precioUnitario) : 0,
        observaciones,
        fecha: fecha ? new Date(fecha) : new Date(),
      });
      await consumo.save();

      res.status(201).json({
        message: 'Otro consumo registrado correctamente',
        consumo: { ...consumo.toObject(), lote: lote.nombre },
      });
    } catch (error) {
      console.error('Error al registrar otro consumo:', error);
      res.status(400).json({ error: 'Error al registrar otro consumo', message: error instanceof Error ? error.message : undefined });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const empresaId = getEmpresaId(req);
      if (!empresaId) return res.status(401).json({ error: 'No autenticado' });
      const { tipo, cantidad, precioUnitario, observaciones, fecha } = req.body;
      const updateData: Record<string, any> = {};

      if (tipo !== undefined) updateData.tipo = tipo.toLowerCase().trim();
      if (cantidad !== undefined) {
        if (Number(cantidad) <= 0) {
          return res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });
        }
        updateData.cantidad = Number(cantidad);
      }
      if (precioUnitario !== undefined) {
        if (Number(precioUnitario) < 0) {
          return res.status(400).json({ error: 'El precio unitario no puede ser negativo' });
        }
        updateData.precioUnitario = Number(precioUnitario);
      }
      if (observaciones !== undefined) updateData.observaciones = observaciones;
      if (fecha !== undefined) updateData.fecha = new Date(fecha);

      const consumo = await OtroConsumo.findOneAndUpdate(
        { _id: req.params.id, empresaId },
        updateData,
        { new: true, runValidators: true }
      );
      if (!consumo) return res.status(404).json({ error: 'Otro consumo no encontrado' });

      res.json(consumo);
    } catch (error) {
      res.status(400).json({ error: 'Error al actualizar otro consumo', message: error instanceof Error ? error.message : undefined });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const empresaId = getEmpresaId(req);
      if (!empresaId) return res.status(401).json({ error: 'No autenticado' });
      const empresaOid = new mongoose.Types.ObjectId(empresaId);

      const consumo = await OtroConsumo.findOne({ _id: req.params.id, empresaId });
      if (!consumo) return res.status(404).json({ error: 'Otro consumo no encontrado' });

      await OtroConsumo.deleteOne({ _id: req.params.id, empresaId });

      res.json({ message: 'Otro consumo eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar otro consumo', message: error instanceof Error ? error.message : undefined });
    }
  },
};
