# Luné Beauty — catálogo + pedidos por WhatsApp

Next.js (App Router) + Postgres. Sin logins: el catálogo es público y la dueña edita
productos desde una **URL secreta**.

- `/` landing (quiénes somos, Instagram, WhatsApp, botón *Ver servicios*)
- `/catalogo` búsqueda + filtros + orden + vista cuadrícula/listado + carrito → WhatsApp
- `/<ADMIN_SECRET>` panel de la dueña: productos (con foto desde el celu) **y todos los
  textos de la landing** (nombre, frases, quiénes somos, beneficios, WhatsApp, Instagram)

Cualquier otra ruta da 404, así que la URL del panel no se puede adivinar.

## Deploy en Vercel

1. Importar el repo en Vercel.
2. **Storage → Neon (Postgres) → Connect**. Deja `DATABASE_URL` en el proyecto.
   La tabla `products` se crea sola en la primera visita.
3. (Opcional, para subir fotos desde el celular) **Storage → Blob → Connect**
   (deja `BLOB_READ_WRITE_TOKEN`). Sin esto, en el panel se pega la URL de la imagen.
4. Variables de entorno (ver `.env.example`). El `.env` local **no se sube** (está en
   `.gitignore`), hay que cargarlas a mano en Vercel:
   - `ADMIN_SECRET` — la URL oculta del panel, ej. `panel-lune-2026` → `tusitio.com/panel-lune-2026`
   - `NEXT_PUBLIC_WHATSAPP` y `NEXT_PUBLIC_INSTAGRAM` — sólo valores iniciales; una vez
     guardados desde el panel manda la base de datos.
5. Redeploy.

## Local

```bash
npm install
npm run dev
```

`npm test` corre los chequeos del armado del mensaje de WhatsApp y los totales.

## Dónde tocar cosas

| Qué | Archivo |
| --- | --- |
| Textos de la landing (defaults + campos del panel) | [lib/content.ts](lib/content.ts) |
| Logo | `public/logo.jpg` (y `app/icon.png` para la pestaña) |
| Colores y tipografías | [app/globals.css](app/globals.css) (paleta del logo) + [app/layout.tsx](app/layout.tsx) |
| Estructura de la landing | [app/page.tsx](app/page.tsx) |
| Mensaje de WhatsApp | [lib/wa.js](lib/wa.js) |
| Consultas a la base | [lib/db.ts](lib/db.ts) |

El logo se reemplaza cambiando `public/logo.jpg` (ver [public/LEEME.md](public/LEEME.md)).
Si el archivo no está, la portada dibuja una pestaña vectorial de reemplazo.
