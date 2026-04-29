# 🔐 Configuración de Variables de Entorno - Porcine SaaS

## Backend (.env)

Copia el archivo `.env.example` a `.env` y configura:

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/porcine-saas
NODE_ENV=development

# JWT
JWT_SECRET=tu-clave-secreta-super-segura-aqui

# Puerto
PORT=3001

# CORS Frontend URL
FRONTEND_URL=http://localhost:3000

# 🔓 Google OAuth (Necesario para registro)
GOOGLE_CLIENT_ID=tu-client-id-aqui.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret-aqui
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback

# 📧 SMTP para Emails de Recuperación (Necesario para reset password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña-app-gmail
# Nota: Para Gmail, crea una contraseña de aplicación en https://myaccount.google.com/apppasswords
```

## Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 📌 Pasos para Configurar Google OAuth

### 1. Ir a Google Cloud Console
- https://console.cloud.google.com/

### 2. Crear un nuevo proyecto
- Nombre: "Porcine SaaS"

### 3. Habilitar OAuth 2.0
- Ve a "Credenciales"
- Haz clic en "Crear credenciales" > "ID de cliente OAuth"
- Selecciona "Aplicación web"

### 4. Configurar URIs autorizados
**URIs de redirección autorizados:**
- `http://localhost:3001/api/auth/google/callback` (desarrollo)
- `http://localhost:3000` (desarrollo frontend)
- Tu dominio en producción

### 5. Copiar credenciales
- **Client ID** → `GOOGLE_CLIENT_ID`
- **Client Secret** → `GOOGLE_CLIENT_SECRET`

## 📧 Pasos para Configurar Gmail SMTP

### 1. Habilitar autenticación de dos factores
- https://myaccount.google.com/security

### 2. Crear una contraseña de aplicación
- Ve a "Contraseñas de aplicaciones"
- Selecciona "Correo" y "Windows (u otro)"
- Copia la contraseña generada

### 3. Configurar en .env
```
SMTP_USER=tu-email@gmail.com
SMTP_PASS=contraseña-de-app-generada
```

## ✅ Verificar Configuración

Después de configurar las variables, puedes probar:

```bash
# Terminal backend
npm run dev

# Terminal frontend (en otra pestaña)
npm run dev
```

Luego visita `http://localhost:3000` e intenta:
1. **Registrarte con Google** → Deberías ver la página de "Completa tu Perfil"
2. **Solicitar recuperación de contraseña** → Deberías recibir un email con el código PIN

## 🐛 Solución de Problemas

### Email no se envía
- Verifica que `SMTP_USER` y `SMTP_PASS` sean correctos
- Si usas Gmail, asegúrate de haber creado una contraseña de aplicación
- Revisa los logs del backend: `Error enviando email...`

### Google OAuth da error
- Verifica que `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` sean correctos
- Confirma que `GOOGLE_REDIRECT_URI` está registrado en Google Cloud Console
- Revisa que los puertos sean correctos

### "El email ya está registrado"
- Es normal si intentas registrarte con el mismo email. El error es intencional para seguridad.

### MongoDB no conecta
- Asegúrate de que MongoDB está corriendo: `mongod` o `docker run -d -p 27017:27017 mongo:7`
- Verifica que `MONGODB_URI` es correcta
