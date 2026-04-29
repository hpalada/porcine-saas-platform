"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
const loginLimiter = (0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, max: 10, message: { error: 'Demasiados intentos. Intenta en 15 minutos.' } });
const resetLimiter = (0, express_rate_limit_1.default)({ windowMs: 60 * 60 * 1000, max: 5, message: { error: 'Demasiadas solicitudes de reset. Intenta en 1 hora.' } });
router.post('/auth/registrarse', auth_controller_1.authController.registrarse.bind(auth_controller_1.authController));
router.post('/auth/login', loginLimiter, auth_controller_1.authController.login.bind(auth_controller_1.authController));
router.get('/auth/verificar', auth_controller_1.verificarToken, auth_controller_1.authController.verificar.bind(auth_controller_1.authController));
// Password reset con PIN
router.post('/auth/solicitar-reset', resetLimiter, auth_controller_1.authController.solicitarReset.bind(auth_controller_1.authController));
router.post('/auth/verificar-pin', resetLimiter, auth_controller_1.authController.verificarPin.bind(auth_controller_1.authController));
router.post('/auth/nueva-contrasena', auth_controller_1.authController.nuevaContraseña.bind(auth_controller_1.authController));
// Google OAuth
router.get('/auth/google', auth_controller_1.authController.googleRedirect.bind(auth_controller_1.authController));
router.get('/auth/google/callback', auth_controller_1.authController.googleCallback.bind(auth_controller_1.authController));
router.post('/auth/completar-perfil-google', auth_controller_1.authController.completarPerfilGoogle.bind(auth_controller_1.authController));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map