# AguaFix API

API de práctica para reportar fugas de agua en la vía pública.

## Avance: paso 4

- NestJS 11 con TypeScript y validación global para los futuros DTOs.
- Variables de entorno con dotenv y env-var en `src/config/envs.ts`.
- PostgreSQL con TypeORM, `synchronize: false` y migraciones explícitas.
- Entidades `Report` y `User`, y migración para crear sus tablas.
- Registro y login con DTOs, bcryptjs y flujo controller → service → repository.
- Creación y listado de reportes con aviso SMTP mediante nodemailer.

## Preparar la base de datos

Requiere Node.js 20 o superior, npm y PostgreSQL en ejecución.
En pgAdmin o psql, ejecuta una sola vez:

```sql
CREATE DATABASE aguafix;
```

Instala las dependencias y copia el ejemplo si todavía no tienes `.env`:

```powershell
npm.cmd install
Copy-Item .env.example .env
```

Si ya tienes `.env`, agrega las variables que falten sin sobrescribirlo.
Configura `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` y `DB_NAME`
con los datos de tu instalación. `change_me` es un ejemplo, no una contraseña
configurada en PostgreSQL. `DB_PASSWORD` es obligatoria.

## Crear tablas y ejecutar

```powershell
npm.cmd run migration:run
npm.cmd run start:dev
```

La migración crea `SYSTEM_USER` y `WATER_REPORT`. TypeORM registra las
migraciones aplicadas; ejecutar de nuevo `migration:run` no recrea las tablas.
El servidor necesita PostgreSQL disponible para arrancar. Las migraciones
no se aplican automáticamente al iniciar la API.

El servidor escucha en el puerto 3000. Los endpoints disponibles están
en `/auth` y `/reports`; una respuesta 404 en `/` es esperada.

Otros comandos:

```powershell
npm.cmd run build
npm.cmd run start:prod
npm.cmd run migration:show
```

Para deshacer la última migración en tu base de práctica:

```powershell
npm.cmd run migration:revert
```

Revertir esta migración elimina ambas tablas y sus datos.

## Entidades

`Report` tiene id serial, dirección, descripción, severidad, teléfono,
estado de resolución (false por defecto) y fecha de creación automática.
Una restricción SQL permite únicamente `low`, `medium` o `high` en severidad.

`User` tiene id serial, nombre, email único, contraseña y notificaciones
habilitadas por defecto. La contraseña se guarda como hash bcryptjs
y no se devuelve en las respuestas.

## Probar registro y login

En Postman, usa Body → raw → JSON y `Content-Type: application/json`.

`POST http://localhost:3000/auth/register`:

```json
{
  "name": "Ana Pérez",
  "email": "ana@example.com",
  "password": "Practica123!",
  "isNotificationEnabled": true
}
```

Devuelve 201 con los datos del usuario, sin contraseña. El nombre no puede
estar vacío y la contraseña debe tener al menos 8 caracteres y como máximo
72 bytes (límite de bcrypt). `isNotificationEnabled` es opcional y por defecto
es true. El email se normaliza a minúsculas y sin espacios en los extremos.
Un correo duplicado devuelve 409.

`POST http://localhost:3000/auth/login`:

```json
{
  "email": "ana@example.com",
  "password": "Practica123!"
}
```

Devuelve 200 con un mensaje y los datos del usuario. Credenciales incorrectas
devuelven 400 con `Correo o contraseña incorrectos.`. Este paso solo valida
credenciales: no emite tokens ni crea sesiones.

Para verificar el flujo automáticamente con PostgreSQL disponible y las
migraciones aplicadas:

```powershell
npm.cmd run build
node scripts/check-auth.cjs
```

La prueba inicia la API en un puerto libre, crea un usuario temporal y lo
elimina al finalizar. Comprueba hash, registro, login, duplicados y validación.

## Configurar el correo

Agrega a `.env` las variables SMTP de `.env.example`. Los valores de ejemplo
apuntan a un servidor de correo de prueba local en el puerto 1025: no envían
correo a una bandeja real y requieren un servidor SMTP local en ejecución.

Para enviar a la cuadrilla, configura los datos de tu proveedor:

```dotenv
SMTP_HOST=smtp.tu-proveedor.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_usuario_smtp
SMTP_PASSWORD=tu_clave_smtp
SMTP_FROM=avisos@tu-dominio.com
MAINTENANCE_EMAIL=cuadrilla@tu-dominio.com
```

Los valores anteriores son ejemplos. Usa `SMTP_SECURE=true` para conexiones
TLS desde el inicio (habitualmente puerto 465). En el puerto 587 se usa
`false` y nodemailer negocia STARTTLS cuando el servidor lo ofrece.
Reinicia la API después de cambiar `.env`.

El destinatario es `MAINTENANCE_EMAIL`. Los ciudadanos que se registran no se
convierten en destinatarios de los avisos; `isNotificationEnabled` se conserva
como atributo del usuario para esta práctica.

## Probar reportes

`POST http://localhost:3000/reports`, con Body → raw → JSON:

```json
{
  "address": "Av. Central 123, frente al parque",
  "description": "Sale agua de una grieta en la banqueta",
  "severity": "high",
  "reporterPhone": "5551234567"
}
```

Devuelve 201 con el reporte guardado, incluyendo `id`, `isResolved: false`
y `createdAt`. El controller primero guarda y luego envía el correo. La
severidad admite `low`, `medium` o `high`; todos los campos son obligatorios.
La plantilla HTML escapa el texto del ciudadano para que se muestre como texto.

`GET http://localhost:3000/reports` devuelve un arreglo con todos los reportes,
del más reciente al más antiguo. No requiere body ni parámetros.

Si falla SMTP, devuelve 503 con `reportId` y un mensaje indicando que el
reporte ya se guardó. No repitas el POST: crearías otro reporte. No hay reenvío
automático en esta implementación sencilla. Una respuesta exitosa indica
que el servidor SMTP aceptó el correo, no garantiza su llegada a la bandeja.

Para comprobar el flujo sin enviar correos reales:

```powershell
npm.cmd run build
node scripts/check-reports.cjs
```

La prueba usa PostgreSQL y levanta un SMTP local temporal en un puerto libre.
Comprueba persistencia, listado, validación, contenido del correo y fallo SMTP.
Elimina únicamente sus reportes de prueba y cierra los servidores al terminar.

## Próximos pasos

1. Configurar y comprobar la entrega con tu proveedor de correo.
2. Preparar el repositorio para entregar y grabar el video del flujo completo.

Los cuatro endpoints están implementados. Quedan la entrega del repositorio
y el video; la prueba automática de correo utiliza SMTP local.
