import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { Empresa } from '../models/Empresa';
import { Usuario } from '../models/Usuario';

const getJWTSecret = () => process.env.JWT_SECRET || 'porcine-secret-key-2026';
const getSAEmail = () => process.env.SUPERADMIN_EMAIL || 'admin@porcinesaas.com';
const getSAPassword = () => process.env.SUPERADMIN_PASSWORD || 'superadmin-change-me';

export function verificarSuperAdmin(req: Request, res: Response, next: Function) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token no proporcionado' });
  try {
    const decoded: any = jwt.verify(token, getJWTSecret());
    if (decoded.rol !== 'superadmin') return res.status(403).json({ error: 'Acceso denegado' });
    (req as any).superAdmin = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
}

export const superadminController = {
  async login(req: Request, res: Response) {
    try {
      const { email, contraseña } = req.body;
      if (!email || !contraseña) return res.status(400).json({ error: 'Credenciales requeridas' });

      const SA_EMAIL = getSAEmail();
      const SA_PASSWORD = getSAPassword();

      const validEmail = email === SA_EMAIL;

      // Comparación directa de la contraseña
      if (!validEmail || contraseña !== SA_PASSWORD) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const token = jwt.sign({ email, rol: 'superadmin' }, getJWTSecret(), { expiresIn: '8h' });
      res.json({ token, email, rol: 'superadmin' });
    } catch (error) {
      res.status(500).json({ error: 'Error al autenticar' });
    }
  },

  async getClientes(req: Request, res: Response) {
    try {
      const empresas = await Empresa.find()
        .populate('usuarioAdminId', 'nombre email activo')
        .sort({ createdAt: -1 })
        .lean();

      const resultado = await Promise.all(
        empresas.map(async (e) => {
          const totalUsuarios = await Usuario.countDocuments({ empresaId: e._id });
          return { ...e, totalUsuarios };
        })
      );

      res.json(resultado);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener clientes' });
    }
  },

  async getCliente(req: Request, res: Response) {
    try {
      const empresa = await Empresa.findById(req.params.id).populate('usuarioAdminId', 'nombre email activo').lean();
      if (!empresa) return res.status(404).json({ error: 'Cliente no encontrado' });
      const usuarios = await Usuario.find({ empresaId: req.params.id }).select('-contraseña').lean();
      res.json({ empresa, usuarios });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener cliente' });
    }
  },

  async toggleSuscripcion(req: Request, res: Response) {
    try {
      const empresa = await Empresa.findById(req.params.id);
      if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });
      empresa.suscripcionActiva = !empresa.suscripcionActiva;
      await empresa.save();
      res.json({ message: `Suscripción ${empresa.suscripcionActiva ? 'activada' : 'desactivada'}`, empresa });
    } catch (error) {
      res.status(500).json({ error: 'Error al cambiar suscripción' });
    }
  },

  async toggleAcceso(req: Request, res: Response) {
    try {
      const empresa = await Empresa.findById(req.params.id);
      if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });
      empresa.accesoBloqueado = !empresa.accesoBloqueado;
      await empresa.save();
      res.json({ message: `Acceso ${empresa.accesoBloqueado ? 'bloqueado' : 'desbloqueado'}`, empresa });
    } catch (error) {
      res.status(500).json({ error: 'Error al cambiar acceso' });
    }
  },

  async setPlan(req: Request, res: Response) {
    try {
      const { plan } = req.body;
      if (!['gratuito', 'profesional', 'empresa'].includes(plan)) {
        return res.status(400).json({ error: 'Plan inválido' });
      }
      const empresa = await Empresa.findByIdAndUpdate(req.params.id, { plan }, { new: true });
      if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });
      res.json({ message: 'Plan actualizado', empresa });
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar plan' });
    }
  },

  async getDashboardStats(req: Request, res: Response) {
    try {
      const [total, activas, bloqueadas, porPlan] = await Promise.all([
        Empresa.countDocuments(),
        Empresa.countDocuments({ suscripcionActiva: true }),
        Empresa.countDocuments({ accesoBloqueado: true }),
        Empresa.aggregate([{ $group: { _id: '$plan', count: { $sum: 1 } } }]),
      ]);
      const ultimosRegistros = await Empresa.find().sort({ createdAt: -1 }).limit(5).lean();
      res.json({ total, activas, bloqueadas, inactivas: total - activas, porPlan, ultimosRegistros });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  },
};
