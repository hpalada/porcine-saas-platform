import { Request, Response } from 'express';
import mongoose from 'mongoose';
import ConcentradoTipo from '../models/ConcentradoTipo';
import InventarioMovimiento from '../models/InventarioMovimiento';

const getEmpresaId = (req: Request) => (req as any).empresaId;

async function getStock(concentradoTipoId: mongoose.Types.ObjectId, empresaId: mongoose.Types.ObjectId): Promise<number> {
  const movs = await InventarioMovimiento.aggregate([
    { $match: { concentradoTipoId, empresaId } },
    {
      $group: {
        _id: null,
        entradas: { $sum: { $cond: [{ $eq: ['$tipo', 'entrada'] }, '$cantidad', 0] } },
        salidas: { $sum: { $cond: [{ $eq: ['$tipo', 'salida'] }, '$cantidad', 0] } },
        ajustes: { $sum: { $cond: [{ $eq: ['$tipo', 'ajuste'] }, '$cantidad', 0] } },
      },
    },
  ]);
  const m = movs[0] || { entradas: 0, salidas: 0, ajustes: 0 };
  return m.entradas - m.salidas + m.ajustes;
}

export const inventarioController = {
  async stockActual(req: Request, res: Response) {
    try {
      const empresaId = getEmpresaId(req);
      if (!empresaId) return res.status(401).json({ error: 'No autenticado' });
      const empresaOid = new mongoose.Types.ObjectId(empresaId);

      const concentrados = await ConcentradoTipo.find({ empresaId }).select('_id nombre unidad precioActual');

      const stockPorTipo = await Promise.all(
        concentrados.map(async (c) => {
          const movs = await InventarioMovimiento.aggregate([
            { $match: { concentradoTipoId: c._id, empresaId: empresaOid } },
            {
              $group: {
                _id: null,
                entradas: { $sum: { $cond: [{ $eq: ['$tipo', 'entrada'] }, '$cantidad', 0] } },
                salidas: { $sum: { $cond: [{ $eq: ['$tipo', 'salida'] }, '$cantidad', 0] } },
                ajustes: { $sum: { $cond: [{ $eq: ['$tipo', 'ajuste'] }, '$cantidad', 0] } },
              },
            },
          ]);
          const m = movs[0] || { entradas: 0, salidas: 0, ajustes: 0 };
          const stock = Math.round((m.entradas - m.salidas + m.ajustes) * 100) / 100;
          return {
            _id: c._id,
            nombre: c.nombre,
            unidad: c.unidad,
            precioActual: c.precioActual,
            stock,
            entradas: m.entradas,
            salidas: m.salidas,
            ajustes: m.ajustes,
            valorTotal: stock * c.precioActual,
          };
        })
      );
      res.json(stockPorTipo);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener inventario', message: error instanceof Error ? error.message : undefined });
    }
  },

  async historial(req: Request, res: Response) {
    try {
      const empresaId = getEmpresaId(req);
      const { concentradoTipoId, tipo, limite = 50 } = req.query;
      const query: Record<string, any> = { empresaId };
      if (concentradoTipoId) query.concentradoTipoId = new mongoose.Types.ObjectId(concentradoTipoId as string);
      if (tipo) query.tipo = tipo;
      const movimientos = await InventarioMovimiento.find(query)
        .populate('concentradoTipoId', 'nombre unidad')
        .sort({ fecha: -1, createdAt: -1 })
        .limit(Number(limite))
        .select('-__v');
      res.json(movimientos);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener historial', message: error instanceof Error ? error.message : undefined });
    }
  },

  async registrarCompra(req: Request, res: Response) {
    try {
      const empresaId = getEmpresaId(req);
      if (!empresaId) return res.status(401).json({ error: 'No autenticado' });
      const empresaOid = new mongoose.Types.ObjectId(empresaId);
      const { concentradoTipoId, cantidad, motivo } = req.body;

      if (!concentradoTipoId || !cantidad) {
        return res.status(400).json({ error: 'concentradoTipoId y cantidad son requeridos' });
      }
      if (Number(cantidad) <= 0) {
        return res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });
      }

      const concentrado = await ConcentradoTipo.findOne({ _id: concentradoTipoId, empresaId });
      if (!concentrado) return res.status(404).json({ error: 'Tipo de concentrado no encontrado' });

      const stockAnterior = await getStock(new mongoose.Types.ObjectId(concentradoTipoId), empresaOid);
      const stockNuevo = stockAnterior + Number(cantidad);

      const movimiento = new InventarioMovimiento({
        empresaId: empresaOid,
        concentradoTipoId,
        tipo: 'entrada',
        cantidad: Number(cantidad),
        stockAnterior,
        stockNuevo,
        motivo: motivo || 'Compra de concentrado',
        fecha: new Date(),
      });
      await movimiento.save();
      res.status(201).json({ message: 'Compra registrada correctamente', movimiento, stockAnterior, stockNuevo });
    } catch (error) {
      res.status(400).json({ error: 'Error al registrar compra', message: error instanceof Error ? error.message : undefined });
    }
  },

  async registrarAjuste(req: Request, res: Response) {
    try {
      const empresaId = getEmpresaId(req);
      if (!empresaId) return res.status(401).json({ error: 'No autenticado' });
      const empresaOid = new mongoose.Types.ObjectId(empresaId);
      const { concentradoTipoId, cantidad, motivo } = req.body;

      if (!concentradoTipoId || cantidad === undefined || cantidad === null || cantidad === '' || !motivo) {
        return res.status(400).json({ error: 'concentradoTipoId, cantidad y motivo son requeridos' });
      }
      const cantidadNum = Number(cantidad);
      if (cantidadNum === 0) {
        return res.status(400).json({ error: 'La cantidad no puede ser 0' });
      }

      const concentrado = await ConcentradoTipo.findOne({ _id: concentradoTipoId, empresaId });
      if (!concentrado) return res.status(404).json({ error: 'Tipo de concentrado no encontrado' });

      const stockAnterior = await getStock(new mongoose.Types.ObjectId(concentradoTipoId), empresaOid);
      const stockNuevo = stockAnterior + cantidadNum;
      if (stockNuevo < 0) {
        return res.status(400).json({ error: `El ajuste resultaría en stock negativo (actual: ${stockAnterior})` });
      }

      // Positive adjustment → 'ajuste' (adds), negative → 'salida' (subtracts).
      // Aggregation does: entradas - salidas + ajustes, so signs work out.
      const tipo = cantidadNum > 0 ? 'ajuste' : 'salida';
      const movimiento = new InventarioMovimiento({
        empresaId: empresaOid,
        concentradoTipoId,
        tipo,
        cantidad: Math.abs(cantidadNum),
        stockAnterior,
        stockNuevo,
        motivo: `[Ajuste] ${motivo}`,
        fecha: new Date(),
      });
      await movimiento.save();
      res.status(201).json({ message: 'Ajuste registrado correctamente', movimiento, stockAnterior, stockNuevo });
    } catch (error) {
      res.status(400).json({ error: 'Error al registrar ajuste', message: error instanceof Error ? error.message : undefined });
    }
  },
};
