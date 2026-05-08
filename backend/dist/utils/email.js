"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPinReset = sendPinReset;
exports.sendWelcomeEmail = sendWelcomeEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
function getTransporter() {
    return nodemailer_1.default.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
}
const FROM = `"Classified Cloud" <${process.env.SMTP_USER}>`;
async function sendPinReset(email, pin, nombre) {
    try {
        await getTransporter().sendMail({
            from: FROM,
            to: email,
            subject: 'Código de recuperación de contraseña - Classified Cloud',
            html: `
      <div style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">Classified Cloud</h1>
          <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Gestión Empresarial Inteligente</p>
        </div>
        <div style="background: #f8f9fa; padding: 40px 30px; border-radius: 0 0 12px 12px;">
          <p style="margin: 0 0 20px 0; color: #333; font-size: 16px;">
            Hola <strong>${nombre}</strong>,
          </p>
          <p style="margin: 0 0 24px 0; color: #666; font-size: 15px; line-height: 1.6;">
            Recibimos una solicitud para restablecer tu contraseña. Usa el código de abajo para completar el proceso.
          </p>
          <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 30px; text-align: center; margin: 32px 0;">
            <p style="margin: 0 0 12px 0; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Tu código de verificación</p>
            <span style="display: inline-block; font-size: 42px; font-weight: 700; letter-spacing: 8px; color: #667eea; font-family: 'Courier New', monospace;">${pin}</span>
          </div>
          <p style="margin: 0 0 12px 0; color: #999; font-size: 13px;">
            Este código expira en <strong style="color: #333;">15 minutos</strong>
          </p>
          <p style="margin: 0 0 24px 0; color: #666; font-size: 14px; line-height: 1.6;">
            Si no solicitaste este cambio de contraseña, <strong>no compartas este código</strong> y puedes ignorar este mensaje de forma segura.
          </p>
          <div style="background: #f0f4ff; border-left: 4px solid #667eea; padding: 16px; border-radius: 4px; margin: 24px 0;">
            <p style="margin: 0; color: #555; font-size: 12px; line-height: 1.6;">
              ⚠️ <strong>Seguridad:</strong> Classified Cloud nunca te pedirá tu contraseña por correo.
            </p>
          </div>
        </div>
        <div style="text-align: center; padding: 20px; background: #f8f9fa; border-top: 1px solid #e0e0e0;">
          <p style="margin: 0 0 8px 0; color: #999; font-size: 12px;">© 2026 Classified Cloud. Todos los derechos reservados.</p>
        </div>
      </div>
    `,
        });
        console.log(`✅ PIN email sent to ${email}`);
    }
    catch (error) {
        console.error(`❌ Failed to send PIN email to ${email}:`, error);
        throw error;
    }
}
async function sendWelcomeEmail(email, nombre, nombreEmpresa) {
    try {
        await getTransporter().sendMail({
            from: FROM,
            to: email,
            subject: `¡Bienvenido a Classified Cloud, ${nombre}!`,
            html: `
      <div style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 48px 32px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0 0 6px 0; color: white; font-size: 30px; font-weight: 800; letter-spacing: -0.5px;">Classified Cloud</h1>
          <p style="margin: 0; color: rgba(255,255,255,0.85); font-size: 13px; letter-spacing: 0.5px;">GESTIÓN EMPRESARIAL INTELIGENTE</p>
        </div>

        <!-- Body -->
        <div style="background: #ffffff; padding: 40px 32px;">
          <p style="margin: 0 0 8px 0; color: #111; font-size: 22px; font-weight: 700;">¡Bienvenido, ${nombre}! 🎉</p>
          <p style="margin: 0 0 24px 0; color: #555; font-size: 15px; line-height: 1.7;">
            Tu empresa <strong style="color: #333;">"${nombreEmpresa}"</strong> ha sido registrada exitosamente en Classified Cloud.
            Ya tienes acceso completo a tu panel de administración.
          </p>

          <!-- Feature list -->
          <div style="background: #f8f7ff; border-radius: 10px; padding: 24px 28px; margin: 0 0 28px 0;">
            <p style="margin: 0 0 16px 0; color: #444; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;">Lo que puedes hacer desde hoy</p>
            ${[
                ['📦', 'Gestiona tu inventario en tiempo real'],
                ['💰', 'Registra ventas y genera reportes'],
                ['🧾', 'Emite facturas y tickets de venta'],
                ['👥', 'Administra clientes y empleados'],
                ['📊', 'Analiza el rendimiento de tu negocio'],
            ].map(([icon, text]) => `
              <div style="display: flex; align-items: center; margin-bottom: 12px;">
                <span style="font-size: 18px; margin-right: 12px;">${icon}</span>
                <span style="color: #555; font-size: 14px; line-height: 1.4;">${text}</span>
              </div>
            `).join('')}
          </div>

          <!-- CTA -->
          <div style="text-align: center; margin: 32px 0 8px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}"
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; letter-spacing: 0.3px;">
              Ir a mi panel →
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 20px 32px; text-align: center; border-top: 1px solid #eee; border-radius: 0 0 12px 12px;">
          <p style="margin: 0 0 4px 0; color: #aaa; font-size: 12px;">¿Tienes alguna pregunta? Responde este correo y te ayudamos.</p>
          <p style="margin: 0; color: #ccc; font-size: 11px;">© 2026 Classified Cloud · theclassified.hn@gmail.com</p>
        </div>
      </div>
    `,
        });
        console.log(`✅ Welcome email sent to ${email}`);
    }
    catch (error) {
        console.error(`❌ Failed to send welcome email to ${email}:`, error);
        // Don't throw — registration should succeed even if email fails
    }
}
//# sourceMappingURL=email.js.map