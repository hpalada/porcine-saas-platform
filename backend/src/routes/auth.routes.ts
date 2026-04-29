import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authController, verificarToken } from '../controllers/auth.controller';

const router = Router();

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { error: 'Demasiados intentos. Intenta en 15 minutos.' } });
const resetLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5, message: { error: 'Demasiadas solicitudes de reset. Intenta en 1 hora.' } });

router.post('/auth/registrarse', authController.registrarse.bind(authController));
router.post('/auth/login', loginLimiter, authController.login.bind(authController));
router.get('/auth/verificar', verificarToken, authController.verificar.bind(authController));

// Password reset con PIN
router.post('/auth/solicitar-reset', resetLimiter, authController.solicitarReset.bind(authController));
router.post('/auth/verificar-pin', resetLimiter, authController.verificarPin.bind(authController));
router.post('/auth/nueva-contrasena', authController.nuevaContraseña.bind(authController));

// Google OAuth
router.get('/auth/google', authController.googleRedirect.bind(authController));
router.get('/auth/google/callback', authController.googleCallback.bind(authController));
router.post('/auth/completar-perfil-google', authController.completarPerfilGoogle.bind(authController));

export default router;
