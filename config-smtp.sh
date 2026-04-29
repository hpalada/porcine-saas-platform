#!/bin/bash

# ⚙️ Script de Configuración SMTP - Porcine SaaS

echo ""
echo "📧 CONFIGURACIÓN DE EMAIL (Gmail SMTP)"
echo "======================================"
echo ""
echo "Para enviar emails de recuperación de contraseña, necesitamos:"
echo "✅ Tu email de Gmail"
echo "✅ Una 'Contraseña de Aplicación' (NO tu contraseña normal)"
echo ""
echo "📖 PASOS:"
echo "1. Ve a: https://myaccount.google.com/apppasswords"
echo "2. Selecciona:"
echo "   - App: Correo"
echo "   - Dispositivo: Windows (u otro)"
echo "3. Google generará una contraseña de 16 caracteres"
echo "4. Cópiala aquí abajo"
echo ""

read -p "📧 Ingresa tu email de Gmail: " EMAIL
read -sp "🔐 Ingresa la contraseña de aplicación de Gmail (no se mostrará): " PASSWORD
echo ""

# Actualizar .env
if [ -f "backend/.env" ]; then
    # Usar sed para reemplazar los valores
    sed -i.bak "s/^SMTP_USER=.*/SMTP_USER=$EMAIL/" backend/.env
    sed -i.bak "s/^SMTP_PASS=.*/SMTP_PASS=$PASSWORD/" backend/.env
    
    # Limpiar archivo de backup
    rm -f backend/.env.bak
    
    echo ""
    echo "✅ CONFIGURACIÓN GUARDADA EN: backend/.env"
    echo ""
    echo "📝 Valores guardados:"
    echo "   SMTP_USER: $EMAIL"
    echo "   SMTP_PASS: [configurada]"
    echo ""
    echo "🚀 PRÓXIMOS PASOS:"
    echo "1. Detén el backend si estaba corriendo (Ctrl+C)"
    echo "2. Inicia el backend nuevamente: cd backend && npm run dev"
    echo "3. Prueba en el frontend:"
    echo "   - Click en '¿Olvidaste tu contraseña?'"
    echo "   - Ingresa tu email"
    echo "   - Deberías recibir un PIN de 6 dígitos"
    echo ""
else
    echo "❌ NO SE ENCONTRÓ backend/.env"
    exit 1
fi
