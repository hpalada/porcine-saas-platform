import { Router } from 'express';
import { superadminController, verificarSuperAdmin } from '../controllers/superadmin.controller';

const router = Router();

router.post('/superadmin/login', superadminController.login.bind(superadminController));
router.get('/superadmin/stats', verificarSuperAdmin, superadminController.getDashboardStats.bind(superadminController));
router.get('/superadmin/clientes', verificarSuperAdmin, superadminController.getClientes.bind(superadminController));
router.get('/superadmin/clientes/:id', verificarSuperAdmin, superadminController.getCliente.bind(superadminController));
router.put('/superadmin/clientes/:id/suscripcion', verificarSuperAdmin, superadminController.toggleSuscripcion.bind(superadminController));
router.put('/superadmin/clientes/:id/acceso', verificarSuperAdmin, superadminController.toggleAcceso.bind(superadminController));
router.put('/superadmin/clientes/:id/plan', verificarSuperAdmin, superadminController.setPlan.bind(superadminController));

export default router;
