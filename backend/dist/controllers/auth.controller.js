"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
exports.verificarToken = verificarToken;
exports.verificarRol = verificarRol;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const Usuario_1 = require("../models/Usuario");
const Empresa_1 = require("../models/Empresa");
const PinReset_1 = require("../models/PinReset");
const email_1 = require("../utils/email");
const JWT_SECRET = process.env.JWT_SECRET || 'porcine-secret-key-2026';
const JWT_EXPIRE = '7d';
function makeToken(payload) {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE });
}
exports.authController = {
    async registrarse(req, res) {
        try {
            const { nombreEmpresa, nombreUsuario, email, contraseña, ubicacion } = req.body;
            if (!nombreEmpresa || !nombreUsuario || !email || !contraseña) {
                return res.status(400).json({ error: 'Faltan campos requeridos' });
            }
            const existe = await Usuario_1.Usuario.findOne({ email });
            if (existe)
                return res.status(400).json({ error: 'El email ya está registrado' });
            const empresa = new Empresa_1.Empresa({ nombre: nombreEmpresa, email, ubicacion: ubicacion || '', plan: 'gratuito', suscripcionActiva: true, accesoBloqueado: false });
            const salt = await bcryptjs_1.default.genSalt(10);
            const usuario = new Usuario_1.Usuario({
                nombre: nombreUsuario, email,
                contraseña: await bcryptjs_1.default.hash(contraseña, salt),
                rol: 'administrador', empresaId: empresa._id,
            });
            empresa.usuarioAdminId = usuario._id;
            await empresa.save();
            await usuario.save();
            // Fire-and-forget — don't block the response on email delivery
            (0, email_1.sendWelcomeEmail)(email, nombreUsuario, nombreEmpresa).catch(() => { });
            const token = makeToken({ usuarioId: usuario._id, empresaId: empresa._id, rol: usuario.rol });
            res.status(201).json({
                token,
                usuario: { id: usuario._id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol, empresa: { id: empresa._id, nombre: empresa.nombre, ubicacion: empresa.ubicacion, contacto: empresa.contacto, email: empresa.email } },
            });
        }
        catch (error) {
            console.error('Error en registro:', error);
            res.status(500).json({ error: 'Error al registrar' });
        }
    },
    async login(req, res) {
        try {
            const { email, contraseña } = req.body;
            if (!email || !contraseña)
                return res.status(400).json({ error: 'Email y contraseña requeridos' });
            const usuario = await Usuario_1.Usuario.findOne({ email }).select('+contraseña').populate('empresaId');
            if (!usuario)
                return res.status(401).json({ error: 'Credenciales inválidas' });
            // Validar que el usuario tenga contraseña definida (no sea usuario de Google)
            if (!usuario.contraseña) {
                return res.status(401).json({ error: 'Este usuario se registró con Google. Usa la opción de Google para ingresar.' });
            }
            if (!await bcryptjs_1.default.compare(contraseña, usuario.contraseña))
                return res.status(401).json({ error: 'Credenciales inválidas' });
            if (!usuario.activo)
                return res.status(401).json({ error: 'Usuario desactivado' });
            const empresa = usuario.empresaId;
            if (empresa.accesoBloqueado)
                return res.status(403).json({ error: 'Acceso bloqueado. Contacta al administrador.' });
            if (!empresa.suscripcionActiva)
                return res.status(403).json({ error: 'Suscripción inactiva. Contacta al administrador para activar tu cuenta.' });
            const token = makeToken({ usuarioId: usuario._id, empresaId: empresa._id, rol: usuario.rol });
            res.json({
                token,
                usuario: { id: usuario._id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol, empresa: { id: empresa._id, nombre: empresa.nombre, ubicacion: empresa.ubicacion, contacto: empresa.contacto, email: empresa.email } },
            });
        }
        catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({ error: 'Error al iniciar sesión' });
        }
    },
    async verificar(req, res) {
        res.setHeader('Cache-Control', 'no-store');
        res.json({ usuario: req.usuario, valido: true });
    },
    // POST /api/auth/solicitar-reset
    async solicitarReset(req, res) {
        try {
            const { email } = req.body;
            if (!email)
                return res.status(400).json({ error: 'Email requerido' });
            const usuario = await Usuario_1.Usuario.findOne({ email });
            // Siempre responder igual para no revelar si el email existe
            if (!usuario)
                return res.json({ message: 'Si el correo está registrado recibirás un PIN.' });
            // Invalidar PINs anteriores
            await PinReset_1.PinReset.updateMany({ email, usado: false }, { usado: true });
            const pin = String(Math.floor(100000 + Math.random() * 900000));
            const expira = new Date(Date.now() + 15 * 60 * 1000); // 15 min
            await PinReset_1.PinReset.create({ email, pin, expira });
            await (0, email_1.sendPinReset)(email, pin, usuario.nombre);
            res.json({ message: 'Si el correo está registrado recibirás un PIN.' });
        }
        catch (error) {
            console.error('❌ Error solicitando reset:', error instanceof Error ? error.message : error);
            res.status(500).json({ error: 'Error al procesar la solicitud' });
        }
    },
    // POST /api/auth/verificar-pin
    async verificarPin(req, res) {
        try {
            const { email, pin } = req.body;
            if (!email || !pin)
                return res.status(400).json({ error: 'Email y PIN requeridos' });
            const registro = await PinReset_1.PinReset.findOne({ email, pin, usado: false, expira: { $gt: new Date() } });
            if (!registro)
                return res.status(400).json({ error: 'PIN inválido o expirado' });
            // Token temporal de 10 minutos para cambiar contraseña
            const resetToken = jsonwebtoken_1.default.sign({ email, pinId: registro._id, accion: 'reset' }, JWT_SECRET, { expiresIn: '10m' });
            res.json({ resetToken });
        }
        catch (error) {
            res.status(500).json({ error: 'Error al verificar PIN' });
        }
    },
    // POST /api/auth/nueva-contraseña
    async nuevaContraseña(req, res) {
        try {
            const { resetToken, nuevaContraseña } = req.body;
            if (!resetToken || !nuevaContraseña)
                return res.status(400).json({ error: 'Token y contraseña requeridos' });
            if (nuevaContraseña.length < 6)
                return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
            const decoded = jsonwebtoken_1.default.verify(resetToken, JWT_SECRET);
            if (decoded.accion !== 'reset')
                return res.status(400).json({ error: 'Token inválido' });
            // Marcar PIN como usado
            await PinReset_1.PinReset.findByIdAndUpdate(decoded.pinId, { usado: true });
            const salt = await bcryptjs_1.default.genSalt(10);
            await Usuario_1.Usuario.findOneAndUpdate({ email: decoded.email }, { contraseña: await bcryptjs_1.default.hash(nuevaContraseña, salt) });
            res.json({ message: 'Contraseña actualizada correctamente' });
        }
        catch (error) {
            res.status(400).json({ error: 'Token inválido o expirado' });
        }
    },
    // GET /api/auth/google — redirige a Google
    googleRedirect(req, res) {
        try {
            const clientId = process.env.GOOGLE_CLIENT_ID;
            if (!clientId) {
                console.error('❌ GOOGLE_CLIENT_ID no está configurado');
                return res.status(500).json({ error: 'Google OAuth no está configurado' });
            }
            const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
            const scope = 'openid email profile';
            const state = crypto_1.default.randomBytes(16).toString('hex');
            console.log('🔐 Google OAuth redirect:');
            console.log('  Client ID:', clientId.substring(0, 20) + '...');
            console.log('  Redirect URI:', redirectUri);
            console.log('  Scope:', scope);
            const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${state}`;
            res.redirect(url);
        }
        catch (error) {
            console.error('Google redirect error:', error);
            res.status(500).json({ error: 'Error al redirigir a Google' });
        }
    },
    // GET /api/auth/google/callback
    async googleCallback(req, res) {
        try {
            const { code } = req.query;
            console.log('🔄 Google callback recibido');
            console.log('  Code:', code ? 'presente' : 'FALTANTE');
            if (!code) {
                throw new Error('No authorization code from Google');
            }
            const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            console.log('  Client ID:', process.env.GOOGLE_CLIENT_ID ? 'presente' : 'FALTANTE');
            console.log('  Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? 'presente' : 'FALTANTE');
            if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
                throw new Error('Google credentials not configured');
            }
            // Intercambiar code por tokens
            const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    code: code,
                    client_id: process.env.GOOGLE_CLIENT_ID,
                    client_secret: process.env.GOOGLE_CLIENT_SECRET,
                    redirect_uri: redirectUri,
                    grant_type: 'authorization_code',
                }),
            });
            const tokenData = await tokenRes.json();
            console.log('  Token response status:', tokenRes.status);
            if (!tokenRes.ok) {
                console.error('  Token error:', tokenData);
                throw new Error(`Google token error: ${tokenData.error || 'Unknown'}`);
            }
            if (!tokenData.access_token)
                throw new Error('No access token from Google');
            // Obtener perfil
            const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { Authorization: `Bearer ${tokenData.access_token}` },
            });
            const profile = await profileRes.json();
            console.log('  Profile:', profile.email ? 'obtenido' : 'ERROR');
            const { email, name, picture } = profile;
            // Verificar si el usuario ya existe
            let usuarioDoc = await Usuario_1.Usuario.findOne({ email });
            if (usuarioDoc) {
                // Login con Google para usuario existente
                const usuario = await usuarioDoc.populate('empresaId');
                const empresa = usuario.empresaId;
                if (empresa.accesoBloqueado)
                    return res.redirect(`${frontendUrl}/login?error=bloqueado`);
                if (!empresa.suscripcionActiva)
                    return res.redirect(`${frontendUrl}/login?error=inactivo`);
                const token = makeToken({ usuarioId: usuario._id, empresaId: empresa._id, rol: usuario.rol });
                console.log('✅ Google login exitoso (usuario existente)');
                return res.redirect(`${frontendUrl}/auth/callback?token=${token}&nombre=${encodeURIComponent(usuario.nombre)}&empresaNombre=${encodeURIComponent(empresa.nombre)}&empresaId=${empresa._id}&rol=${usuario.rol}&id=${usuario._id}&email=${encodeURIComponent(email)}`);
            }
            // Nuevo usuario: generar token temporal para completar perfil
            const tempToken = jsonwebtoken_1.default.sign({ email, nombre: name, picture, accion: 'completar-perfil' }, JWT_SECRET, { expiresIn: '1h' });
            console.log('✅ Google perfil obtenido. Redirigiendo a completar perfil');
            res.redirect(`${frontendUrl}/auth/completar-perfil?tempToken=${tempToken}&email=${encodeURIComponent(email)}&nombre=${encodeURIComponent(name)}`);
        }
        catch (error) {
            console.error('❌ Google OAuth error:', error);
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google`);
        }
    },
    // POST /api/auth/completar-perfil-google
    async completarPerfilGoogle(req, res) {
        try {
            const { tempToken, nombreEmpresa, ubicacion } = req.body;
            if (!tempToken || !nombreEmpresa || !ubicacion) {
                return res.status(400).json({ error: 'Token, nombre de empresa y ubicación son requeridos' });
            }
            const decoded = jsonwebtoken_1.default.verify(tempToken, JWT_SECRET);
            if (decoded.accion !== 'completar-perfil') {
                return res.status(400).json({ error: 'Token inválido' });
            }
            const { email, nombre } = decoded;
            // Verificar que el email no exista
            const existe = await Usuario_1.Usuario.findOne({ email });
            if (existe) {
                return res.status(400).json({ error: 'Este email ya está registrado' });
            }
            // Crear empresa
            const empresa = new Empresa_1.Empresa({
                nombre: nombreEmpresa,
                email,
                ubicacion: ubicacion.trim(),
                plan: 'gratuito',
                suscripcionActiva: true,
                accesoBloqueado: false,
            });
            // Crear usuario con contraseña aleatoria (se registró con Google)
            const fakeHash = await bcryptjs_1.default.hash(crypto_1.default.randomBytes(32).toString('hex'), 10);
            const usuario = new Usuario_1.Usuario({
                nombre,
                email,
                contraseña: fakeHash,
                rol: 'administrador',
                empresaId: empresa._id,
            });
            empresa.usuarioAdminId = usuario._id;
            await empresa.save();
            await usuario.save();
            // Enviar email de bienvenida
            await (0, email_1.sendWelcomeEmail)(email, nombre, nombreEmpresa).catch((err) => {
                console.error('Error enviando email de bienvenida:', err);
            });
            const token = makeToken({ usuarioId: usuario._id, empresaId: empresa._id, rol: usuario.rol });
            console.log('✅ Perfil completado y usuario creado');
            res.json({
                token,
                usuario: {
                    id: usuario._id,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    rol: usuario.rol,
                    empresa: {
                        id: empresa._id,
                        nombre: empresa.nombre,
                        ubicacion: empresa.ubicacion,
                        email: empresa.email,
                    },
                },
            });
        }
        catch (error) {
            console.error('Error completando perfil:', error);
            if (error.name === 'TokenExpiredError') {
                return res.status(400).json({ error: 'El token ha expirado. Por favor intenta nuevamente.' });
            }
            res.status(500).json({ error: 'Error al completar el perfil' });
        }
    },
};
async function verificarToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token)
        return res.status(401).json({ error: 'Token no proporcionado' });
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch {
        return res.status(401).json({ error: 'Token inválido' });
    }
    req.usuario = decoded;
    req.empresaId = decoded.empresaId;
    // Check subscription on every request — catches cancellations mid-session
    if (decoded.empresaId) {
        try {
            const empresa = await Empresa_1.Empresa.findById(decoded.empresaId).select('suscripcionActiva accesoBloqueado').lean();
            if (!empresa)
                return res.status(401).json({ error: 'Empresa no encontrada' });
            if (empresa.accesoBloqueado)
                return res.status(403).json({ error: 'Acceso bloqueado por el administrador' });
            if (!empresa.suscripcionActiva)
                return res.status(403).json({ error: 'Suscripción inactiva. Renueva tu plan para continuar.' });
        }
        catch (err) {
            console.error('verificarToken DB error:', err);
            // DB error — allow request through rather than blocking all traffic
        }
    }
    next();
}
function verificarRol(rolesPermitidos) {
    return (req, res, next) => {
        if (!rolesPermitidos.includes(req.usuario?.rol)) {
            return res.status(403).json({ error: 'No tienes permiso' });
        }
        next();
    };
}
//# sourceMappingURL=auth.controller.js.map