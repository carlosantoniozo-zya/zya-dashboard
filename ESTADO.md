# ESTADO — dashboard

## Estado actual: v2.1.0 — OPERATIVO

**Dominio:** dashboard.zyaeti.mx
**Puerto:** 4600
**Tipo:** local (Node.js + Express)
**Stack:** Node.js + Express + HTML/CSS/JS vanilla

## Sync CC — Cambios recientes
- 2026-04-27: v2.1.0 — Auditoría S12-C: MAILCOW_KEY a .env, feedback widget, favicon, meta description, PORT env var, ruta _zya-about relativa, package.json v2.1.0. (PC)
- 2026-04-14: v2.0.0 — dashboard guía total del ecosistema. Secciones colapsables, auto-refresh, documentación viva, vista integrada iframes, PENDIENTES actualizados. (PC)
- 2026-04-14: v1.1.0 — checkboxes colaborativos SSE, hilos abiertos/cerrados. (PC)
- 2026-04-03: v1.0.0 — creación del proyecto, stats iniciales. (PC)

## Funcionalidades (v2.0.0)
- Stats ecosistema: 31 proyectos, líneas, archivos, servicios activos
- **Hilos abiertos** — parsea `deseimp/hilos-abiertos.md` en tiempo real
- **Backlog de tareas** — parsea `deseimp/backlog.md` en tiempo real
- **Pendientes reales** — acciones puntuales con checkbox colaborativo (SSE, quien/cuando). Dinámicos desde `deseimp/pendientes.md`
- **Documentación viva** — 9 archivos .md del ecosistema con visor inline markdown coloreado
- **Auto-refresh** — OFF/30s/1min/5min, countdown visual, por defecto 1 min
- **Vista integrada** — iframes Monitor + Changelog (lazy-load). Responsive: desktop 2col, tablet 1col, móvil tarjetas con links
- Tabla proyectos del ecosistema
- Estado git sync (PC ↔ NAS ↔ GitHub)
- Todas las secciones colapsables

## Endpoints
- `GET /` — dashboard principal
- `GET /api/health` — health check
- `GET /api/stats` — stats + proyectos + git_sync + pendientes
- `GET /api/tareas` — parseo dinámico backlog.md
- `GET /api/hilos` — parseo dinámico hilos-abiertos.md
- `GET /api/docs` — índice 9 archivos .md
- `GET /api/docs/:id` — contenido de un .md específico
- `GET /api/pendientes` — parseo dinámico pendientes.md
- `GET /api/events` — SSE para estado de checkboxes en tiempo real
- `GET /api/tasks-state` — estado actual de checkboxes (JSON)
- `POST /api/toggle` — marcar/desmarcar pendiente o hilo
- `GET /api/correo` — buzones Mailcow (caché 2min)

## Módulo Correo
- Integración Mailcow vía API: lista de buzones con quota, uso y estado
- MAILCOW_KEY en variable de entorno (.env) — no hardcodeada
- Caché 2 minutos para reducir llamadas a la API
