import nodemailer from 'nodemailer';

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    family: 4,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendPinReset(email: string, pin: string, nombre: string) {
  try {
    await getTransporter().sendMail({
      from: `"Classified Cloud" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Código de recuperación de contraseña - Classified Cloud',
    html: `
      <div style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">Classified Cloud</h1>
          <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Gestión Empresarial Inteligente</p>
        </div>

        <!-- Content -->
        <div style="background: #f8f9fa; padding: 40px 30px; border-radius: 0 0 12px 12px;">
          <p style="margin: 0 0 20px 0; color: #333; font-size: 16px;">
            Hola <strong>${nombre}</strong>,
          </p>

          <p style="margin: 0 0 24px 0; color: #666; font-size: 15px; line-height: 1.6;">
            Recibimos una solicitud para restablecer tu contraseña. Usa el código de abajo para completar el proceso.
          </p>

          <!-- PIN Box -->
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

          <!-- Security Info -->
          <div style="background: #f0f4ff; border-left: 4px solid #667eea; padding: 16px; border-radius: 4px; margin: 24px 0;">
            <p style="margin: 0; color: #555; font-size: 12px; line-height: 1.6;">
              ⚠️ <strong>Seguridad:</strong> Classified Cloud nunca te pedirá tu contraseña por correo. Si recibiste un correo sospechoso, contacta a nuestro equipo de soporte.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px; background: #f8f9fa; border-top: 1px solid #e0e0e0; border-radius: 0 0 12px 12px;">
          <p style="margin: 0 0 8px 0; color: #999; font-size: 12px;">
            © 2026 Classified Cloud. Todos los derechos reservados.
          </p>
          <p style="margin: 0; color: #bbb; font-size: 11px;">
            <a href="https://classified.cloud" style="color: #667eea; text-decoration: none;">classified.cloud</a>
          </p>
        </div>
      </div>
    `,
    });
    console.log(`✅ PIN email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Failed to send PIN email to ${email}:`, error);
    throw error;
  }
}

export async function sendWelcomeEmail(email: string, nombre: string, nombreEmpresa: string) {
  try {
  await getTransporter().sendMail({
    from: `"Classified Cloud" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `¡Bienvenido a Classified Cloud, ${nombre}!`,
    html: `
      <div style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">Classified Cloud</h1>
          <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Gestión Empresarial Inteligente</p>
        </div>

        <!-- Content -->
        <div style="background: #f8f9fa; padding: 40px 30px; border-radius: 0 0 12px 12px;">
          <p style="margin: 0 0 20px 0; color: #333; font-size: 18px; font-weight: 600;">
            ¡Bienvenido, ${nombre}! 🎉
          </p>

          <p style="margin: 0 0 16px 0; color: #666; font-size: 15px; line-height: 1.6;">
            Tu empresa <strong>"${nombreEmpresa}"</strong> ha sido registrada exitosamente en Classified Cloud. Estamos emocionados de tenerte con nosotros.
          </p>

          <p style="margin: 0 0 24px 0; color: #666; font-size: 15px; line-height: 1.6;">
            Ya puedes acceder a tu dashboard y empezar a gestionar tu negocio de forma inteligente.
          </p>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;">
              Ir al Dashboard
            </a>
          </div>

          <p style="margin: 0 0 24px 0; color: #999; font-size: 14px; border-top: 1px solid #e0e0e0; padding-top: 24px;">
            Si tienes alguna pregunta, nuestro equipo de soporte está listo para ayudarte.
          </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px; background: #f8f9fa; border-top: 1px solid #e0e0e0; border-radius: 0 0 12px 12px;">
          <p style="margin: 0 0 8px 0; color: #999; font-size: 12px;">
            © 2026 Classified Cloud. Todos los derechos reservados.
          </p>
          <p style="margin: 0; color: #bbb; font-size: 11px;">
            <a href="https://classified.cloud" style="color: #667eea; text-decoration: none;">classified.cloud</a>
          </p>
        </div>
      </div>
    `,
    });
    console.log(`✅ Welcome email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Failed to send welcome email to ${email}:`, error);
    throw error;
  }
}
