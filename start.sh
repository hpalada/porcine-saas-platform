#!/bin/bash
# Inicia backend (3001) y frontend (3000) juntos.
# Uso: ./start.sh

set -e
HERE="$(cd "$(dirname "$0")" && pwd)"

echo "🐷 Porcine SaaS — iniciando servicios..."
echo ""

# Liberar puertos si están ocupados
lsof -ti:3001 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti:3000 2>/dev/null | xargs kill -9 2>/dev/null || true
sleep 1

# Verificar MongoDB
if ! pgrep -x "mongod" > /dev/null && ! lsof -i:27017 > /dev/null 2>&1; then
  echo "⚠️  MongoDB no parece estar corriendo en :27017"
  echo "   Inicia MongoDB primero: brew services start mongodb-community"
  echo ""
fi

# Backend
echo "▶️  Backend en http://localhost:3001"
(cd "$HERE/backend" && npm run dev) &
BACK_PID=$!

# Esperar a que el backend esté listo
echo "   Esperando backend..."
for i in {1..30}; do
  if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "   ✅ Backend listo"
    break
  fi
  sleep 1
done

# Frontend
echo "▶️  Frontend en http://localhost:3000"
(cd "$HERE/frontend" && npm run dev) &
FRONT_PID=$!

# Cleanup al recibir Ctrl+C
trap "echo ''; echo '🛑 Deteniendo servicios...'; kill $BACK_PID $FRONT_PID 2>/dev/null; exit 0" INT TERM

echo ""
echo "✅ Sistema corriendo"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo ""
echo "Presiona Ctrl+C para detener ambos servicios."

wait
