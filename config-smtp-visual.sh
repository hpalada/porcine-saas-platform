#!/bin/bash

# 📧 CONFIGURAR GMAIL SMTP - Paso a Paso Visual

clear

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║        📧 CONFIGURAR GMAIL SMTP - PORCINE SAAS            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo "👉 INSTRUCCIONES:"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "PASO 1: Abre tu navegador"
echo "   └─ https://myaccount.google.com/apppasswords"
echo ""
echo "PASO 2: Selecciona:"
echo "   ├─ App: Correo"
echo "   └─ Dispositivo: Windows (u otro)"
echo ""
echo "PASO 3: Google generará una contraseña de 16 caracteres"
echo "   Ejemplo: abcd efgh ijkl mnop"
echo ""
echo "PASO 4: Copia esa contraseña (sin espacios)"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""

read -p "¿Ya tienes la contraseña? (s/n): " READY

if [ "$READY" != "s" ] && [ "$READY" != "S" ]; then
    echo "⏸️  Pausa esta terminal, ve a Google y genera la contraseña"
    echo "   Cuando estés listo, ejecuta de nuevo este script"
    exit 0
fi

echo ""
echo "👤 INGRESA TUS DATOS:"
echo "═══════════════════════════════════════════════════════════"
echo ""

read -p "📧 Email de Gmail: " EMAIL

if [ -z "$EMAIL" ]; then
    echo "❌ Email no puede estar vacío"
    exit 1
fi

read -sp "🔐 Contraseña de aplicación (sin espacios): " PASSWORD
echo ""

if [ -z "$PASSWORD" ]; then
    echo "❌ Contraseña no puede estar vacía"
    exit 1
fi

echo ""
echo "💾 GUARDANDO CONFIGURACIÓN..."
echo "═══════════════════════════════════════════════════════════"

# Función para reemplazar en macOS y Linux
replace_env_value() {
    local file=$1
    local key=$2
    local value=$3
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/^${key}=.*/${key}=${value}/" "$file"
    else
        # Linux
        sed -i "s/^${key}=.*/${key}=${value}/" "$file"
    fi
}

# Actualizar archivo
replace_env_value "backend/.env" "SMTP_USER" "$EMAIL"
replace_env_value "backend/.env" "SMTP_PASS" "$PASSWORD"

echo "✅ CONFIGURACIÓN GUARDADA"
echo ""
echo "📝 Valores actualizados en: backend/.env"
echo "   SMTP_USER=$EMAIL"
echo "   SMTP_PASS=[configurada]"
echo ""

echo "🚀 PRÓXIMOS PASOS:"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "1️⃣  Si el BACKEND estaba corriendo, detenlo (Ctrl+C)"
echo ""
echo "2️⃣  Reinicia el backend:"
echo "   cd /Users/homerpalada/porcine-saas/backend"
echo "   npm run dev"
echo ""
echo "   Deberías ver:"
echo "   ✅ MongoDB connected successfully"
echo "   🚀 Server running on http://localhost:3001"
echo ""
echo "3️⃣  Prueba recuperación de contraseña:"
echo "   ├─ Ve a: http://localhost:3000/login"
echo "   ├─ Click en: '¿Olvidaste tu contraseña?'"
echo "   ├─ Ingresa tu email"
echo "   ├─ Revisa tu correo (puede tardar 10-30 segundos)"
echo "   └─ Deberías recibir un PIN de 6 dígitos"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "✅ ¡LISTO!"
echo ""
