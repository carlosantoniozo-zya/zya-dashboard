# CHANGELOG — dashboard

## [2026-04-18] — fix: clasificador estados, hilos duplicados, proyectos faltantes

**Motivo:** Dashboard mostraba T23 y T57 como "Pendientes" en lugar de "En proceso", HI-50 aparecía 4 veces, T42 duplicado en backlog, zya-notificaciones y zya-mail ausentes de la lista de proyectos.

**Cambios:**
- `server.js` — `clasificarEstado()`: verifica inicio del estado antes de buscar en el cuerpo (fix T57 "EN PROGRESO" + "COMPLETAS"). Agrega "en progreso", "en desarrollo", "montado en", "activo" como sinónimos de 'en-proceso'.
- `server.js` — `parseHilosAbiertos()`: resetea hiloActual=null cuando `###` no matchea regex HI-XX (fix duplicados HI-50 por subsecciones P1/P2).
- `server.js` — `PROYECTOS_DEF`: agrega zya-notificaciones (5443) y zya-mail (webmail.zyaeti.mx).
- `deseimp/backlog.md` — Renombra segundo T42 (Omada Controller) a T58 (ID libre).
- `deseimp/hilos-abiertos.md` — HI-05: estado "CAMINO A+B COMPLETOS" → "ESPERANDO — Carlos asigna tarifas" (ahora clasifica correctamente como hilo abierto en espera).

**Resultado:** 50 completadas, 7 abiertas, 1 cancelada, 0 espera. 10 hilos abiertos / 13 cerrados. Sin duplicados.

---

## [2026-04-16b] — feat: sección "Sesiones de hoy" + fix pendientes en auto-refresh

**Motivo:** Carlos reportó que el dashboard no mostraba actividad del día. (1) No había sección que mostrara las sesiones de trabajo del día actual. (2) Pendientes no se recargaban en auto-refresh (bug: solo hilos y tareas se refrescaban en `loadDynamic()`).

**Cambios:**
- `server.js` — `parseSesionesHoy()`: parsea `conversaciones.md` y filtra sesiones de la fecha de hoy, ordenadas de más reciente a más antigua. Endpoint `/api/sesiones-hoy`.
- `public/index.html` — Nueva sección "Sesiones de hoy" antes de "Hilos abiertos": tarjetas con número de sesión, tema, resumen y archivos cambiados.
- `public/index.html` — `loadDynamic()`: ahora también recarga pendientes vía `/api/pendientes` en cada ciclo de auto-refresh.

**Impacto:** El dashboard muestra las sesiones del día actual en tiempo real. Pendientes se sincronizan junto con hilos y tareas en el auto-refresh de 1 min.

---

## [2026-04-16a] — feat: completados pasan a cerrados + edición inline del backlog

**Motivo:** (1) Al marcar un ítem como "realizado", el elemento permanecía visible con tachado en lugar de moverse a la sección de cerrados. (2) Carlos necesitaba pedir a CC que editara backlog.md manualmente para actualizar tareas.

**Cambios:**
- `server.js` — Nuevo endpoint `PUT /api/tareas/:id`: localiza el bloque de la tarea en `deseimp/backlog.md`, actualiza la línea `**Estado:**` y sobreescribe el cuerpo con el contenido enviado desde el cliente.
- `public/index.html` — `renderPendientes()`: separa activos vs completados. Completados se muestran en `<details id="pendientes-completados-wrap">` colapsable al fondo. Badge refleja solo activos.
- `public/index.html` — `renderHilos()`: hilos marcados via checkbox se filtran de `abiertosActivos` y se añaden a `todosCerrados`, apareciendo en el apartado `CERRADOS ▶`.
- `public/index.html` — Modal de tarea: botón `Editar` que activa formulario con dropdown de estado + textarea de cuerpo editable. `Guardar` llama a `PUT /api/tareas/:id` y recarga el backlog en pantalla.

**Impacto:** Los ítems completados desaparecen del listado activo y quedan accesibles en sección colapsable. El backlog es editable directamente desde el dashboard sin intervención de CC.

---

## [2026-04-14n] — docs: sincronizar documentación con código real

**Motivo:** Auditoría detectó CLAUDE.md y ESTADO.md desactualizados respecto al código v2.0.0.

**Cambios:**
- `CLAUDE.md` — Stack: eliminado "datos hardcoded" → dinámicos (git log + filesystem, caché 5 min). Restricciones: "stats manuales/futuro" → ya implementadas. Array PROYECTOS → `PROYECTOS_DEF` + `calcularProyectos()`. Añadida regla: pendientes/hilos/backlog = parseo dinámico de .md
- `ESTADO.md` — Pendientes: "8 fijos" → "dinámicos desde pendientes.md". Endpoints: agregados `/api/pendientes` y `/api/tasks-state` que faltaban
- `public/index.html` — Badge "9 archivos" de Documentación viva: id agregado + actualización dinámica en JS al cargar `/api/docs`

**Impacto:** Sin cambios de comportamiento. Solo documentación alineada con el código.

---

## [2026-04-14m] — revert: eliminar sección verificaciones flotilla del dashboard general

**Motivo:** Información de ops no pertenece al dashboard general del ecosistema.

**Cambios:** Eliminados CSS, HTML, JS (loadVerificaciones) y proxy /api/ops/verificaciones de server.js.

---

## [2026-04-14l] — fix: sección verificaciones abierta por defecto + fecha fin de período

**Motivo:** La sección arrancaba colapsada (invisible). Los períodos con fecha_referencia ahora muestran "ENE-ABR 2026 (fin 2026-04-30)" para claridad.

**Cambios:**
- `public/index.html`: sección verificaciones sin clase `collapsed` (abierta por defecto). Render muestra fecha de referencia calculada junto al período textual.

---

## [2026-04-14k] — feat: sección verificaciones flotilla SANYOS OPS

**Motivo:** Visualizar el estado de verificaciones vehiculares de la flotilla directamente en el dashboard con semáforo por días restantes.

**Cambios:**
- `server.js`: proxy GET `/api/ops/verificaciones` → `https://ops.zyaeti.mx/api/verificaciones-flotilla-alerta`
- `public/index.html`: nueva sección "Verificaciones flotilla — SANYOS OPS" (colapsable, antes de Hilos abiertos). Chips resumen (vencida/crítica/próxima/texto/al día) + tabla semáforo. Se recarga en auto-refresh.

---

## [2026-04-14j] — fix: ventanas de cmd al recargar dashboard (windowsHide)
**Motivo:** Al recargar con Ctrl+Shift+R (caché expirado), `calcularProyectos()` ejecutaba 25 proyectos × 2 `execSync` (git log + git rev-parse) = hasta 50 ventanas de cmd que parpadeaban en pantalla. En Windows, `execSync` sin `windowsHide: true` crea una ventana de consola visible por cada proceso hijo.
**Cambios:**
- `server.js:110` — `getUltimoCommit()`: agregado `windowsHide: true` al `execSync`
- `server.js:121` — `getRama()`: agregado `windowsHide: true` al `execSync`
**Impacto:** Cero ventanas de terminal al recargar el dashboard. Sin cambios de comportamiento.

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
