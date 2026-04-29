#!/bin/bash

# 🚀 Script de Configuración Rápida - Porcine SaaS
# Este script te ayuda a configurar las variables de entorno

echo "🐷 Configuración Rápida - Porcine SaaS"
echo "======================================"
echo ""

# Verificar si estamos en el directorio correcto
if [ ! -f "backend/.env.example" ]; then
    echo "❌ Error: Ejecuta este script desde la raíz del proyecto"
    echo "Ejemplo: ./setup-env.sh"
    exit 1
fi

# Backend
echo "📝 CONFIGURACIÓN DEL BACKEND"
echo "======================================"
echo ""
echo "1️⃣  Google OAuth"
echo "   - Ve a: https://console.cloud.google.com/"
echo "   - Copia GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET"
read -p "   Ingresa GOOGLE_CLIENT_ID: " GOOGLE_CLIENT_ID
read -p "   Ingresa GOOGLE_CLIENT_SECRET: " GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI=\"http://localhost:3001/api/auth/google/callback\"

echo ""
echo "2️⃣  Gmail SMTP (para emails de recuperación)"
echo "   - Ve a: https://myaccount.google.com/apppasswords"
echo "   - Crea una contraseña de aplicación"
echo "   - Copia el email y la contraseña"
read -p "   Ingresa tu email de Gmail: " SMTP_USER
read -sp "   Ingresa contraseña de aplicación Gmail: " SMTP_PASS
echo ""

echo ""
echo "3️⃣  JWT Secret (clave aleatoria para tokens)"
JWT_SECRET=$(openssl rand -base64 32)
echo "   ✅ Generado automáticamente: ${JWT_SECRET:0:20}..."

# Crear .env en backend
cat > backend/.env << EOF
# MongoDB
MONGODB_URI=mongodb://localhost:27017/porcine-saas
NODE_ENV=development

# JWT
JWT_SECRET=$JWT_SECRET

# Puerto
PORT=3001

# CORS
FRONTEND_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI=$GOOGLE_REDIRECT_URI

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=$SMTP_USER
SMTP_PASS=$SMTP_PASS
EOF

echo "✅ .env del backend creado en: backend/.env"

# Frontend
echo ""
echo "📝 CONFIGURACIÓN DEL FRONTEND"
echo "======================================"

cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF

echo "✅ .env.local del frontend creado en: frontend/.env.local"

echo ""
echo "======================================"
echo "✅ CONFIGURACIÓN COMPLETADA"
echo "======================================"
echo ""
echo "Próximos pasos:"
echo "1. npm run dev (backend)"
echo "2. npm run dev (frontend en otra terminal)"
echo "3. Abre: http://localhost:3000"
echo ""
echo "🧪 Prueba:"
echo "- Click en 'Continuar con Google'"
echo "- Completa: Empresa y Ubicación"
echo ""
