#!/bin/bash

clear
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║     🐷 PORCINE SAAS - CONFIGURACIÓN RÁPIDA               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo "📊 ESTADO ACTUAL:"
echo "══════════════════════════════════════════════════════════════"
bash diagnostico.sh

echo ""
echo "🎯 PRÓXIMOS PASOS:"
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "1️⃣  CONFIGURAR GMAIL SMTP (para enviar emails PIN)"
echo "   └─ bash config-smtp.sh"
echo ""
echo "2️⃣  INICIA BACKEND (si no está corriendo)"
echo "   └─ cd backend && npm run dev"
echo ""
echo "3️⃣  INICIA FRONTEND"
echo "   └─ cd frontend && npm run dev"
echo ""
echo "4️⃣  PRUEBA EN:"
echo "   └─ http://localhost:3000"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""
