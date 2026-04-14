# CHANGELOG — dashboard

## [2026-04-14i] — feat: modal de detalle en pills del Backlog
**Motivo:** Las pills del Backlog solo mostraban ID y título truncado — no había forma de ver el contenido completo de una tarea sin abrir el .md.
**Cambios:**
- `server.js` — `parseTareas()` extiende cada tarea con campo `cuerpo` (texto completo entre encabezados `## TXX`)
- `public/index.html` — `.tarea-pill` cambia `cursor: default` → `cursor: pointer`
- `public/index.html` — variable global `_tareasCache` almacena las tareas al renderizar
- `public/index.html` — cada pill tiene `onclick="abrirTareaModal(id)"`
- `public/index.html` — modal overlay con header (ID + título), cuerpo scrollable con `renderMarkdown` coloreado
- `public/index.html` — cierre por ✕, click en fondo, o `Escape`
**Impacto:** Click en cualquier pill abre tarjeta con texto completo de la tarea. Sin dependencias externas.

## [2026-04-14h] — feat: vista integrada responsive + secciones colapsables + auto-refresh
**Motivo:** Carlos quiere dashboard como pantalla central sin cambiar de pestaña.
**Cambios:**
- `public/index.html` — Secciones colapsables, auto-refresh OFF/30s/1min/5min con countdown visual
- `public/index.html` — Vista integrada con iframes Monitor+Changelog (lazy-load, botón reload)
- `public/index.html` — Responsive: desktop 2col, tablet 1col/420px, móvil tarjetas con "Abrir ↗"

## [2026-04-14g] — feat: PENDIENTES y stats proyectos dinámicos
**Motivo:** PENDIENTES estaban hardcodeados en server.js y se olvidaban actualizar. Stats de proyectos (líneas, commits) también hardcodeadas y desactualizadas.
**Cambios:**
- `server.js` — array PENDIENTES eliminado → reemplazado por `parsePendientes()` que lee `deseimp/pendientes.md` en cada request
- `server.js` — array PROYECTOS estático eliminado → reemplazado por `calcularProyectos()` con caché 5min: recorre el filesystem real con `git log` + conteo de archivos por extensión + líneas
- `server.js` — nuevo endpoint `GET /api/pendientes` dedicado
- `deseimp/pendientes.md` — archivo fuente de verdad creado con los 7 pendientes actuales
**Impacto:** Stats siempre reales al consultar el dashboard. Pendientes: editar solo el .md, no tocar server.js

## [2026-04-14f] — fix: eliminar pendiente RustDesk (completado)
**Motivo:** RustDesk self-hosted ya estaba COMPLETO (hbbs+hbbr corriendo en Oracle Cloud). El array PENDIENTES_HARDCODED lo seguía mostrando.
**Cambios:**
- `server.js` línea 301 — eliminada entrada `rustdesk-oracle` del array PENDIENTES

## [2026-04-14e] — fix: vista integrada responsive para tablet y móvil
**Motivo:** S10 FE y S25 Ultra necesitan experiencia adecuada a su pantalla.
**Cambios:**
- Tablet (768-1024px): iframe se reduce a 420px de alto, columna única
- Móvil (<768px): iframes ocultos — se muestran tarjetas con botón "Abrir ↗" en nueva pestaña
- CSS limpiado: breakpoint `@media (max-width:1024px)` movido fuera del bloque de iframes

## [2026-04-14d] — feat: vista integrada con iframes (Monitor + Changelog)
**Motivo:** Carlos quiere ver dashboard, monitor y cambios en una sola pantalla sin cambiar de pestaña.
**Cambios:**
- `public/index.html` — Nueva sección colapsable "Vista integrada" con grid 2 columnas (1 col en tablet/móvil)
- `public/index.html` — Iframe Monitor (naranja) + Iframe Changelog (violeta), cada uno con link "↗ abrir" y botón "↺ reload"
- `public/index.html` — Lazy-load: los iframes cargan solo cuando se expande la sección (no desperdicia recursos si está colapsada)
- No fue necesario modificar monitor ni changelog — ninguno tiene `X-Frame-Options: DENY`
**Impacto:** Una sola pantalla para gestión completa del ecosistema.

## [2026-04-14c] — feat: dashboard como guía total + auto-refresh + documentación viva
**Motivo:** Dashboard debe ser la única pantalla de referencia — todos los pendientes, backlog, hilos y documentación viva en un solo lugar. Sesiones múltiples en paralelo requieren auto-actualización.
**Cambios:**
- `server.js` — Fix dominio optica-cha: `opticacha.zyaeti.mx` → `opticascha.com`
- `server.js` — Array PENDIENTES actualizado: 5→8 items. Nuevos: RustDesk Oracle Cloud, Google Search Console (T38/HI-07), Gmail facturas.sanyos (HI-11)
- `server.js` — Fix tipo pendientes: `'código'` → `'codigo'` (consistencia con clases CSS)
- `server.js` — Fecha `actualizado` ahora dinámica (ISO hoy, no hardcodeada)
- `server.js` — Nuevo endpoint `GET /api/docs` — lista 9 archivos .md del ecosistema
- `server.js` — Nuevo endpoint `GET /api/docs/:id` — sirve contenido de un .md (conversaciones truncado a 15k chars)
- `public/index.html` — **Todas las secciones colapsables** con chevron animado; Proyectos y Git sync colapsadas por defecto
- `public/index.html` — **Auto-refresh** en header: OFF / 30s / 1min / 5min. Countdown visual, indicador verde pulsante. Por defecto 1 min
- `public/index.html` — Función `loadDynamic()` separada — recarga hilos, tareas y doc abierto sin recargar la página entera
- `public/index.html` — **Nueva sección "Documentación viva"**: 9 tarjetas por categoría (Operativo, Arquitectura, Memoria, Historial). Click abre visor inline con markdown coloreado (H1 verde, H2 azul, H3 amarillo, checkboxes, bold, code). Toggle al hacer click de nuevo.
- `public/index.html` — Versión bumped a v2.0.0
**Impacto:** Dashboard es ahora la guía total del ecosistema ZYA. Todas las sesiones CC ven el mismo estado actualizado.

## [2026-04-14b] — feat: sección cerrados colapsable en hilos
**Motivo:** Hilos cerrados (ej. HI-06) deben seguir visibles pero separados de los abiertos, en un bloque colapsable.
**Cambios:**
- `server.js`: revertido filtro de cerrados — API devuelve todos los hilos.
- `public/index.html`: `renderHilos()` separa abiertos/cerrados. Badge de abiertos solo cuenta los activos. Bloque `<details>` colapsable con badge verde y flecha animada para los cerrados. Estilo `estado-cerrado` (borde gris, badge gris oscuro).
- `server.js` `parseHilosAbiertos()`: filtro adicional excluye hilos cuyo estado empiece con "CERRADO".

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
