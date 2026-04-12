# CHANGELOG — dashboard

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
