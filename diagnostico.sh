#!/bin/bash

# 🔍 Script de Diagnóstico - Porcine SaaS
# Verifica qué está configurado y qué falta

echo "🔍 DIAGNÓSTICO - Porcine SaaS"
echo "======================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_env() {
    local var=$1
    local file=$2
    local value=$(grep "^$var=" "$file" | cut -d'=' -f2-)
    
    if [ -z "$value" ]; then
        echo -e "${RED}❌ NO CONFIGURADA${NC}"
        return 1
    elif [[ "$value" == *"tu"* ]] || [[ "$value" == *"contraseña"* ]] || [[ "$value" == *"ejemplo"* ]]; then
        echo -e "${YELLOW}⚠️  PLACEHOLDER: $value${NC}"
        return 1
    else
        echo -e "${GREEN}✅ CONFIGURADA: ${value:0:30}...${NC}"
        return 0
    fi
}

# Verificar backend .env
if [ -f "backend/.env" ]; then
    echo "📋 BACKEND (.env)"
    echo "======================================"
    echo ""
    echo -n "MONGODB_URI: "
    check_env "MONGODB_URI" "backend/.env"
    
    echo -n "GOOGLE_CLIENT_ID: "
    check_env "GOOGLE_CLIENT_ID" "backend/.env"
    
    echo -n "GOOGLE_CLIENT_SECRET: "
    check_env "GOOGLE_CLIENT_SECRET" "backend/.env"
    
    echo -n "GOOGLE_REDIRECT_URI: "
    check_env "GOOGLE_REDIRECT_URI" "backend/.env"
    
    echo -n "SMTP_USER (Email): "
    check_env "SMTP_USER" "backend/.env"
    
    echo -n "SMTP_PASS (Contraseña App): "
    check_env "SMTP_PASS" "backend/.env"
    
    echo -n "JWT_SECRET: "
    check_env "JWT_SECRET" "backend/.env"
    
    echo ""
else
    echo -e "${RED}❌ NO SE ENCONTRÓ backend/.env${NC}"
fi

echo ""

# Verificar frontend .env.local
if [ -f "frontend/.env.local" ]; then
    echo "📋 FRONTEND (.env.local)"
    echo "======================================"
    echo ""
    echo -n "NEXT_PUBLIC_API_URL: "
    check_env "NEXT_PUBLIC_API_URL" "frontend/.env.local"
    echo ""
else
    echo -e "${YELLOW}⚠️  FRONTEND (.env.local) NO ENCONTRADO${NC}"
    echo ""
fi

# Verificar MongoDB
echo "🗄️  MONGODB"
echo "======================================"
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.version()" &> /dev/null; then
        echo -e "${GREEN}✅ MongoDB está corriendo${NC}"
    else
        echo -e "${RED}❌ MongoDB NO está corriendo${NC}"
        echo "   Inicia con: docker run -d -p 27017:27017 --name porcine-mongodb mongo:7"
    fi
else
    echo -e "${YELLOW}⚠️  mongosh no instalado, no se puede verificar${NC}"
fi

echo ""
echo "======================================"
echo "📝 ACCIONES RECOMENDADAS:"
echo "======================================"
echo ""
echo "1. Configura GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET"
echo "   - Ve a: https://console.cloud.google.com/"
echo "   - Copia las credenciales en backend/.env"
echo ""
echo "2. Configura SMTP (Gmail)"
echo "   - Ve a: https://myaccount.google.com/apppasswords"
echo "   - Crea una contraseña de aplicación"
echo "   - Copia email y contraseña en backend/.env"
echo ""
echo "3. Verifica MongoDB"
echo "   - Si no está corriendo: docker run -d -p 27017:27017 mongo:7"
echo ""
echo "4. Inicia el backend"
echo "   - cd backend && npm run dev"
echo ""
echo "5. Inicia el frontend"
echo "   - cd frontend && npm run dev"
echo ""
