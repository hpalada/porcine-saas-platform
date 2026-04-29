import { Router, Request, Response, NextFunction } from 'express';
import { Empresa } from '../models/Empresa';
import { Usuario } from '../models/Usuario';

const router = Router();

// ─── Auth middleware ──────────────────────────────────────────────────────────
function verificarMasterKey(req: Request, res: Response, next: NextFunction) {
  const key = req.headers['x-master-key'] || req.headers.authorization?.replace('Bearer ', '');
  const masterKey = process.env.MASTER_API_KEY;

  if (!masterKey) {
    return res.status(503).json({ error: 'MASTER_API_KEY no configurada en el servidor' });
  }
  if (!key || key !== masterKey) {
    return res.status(401).json({ error: 'API key inválida' });
  }
  next();
}

router.use('/master', verificarMasterKey);

// ─── GET /master/ping — info del sistema ─────────────────────────────────────
router.get('/master/ping', async (_req: Request, res: Response) => {
  const totalClientes = await Empresa.countDocuments();
  const activos = await Empresa.countDocuments({ suscripcionActiva: true, accesoBloqueado: false });
  res.json({
    sistema: 'Porcine SaaS',
    descripcion: 'Gestión de granjas porcinas',
    version: '1.0.0',
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
    stats: { totalClientes, activos },
    timestamp: new Date().toISOString(),
  });
});

// ─── GET /master/clients — listar todos los clientes ─────────────────────────
router.get('/master/clients', async (_req: Request, res: Response) => {
  try {
    const empresas = await Empresa.find()
      .populate('usuarioAdminId', 'nombre email activo')
      .sort({ createdAt: -1 })
      .lean();

    const clientes = await Promise.all(
      empresas.map(async (e) => {
        const totalUsuarios = await Usuario.countDocuments({ empresaId: e._id });
        const admin = e.usuarioAdminId as any;
        return {
          id: e._id,
          nombre: e.nombre,
          email: e.email,
          ubicacion: e.ubicacion,
          plan: e.plan,
          suscripcionActiva: e.suscripcionActiva,
          accesoBloqueado: e.accesoBloqueado,
          totalUsuarios,
          adminNombre: admin?.nombre || '',
          adminEmail: admin?.email || '',
          creadoEn: e.createdAt,
        };
      })
    );

    res.json({ clientes, total: clientes.length });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

// ─── GET /master/clients/:id — detalle de un cliente ─────────────────────────
router.get('/master/clients/:id', async (req: Request, res: Response) => {
  try {
    const empresa = await Empresa.findById(req.params.id)
      .populate('usuarioAdminId', 'nombre email activo')
      .lean();
    if (!empresa) return res.status(404).json({ error: 'Cliente no encontrado' });

    const usuarios = await Usuario.find({ empresaId: empresa._id }, 'nombre email rol activo createdAt').lean();
    res.json({ empresa, usuarios });
  } catch {
    res.status(500).json({ error: 'Error al obtener cliente' });
  }
});

// ─── PUT /master/clients/:id/subscription — activar/desactivar suscripción ───
router.put('/master/clients/:id/subscription', async (req: Request, res: Response) => {
  try {
    const { activa } = req.body;
    if (typeof activa !== 'boolean') return res.status(400).json({ error: 'Campo "activa" booleano requerido' });

    const empresa = await Empresa.findByIdAndUpdate(
      req.params.id,
      { suscripcionActiva: activa },
      { new: true }
    );
    if (!empresa) return res.status(404).json({ error: 'Cliente no encontrado' });

    res.json({ ok: true, id: empresa._id, suscripcionActiva: empresa.suscripcionActiva });
  } catch {
    res.status(500).json({ error: 'Error al actualizar suscripción' });
  }
});

// ─── PUT /master/clients/:id/access — bloquear/desbloquear acceso ─────────────
router.put('/master/clients/:id/access', async (req: Request, res: Response) => {
  try {
    const { bloqueado } = req.body;
    if (typeof bloqueado !== 'boolean') return res.status(400).json({ error: 'Campo "bloqueado" booleano requerido' });

    const empresa = await Empresa.findByIdAndUpdate(
      req.params.id,
      { accesoBloqueado: bloqueado },
      { new: true }
    );
    if (!empresa) return res.status(404).json({ error: 'Cliente no encontrado' });

    res.json({ ok: true, id: empresa._id, accesoBloqueado: empresa.accesoBloqueado });
  } catch {
    res.status(500).json({ error: 'Error al actualizar acceso' });
  }
});

// ─── PUT /master/clients/:id/plan — cambiar plan ──────────────────────────────
router.put('/master/clients/:id/plan', async (req: Request, res: Response) => {
  try {
    const { plan } = req.body;
    if (!['gratuito', 'profesional', 'empresa'].includes(plan)) {
      return res.status(400).json({ error: 'Plan inválido. Usa: gratuito, profesional, empresa' });
    }

    const empresa = await Empresa.findByIdAndUpdate(
      req.params.id,
      { plan },
      { new: true }
    );
    if (!empresa) return res.status(404).json({ error: 'Cliente no encontrado' });

    res.json({ ok: true, id: empresa._id, plan: empresa.plan });
  } catch {
    res.status(500).json({ error: 'Error al actualizar plan' });
  }
});

export default router;
