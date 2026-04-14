# CHANGELOG — dashboard

## [2026-04-14] — Checkboxes colaborativos con tiempo real (SSE)
**Motivo:** Carlos necesitaba poder marcar tareas completadas desde cualquier dispositivo (PC, tablet, celular) con actualización inmediata en todos ellos.
**Cambios:**
- `server.js` — `tasks-state.json` para persistencia, SSE en `/api/events`, toggle en `POST /api/toggle`, estado en `GET /api/tasks-state`
- `server.js` — campo `id` en cada item de `PENDIENTES` para identificación estable
- `public/index.html` — checkboxes en Pendientes e Hilos abiertos con badge de quién marcó (Carlos/CC) + fecha/hora
- `public/index.html` — dialog inline "¿Quién completa esto?" al hacer click
- `public/index.html` — items completados: texto tachado + bajan al final + badge con nombre y timestamp
- `public/index.html` — re-render en tiempo real via SSE (sin polling, sin refresh)
**CC puede marcar desde terminal:** `curl -X POST http://localhost:4600/api/toggle -H "Content-Type: application/json" -d '{"tipo":"pendientes","id":"<id>","quien":"CC"}'`
**Impacto:** Dashboard es ahora colaborativo y reactivo entre todos los dispositivos de Carlos.

## [2026-04-14] — Hilos abiertos + Backlog de tareas
**Motivo:** Carlos necesitaba visibilidad de trabajos en proceso que no tienen cierre formal y del estado del backlog por categoría.
**Cambios:**
- `server.js` — función `parseHilosAbiertos()` + endpoint `/api/hilos` (parsea `deseimp/hilos-abiertos.md` en tiempo real)
- `server.js` — función `parseTareas()` + `clasificarEstado()` + endpoint `/api/tareas` (parsea `deseimp/backlog.md` en tiempo real)
- `public/index.html` — sección "Hilos abiertos" como primera sección (tarjetas con color por estado, al inicio del dashboard)
- `public/index.html` — sección "Backlog de tareas" con resumen numérico (5 contadores) + grupos colapsables (Abiertas/En espera/Completadas/Canceladas) con pills por tarea
**Impacto:** Dashboard ahora es panel de control operativo. Ambas secciones leen archivos MD en tiempo real — se actualizan solas al editar `hilos-abiertos.md` y `backlog.md`.

## [2026-04-12] — Baja Mardur del ecosistema
**Motivo:** Cliente contrató otro proveedor para su sitio web.
**Cambios:** `server.js` — eliminada entrada mardur de PROYECTOS y de PENDIENTES.
**Impacto:** Mardur ya no aparece en estadísticas ni pendientes del dashboard.

## [2026-04-04] — Agregar zya-soporte al ecosistema
**Motivo:** Nuevo proyecto zya-soporte incorporado al ecosistema ZYA.
**Cambios:** `server.js` — entrada zya-soporte (soporte.zyaeti.mx, puerto 5439, React+Express+SQLite) en array PROYECTOS.
**Impacto:** Dashboard ya muestra el nuevo servicio en estadísticas.

## [1.0.0] — 2026-04-03 — Creación del proyecto
**Motivo:** Dashboard de estadísticas del ecosistema ZYA. Estadísticas reales, estado de sincronización git, pendientes verificados.
**Archivos:** server.js, public/index.html, CLAUDE.md, ESTADO.md, package.json
**Impacto:** Nuevo servicio. Puerto 4600. dashboard.zyaeti.mx
