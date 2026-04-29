"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const superadmin_controller_1 = require("../controllers/superadmin.controller");
const router = (0, express_1.Router)();
router.post('/superadmin/login', superadmin_controller_1.superadminController.login.bind(superadmin_controller_1.superadminController));
router.get('/superadmin/stats', superadmin_controller_1.verificarSuperAdmin, superadmin_controller_1.superadminController.getDashboardStats.bind(superadmin_controller_1.superadminController));
router.get('/superadmin/clientes', superadmin_controller_1.verificarSuperAdmin, superadmin_controller_1.superadminController.getClientes.bind(superadmin_controller_1.superadminController));
router.get('/superadmin/clientes/:id', superadmin_controller_1.verificarSuperAdmin, superadmin_controller_1.superadminController.getCliente.bind(superadmin_controller_1.superadminController));
router.put('/superadmin/clientes/:id/suscripcion', superadmin_controller_1.verificarSuperAdmin, superadmin_controller_1.superadminController.toggleSuscripcion.bind(superadmin_controller_1.superadminController));
router.put('/superadmin/clientes/:id/acceso', superadmin_controller_1.verificarSuperAdmin, superadmin_controller_1.superadminController.toggleAcceso.bind(superadmin_controller_1.superadminController));
router.put('/superadmin/clientes/:id/plan', superadmin_controller_1.verificarSuperAdmin, superadmin_controller_1.superadminController.setPlan.bind(superadmin_controller_1.superadminController));
exports.default = router;
//# sourceMappingURL=superadmin.routes.js.map