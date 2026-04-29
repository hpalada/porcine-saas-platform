import { Request, Response } from 'express';
import ConcentradoTipo from '../models/ConcentradoTipo';

const getEmpresaId = (req: Request) => (req as any).empresaId || req.query.empresaId;

export const concentradosController = {
  async index(req: Request, res: Response) {
    try {
      const empresaId = getEmpresaId(req);
      const concentrados = await ConcentradoTipo.find({ empresaId }).sort({ nombre: 1 }).select('-__v');
      res.json(concentrados);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener concentrados' });
    }
  },

  async show(req: Request, res: Response) {
    try {
      const empresaId = getEmpresaId(req);
      const concentrado = await ConcentradoTipo.findOne({ _id: req.params.id, empresaId });
      if (!concentrado) return res.status(404).json({ error: 'Concentrado no encontrado' });
      res.json(concentrado);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener concentrado' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const empresaId = getEmpresaId(req);
      const { nombre, descripcion, precioActual, unidad, pesoPorSaco } = req.body;
      const existing = await ConcentradoTipo.findOne({ nombre, empresaId });
      if (existing) return res.status(400).json({ error: 'Ya existe un concentrado con este nombre' });
      const concentrado = new ConcentradoTipo({
        empresaId,
        nombre,
        descripcion,
        precioActual,
        unidad: unidad || 'saco',
        pesoPorSaco: pesoPorSaco !== undefined ? Number(pesoPorSaco) : 50,
      });
      await concentrado.save();
      res.status(201).json(concentrado);
    } catch (error) {
      res.status(400).json({ error: 'Error al crear concentrado', message: error instanceof Error ? error.message : undefined });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const empresaId = getEmpresaId(req);
      const { nombre, descripcion, precioActual, unidad, pesoPorSaco } = req.body;
      const updateData: Record<string, any> = {};
      if (nombre !== undefined) updateData.nombre = nombre;
      if (descripcion !== undefined) updateData.descripcion = descripcion;
      if (precioActual !== undefined) updateData.precioActual = precioActual;
      if (unidad !== undefined) updateData.unidad = unidad;
      if (pesoPorSaco !== undefined) updateData.pesoPorSaco = Number(pesoPorSaco);
      const concentrado = await ConcentradoTipo.findOneAndUpdate({ _id: req.params.id, empresaId }, updateData, { new: true, runValidators: true });
      if (!concentrado) return res.status(404).json({ error: 'Concentrado no encontrado' });
      res.json(concentrado);
    } catch (error) {
      res.status(400).json({ error: 'Error al actualizar concentrado', message: error instanceof Error ? error.message : undefined });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const empresaId = getEmpresaId(req);
      const concentrado = await ConcentradoTipo.findOneAndDelete({ _id: req.params.id, empresaId });
      if (!concentrado) return res.status(404).json({ error: 'Concentrado no encontrado' });
      res.json({ message: 'Concentrado eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar concentrado' });
    }
  },
};
