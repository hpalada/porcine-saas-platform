# 🚀 SOLUCIÓN - Problemas de Google OAuth y PIN por Email

## ❌ Problemas Encontrados

### 1. Emails de PIN no se envían
**Causa:** `SMTP_USER` y `SMTP_PASS` en `.env` tienen valores por defecto

```env
SMTP_USER=tu@correo.com  ← ❌ Placeholder
SMTP_PASS=contraseña-de-aplicacion  ← ❌ Placeholder
```

### 2. (Opcional) Google OAuth si no está funcionando
**Causa:** `GOOGLE_CLIENT_SECRET` podría estar incompleto

---

## ✅ SOLUCIÓN (Sigue estos pasos)

### PASO 1: Configurar Gmail SMTP

#### Opción A: Script Automático (Recomendado)

```bash
cd /Users/homerpalada/porcine-saas
bash config-smtp.sh
```

El script te pedirá:
- Email de Gmail
- Contraseña de aplicación (generada en Google)

#### Opción B: Configuración Manual

**Paso 1:** Ve a https://myaccount.google.com/apppasswords

**Paso 2:** Selecciona:
- App: **Correo**
- Dispositivo: **Windows** (u otro)

**Paso 3:** Google generará una contraseña como: `abcd efgh ijkl mnop`

**Paso 4:** Edita `backend/.env` y reemplaza:

```env
SMTP_USER=tu-email@gmail.com
SMTP_PASS=abcdefghijklmnop
```

### PASO 2: Reiniciar el Backend

Si el backend estaba corriendo, detenlo (Ctrl+C) y reinicia:

```bash
cd /Users/homerpalada/porcine-saas/backend
npm run dev
```

Deberías ver en los logs:
```
✅ Server running on http://localhost:3001
📊 Environment: development
```

### PASO 3: Probar Recuperación de Contraseña

1. Ve a: http://localhost:3000/login
2. Haz clic en: **"¿Olvidaste tu contraseña?"**
3. Ingresa tu email
4. **Revisa tu correo** - Deberías recibir un PIN de 6 dígitos
5. Ingresa el PIN en la página
6. Cambia tu contraseña

---

## 🧪 Probar Google OAuth

1. Ve a: http://localhost:3000/login
2. Haz clic en: **"Continuar con Google"**
3. Inicia sesión con tu cuenta Google
4. Completa: **Nombre de Empresa** y **Ubicación**
5. ✅ Deberías ser redirigido a `/lotes`

---

## 🔧 Verificación Rápida

Ejecuta el diagnóstico nuevamente para confirmar:

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

## ⚠️ Troubleshooting

### No recibo emails

**Problema:** Los logs del backend muestran `Error enviando email...`

**Solución:**
1. Verifica que `SMTP_USER` y `SMTP_PASS` sean correctos
2. Asegúrate de haber creado una **contraseña de aplicación** (no contraseña regular)
3. Si usas otro proveedor (Outlook, etc.), cambia `SMTP_HOST`

### Error: "Invalid login credentials"

**Problema:** La contraseña de aplicación de Gmail es incorrecta

**Solución:**
1. Ve a: https://myaccount.google.com/apppasswords
2. Genera una **nueva** contraseña
3. Cópiala exactamente (sin espacios)
4. Actualiza en `backend/.env`
5. Reinicia el backend

### Google OAuth redirige a login con error

**Problema:** `GOOGLE_CLIENT_ID` o `GOOGLE_CLIENT_SECRET` son incorrectos

**Solución:**
1. Ve a: https://console.cloud.google.com/
2. Verifica las credenciales de OAuth 2.0
3. Copia exactamente los valores (sin espacios)
4. Actualiza en `backend/.env`
5. Reinicia el backend

### "No se puede conectar con el servidor"

**Problema:** El backend no está corriendo

**Solución:**
```bash
cd /Users/homerpalada/porcine-saas/backend
npm run dev
```

Verifica que aparezca:
```
✅ MongoDB connected successfully
🚀 Server running on http://localhost:3001
```

---

## 📋 Resumen de Configuración

```env
# backend/.env debe tener:

# ✅ Estos deberían estar configurados
MONGODB_URI=mongodb://localhost:27017/porcine-saas
GOOGLE_CLIENT_ID=701950577668-...
GOOGLE_CLIENT_SECRET=GOCSPX-...
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
JWT_SECRET=porcine-saas-super-secret-key-2026
FRONTEND_URL=http://localhost:3000

# ⚠️ Estos DEBES configurar con tus datos reales
SMTP_USER=tu-email@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
```

---

## 🎯 Una Vez Configurado, Deberías Poder:

✅ **Registro con Google**
- Continuar con Google
- Completar Empresa + Ubicación
- Acceder al dashboard

✅ **Recuperación de Contraseña**
- Solicitar PIN por email
- Recibir email con código de 6 dígitos
- Cambiar contraseña
- Ingresar con nueva contraseña

✅ **Registro Tradicional**
- Crear cuenta con email + contraseña
- Ingresar manualmente

---

## 📞 Ayuda Rápida

Ejecuta estos comandos en orden:

```bash
# 1. Ve al directorio del proyecto
cd /Users/homerpalada/porcine-saas

# 2. Configura SMTP (si no lo hiciste)
bash config-smtp.sh

# 3. Verifica configuración
bash diagnostico.sh

# 4. Inicia MongoDB (si no está corriendo)
docker run -d -p 27017:27017 --name porcine-mongodb mongo:7

# 5. Inicia backend
cd backend && npm run dev

# 6. En otra terminal, inicia frontend
cd frontend && npm run dev

# 7. Abre
open http://localhost:3000
```

---

**Estado:** 🚀 Listo para usar después de configurar SMTP
