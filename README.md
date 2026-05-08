# SeriesTracker

PWA móvil-first para iPhone desplegable en VPS. Usa Next.js, Supabase gestionado y OpenAI desde una ruta server-side.

## Ubicación del proyecto

Local:

```bash
/Volumes/SSD MAC/PROYECTOS/SERIES/SeriesTracker
```

VPS:

```bash
/opt/seriestracker
```

## Variables

Copia `.env.example` a `.env` y rellena:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

La clave `OPENAI_API_KEY` solo se usa en el servidor. No llega al navegador.

## Supabase

Usa uno de tus proyectos Supabase existentes. No hace falta crear otro.

El `.env` actual está preparado con las credenciales encontradas en `../K-PANEL/app/.env`.

1. Abre ese proyecto en Supabase.
2. Ejecuta `supabase/migrations/001_initial_schema.sql` en el SQL Editor de Supabase.
3. Registra tu primer usuario desde la app.
4. Hazlo admin con:

```sql
update public.profiles
set is_admin = true
where email = 'TU_EMAIL';
```

## Desarrollo local

```bash
npm install
npm run dev
```

Abre:

```bash
http://localhost:3000
```

## Deploy en VPS

Ruta fija:

```bash
cd /opt
git clone <repo> seriestracker
cd /opt/seriestracker
cp .env.example .env
docker compose up -d --build
```

El contenedor expone la app en el VPS en:

```bash
http://localhost:3001
```

El puerto interno del contenedor sigue siendo `3000`; el puerto público del host es `3001` para no chocar con Dokploy.

Nginx o Caddy puede apuntar el dominio a `localhost:3000`.

HTTPS configurado en el VPS con Traefik/Dokploy:

```bash
https://series.46.202.129.213.nip.io
```

## Funcionalidades

- Login directo con email usando sesiones anónimas de Supabase, sin contraseña y sin enlaces mágicos.
- Lista de series con búsqueda, filtros, plataforma, estado y progreso.
- Añadir serie por OpenAI con preview.
- Modo manual si falla OpenAI.
- Detalle con temporadas y episodios vistos.
- Perfil con estadísticas.
- Panel admin para compartir series con otros usuarios.

## Acceso de usuarios

Cada persona entra con su propio email. La app crea una sesión anónima de Supabase y guarda ese email en `profiles`.

Activa esto en Supabase:

```text
Authentication -> Sign In / Providers -> Anonymous sign-ins -> Enabled
```

Para que una persona pueda enviar series a otras, marca su perfil como admin:

```sql
update public.profiles
set is_admin = true
where email = 'TU_EMAIL';
```

## Test rápido

```bash
npm run build
docker compose up -d --build
```

Luego prueba desde Safari iPhone o desde un viewport móvil:

- Registro y login.
- Añadir serie por IA.
- Añadir serie manual.
- Marcar episodios.
- Cambiar plataforma y estado.
- Activar admin por SQL y compartir serie.
