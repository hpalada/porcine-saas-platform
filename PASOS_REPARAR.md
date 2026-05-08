# 🚀 PASOS PARA ARREGLAR GOOGLE OAUTH Y PIN POR EMAIL

## ⚡ TL;DR (Resumen Rápido)

1. Ejecuta: `bash config-smtp-visual.sh`
2. Reinicia backend: `cd backend && npm run dev`
3. Prueba en: http://localhost:3000

---

## 🔍 ¿POR QUÉ NO FUNCIONA?

```
❌ El PIN no se envía       → SMTP no está configurado
❌ Google OAuth no funciona  → Google está bien, solo falta SMTP
```

**Solución:** Configurar Gmail SMTP para enviar emails

---

## 📋 PASO 1: CONFIGURAR GMAIL SMTP

### Opción A: Automático (Recomendado)

```bash
cd /Users/homerpalada/porcine-saas
bash config-smtp-visual.sh
```

El script te pedirá:
- Tu email de Gmail
- Contraseña de aplicación (de Google)

### Opción B: Manual

**En tu navegador:**

1. Ve a: https://myaccount.google.com/apppasswords
2. Selecciona:
   - App: **Correo**
   - Dispositivo: **Windows** (u otro)
3. Google te dará una contraseña: `abcd efgh ijkl mnop`
4. Cópiala (sin espacios)

**En tu terminal:**

```bash
# Editar backend/.env
nano backend/.env

# O con tu editor favorito
code backend/.env
```

Reemplaza:
```env
# Busca estas líneas:
SMTP_USER=tu@correo.com
SMTP_PASS=contraseña-de-aplicacion

# Y reemplaza con:
SMTP_USER=tu-email@gmail.com
SMTP_PASS=YOUR_GMAIL_APP_PASSWORD
```

---

## 🚀 PASO 2: REINICIAR EL BACKEND

**Importante:** Si el backend estaba corriendo, detenlo primero (Ctrl+C)

```bash
cd /Users/homerpalada/porcine-saas/backend
npm run dev
```

Deberías ver:
```
✅ MongoDB connected successfully
🚀 Server running on http://localhost:3001
📊 Environment: development
```

---

## 🧪 PASO 3: PROBAR

### Test 1: Recuperación de Contraseña (PIN por Email)

1. Abre: http://localhost:3000/login
2. Haz clic en: **"¿Olvidaste tu contraseña?"**
3. Ingresa tu email
4. **Espera 10-30 segundos** (los emails pueden tardar)
5. Revisa tu correo → Deberías recibir un **PIN de 6 dígitos**
6. Ingresa el PIN en la página
7. Cambia tu contraseña
8. Ingresa con la nueva contraseña ✅

### Test 2: Google OAuth

1. Abre: http://localhost:3000/login
2. Haz clic en: **"Continuar con Google"**
3. Inicia sesión con tu cuenta Google
4. Completa:
   - Nombre de Empresa: `Mi Granja Test`
   - Ubicación: `Honduras`
5. Haz clic en: **"Completar Registro"**
6. ✅ Deberías ser redirigido a `/lotes`

---

## ✅ CHECKLIST

Cuando todo esté correcto, deberías tener:

- [ ] SMTP_USER = tu email real (no "tu@correo.com")
- [ ] SMTP_PASS = contraseña de aplicación (16 caracteres)
- [ ] Backend corriendo: `npm run dev`
- [ ] Frontend corriendo: `npm run dev`
- [ ] MongoDB corriendo ✅
- [ ] Google OAuth configurado ✅

---

## 🆘 PROBLEMAS COMUNES

### "No recibo emails"

**Verificar:**
1. ¿Ejecutaste `bash config-smtp-visual.sh`? → Ejecuta de nuevo
2. ¿Reiniciaste el backend? → Para y reinicia: `npm run dev`
3. ¿Usaste contraseña de aplicación? → NO la contraseña normal

**Si aún no funciona:**
```bash
# Ver los logs del backend
cd backend && npm run dev

# Busca líneas como:
# "Error enviando email..."
```

### "Error: Invalid login credentials"

**Solución:**
1. Ve a: https://myaccount.google.com/apppasswords
2. Genera una **NUEVA** contraseña
3. Cópiala exactamente (sin espacios, sin caracteres especiales)
4. Actualiza en `backend/.env`
5. Reinicia el backend

### "Google OAuth da error"

**Causa:** Generalmente SMTP mal configurado

**Solución:** Sigue los pasos anteriores

---

## 📞 RESUMEN FINAL

| Problema | Causa | Solución |
|----------|-------|----------|
| No recibo PIN | SMTP no configurado | `bash config-smtp-visual.sh` |
| Google OAuth no funciona | Generalmente SMTP | Configurar SMTP |
| "Load failed" en frontend | CORS/Backend no corriendo | `npm run dev` en backend |
| "Email inválido" | Placeholder en .env | Reemplazar con email real |

---

## 🎯 ORDEN CORRECTO DE EJECUCIÓN

```bash
# Terminal 1: MongoDB (si no está corriendo)
docker run -d -p 27017:27017 --name porcine-mongodb mongo:7

# Terminal 2: Configurar SMTP
cd /Users/homerpalada/porcine-saas
bash config-smtp-visual.sh

# Terminal 3: Backend
cd backend
npm run dev

# Terminal 4: Frontend
cd frontend
npm run dev

# Terminal 5: Abre tu navegador
open http://localhost:3000
```

---

## 📊 VERIFICACIÓN RÁPIDA

En cualquier momento, ejecuta:

```bash
bash diagnostico.sh
```

Deberías ver:
```
✅ SMTP_USER (Email): CONFIGURADA
✅ SMTP_PASS (Contraseña App): CONFIGURADA
✅ MongoDB está corriendo
```

---

**Estado:** 🚀 **Sigue estos pasos y todo funcionará**

Si tienes dudas, contacta o revisa: [SOLUCION_AUTENTICACION.md](SOLUCION_AUTENTICACION.md)
