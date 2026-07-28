# CHANGELOG — dashboard

## [2026-07-27] — fix: clasificarEstado() no reconocía "corregido" como completada
**Motivo:** Carlos revisó el conteo de tareas abiertas y detectó (a petición) que T226 y T234 aparecían como pendientes en `/api/tareas` pese a decir "CORS corregido"/"CORREGIDO en código" en su campo Estado — `clasificarEstado()` solo reconocía "completad"/"completo"/"resuelto".
**Cambios:** `server.js` — agregado `corregid` como sinónimo de completada, con guardia `corregidoNegado` (regex `\b(no|sin|tampoco)\s+corregid`) para no marcar como completadas tareas cuyo estado dice "no corregido"/"sin corregir" (existen 2 casos así en backlog.md, líneas 29 y 39).
**Impacto:** Ninguno sobre otros proyectos. Verificado: `pm2 restart dashboard` → `/api/tareas` pasa de 48 a 44 "abiertas" (183 completadas vs 179 antes), T226 y T234 ahora clasifican como `completada`.
**Nota (2026-07-28):** el cambio en `server.js` corría en producción desde el día anterior pero nunca se había commiteado — quedó pendiente hasta esta fecha.

## [2026-07-21] — feat: registrar yosoy en PROYECTOS_DEF
**Motivo:** Alta de proyecto `yosoy` (página personal protegida con PIN) — checklist estándar de alta de proyecto (ESTANDARES-ZYA.md §15), a petición explícita de Carlos.
**Cambios:** `server.js` — nueva entrada en `PROYECTOS_DEF`: `{ nombre: 'yosoy', dir: 'C:/Proyectos/yosoy', dominio: 'yosoy.zyaeti.mx', puerto: 5467, tipo: 'local', stack: 'Express+cookie-parser' }`.
**Impacto:** Ninguno sobre otros proyectos — solo agrega una entrada más a las estadísticas del ecosistema. Verificado post-deploy: `pm2 restart dashboard` → `/api/health` 200 → `yosoy` aparece en `/api/stats`. Nota aparte (no introducida por este cambio): `ultimo_commit`/`rama` reportan "sin-git"/"N/A" para `yosoy` igual que para otros proyectos recientes (`zya-radar`, `comicio360`) — parece un problema preexistente de `getUltimoCommit()`/`getRama()` bajo el proceso PM2 (corre como `NT AUTHORITY\SYSTEM`), no algo roto por esta entrada.

## [2026-07-15] — feat: registrar ZYA Radar en PROYECTOS_DEF
**Motivo:** Cierre de Fase 7 del proyecto nuevo ZYA Radar (monitoreo de redes sociales) — checklist
estándar de alta de proyecto (ESTANDARES-ZYA.md §15).
**Cambios:** `server.js` — nueva entrada en `PROYECTOS_DEF`: `{ nombre: 'zya-radar', dir:
'C:/Proyectos/zya-radar', dominio: 'radar.zyaeti.mx', puerto: 5464, tipo: 'local', stack:
'React+Vite+Express+PG' }`.
**Impacto:** Ninguno sobre otros proyectos — solo agrega una entrada más a las estadísticas del ecosistema.

## [2026-07-12b] — security: fail-closed en requireKey + fix real de DASHBOARD_KEY (T223)
**Archivos:** `server.js`, `.env.example`, `C:\Proyectos\ecosystem.config.js`
**Motivo:** `requireKey` era fail-open (`if (!DASHBOARD_KEY) return next()`). Al investigar se encontró que el fallo era más grave de lo documentado: `server.js` **nunca cargó `dotenv`**, así que el `.env` del proyecto (que sí tenía `DASHBOARD_KEY=zya-dash-2026`) nunca se leía en producción — el proceso PM2 solo recibe variables del objeto `env:{}` de `ecosystem.config.js`, que únicamente definía `MAILCOW_KEY`. Es decir: la protección de T196 (2026-06-25, "auth DASHBOARD_KEY en endpoints sensibles") **nunca estuvo realmente activa en producción** — `process.env.DASHBOARD_KEY` era `undefined` y el fail-open dejaba pasar todo sin auth.
**Cambios:**
- `server.js`: `requireKey` ahora falla cerrado — `process.exit(1)` al arrancar si `DASHBOARD_KEY` no está definida.
- `C:\Proyectos\ecosystem.config.js`: agregado `DASHBOARD_KEY: 'zya-dash-2026'` al objeto `env` del proceso `dashboard` (mismo patrón que `MAILCOW_KEY`) — es la fuente real de variables de entorno para este proceso.
- `.env.example`: agregada `DASHBOARD_KEY=` (faltaba).
**Verificado:** `pm2 restart ecosystem.config.js --only dashboard --update-env`, `/health` OK, `GET /api/docs` sin header → 401, con `x-dashboard-key: zya-dash-2026` → 200.
**Impacto:** Cierra T223. La protección de endpoints sensibles (`/api/docs`, `/api/correo`, `PUT /api/tareas/:id`) ahora sí está activa en producción.

## [2026-07-12] — docs: auditoría ecosistema F3 — documentación al día
**Motivo:** Auditoría transversal de documentación de todo el ecosistema (código↔doc↔backlog).
**Hallazgo relevante:** ESTADO.md seguía documentando como "⚠️ CRÍTICA" la falta de auth en endpoints sensibles (S1238), pese a que T196 (2026-06-25) ya agregó `DASHBOARD_KEY` — confirmado en código (`requireKey` en las 4 rutas afectadas). Verificado también que el middleware es fail-open si la variable falta (nuevo hallazgo, no corregido — ver T223 backlog.md).
**Cambios:**
- `ESTADO.md` — T196 y S1291 (fix clasificarEstado + listDocs dinámico) agregados a Implementado, que faltaban. Deuda técnica actualizada de "sin auth" a "fail-open si falta env var". Fecha actualizada a 2026-07-12.
- `plans/index-planes.md` — S12-A/B agregados a CERRADOS (plan huérfano completado desde 2026-04-27).
- `deseimp/backlog.md` — nueva tarea T223.
**Impacto:** Solo documentación. Sin cambios de código ni deploy requerido.

## [2026-06-27] — fix+feat: clasificarEstado corregido + documentación viva dinámica (S1291)
**Archivos:** `server.js`

**Fix — clasificarEstado():** La función no reconocía "COMPLETADO" como completada — buscaba `completada` o `completo` pero el estado más común en el backlog es `COMPLETADO` (que no coincide con ninguno de los dos). Resultado: ~190 tareas completadas aparecían como "pendientes" y el dashboard mostraba 108 tareas abiertas cuando la realidad era ~20.
- `completad` ahora captura COMPLETADO, COMPLETADA, COMPLETADAS
- Agregado `resuelto` para estados tipo RESUELTO / RESUELTO S1014
- Agregado `en curso` como sinónimo de 'en-proceso'

**Feat — listDocs() dinámica:** El array `DOCS` estaba hardcodeado con 9 entradas y no incluía archivos nuevos como `auditorias.md`, `control-auditorias.md`, `FLUJO-PRODUCCION.md`, etc. Reemplazado por:
- `listDocs()`: escanea `deseimp/` con `fs.readdirSync` — cualquier `.md` nuevo aparece automáticamente sin tocar el servidor
- `DOC_META`: mapa de label legible + categoría para archivos conocidos (fallback: kebab-case → Title Case + categoría 'otros')
- `DOC_OMITIR`: set de archivos a excluir (`conversaciones-historico` — demasiado largo)
- `conversaciones/decisiones.md` y `MEMORY.md` se agregan explícitamente por estar fuera del directorio escaneado
- El endpoint `/api/docs/:id` ya no trunca solo por id sino por tamaño (>15000 chars), más general

**Impacto:** Dashboard muestra el conteo correcto de tareas abiertas. Sección Documentación viva pasa de 9 a 21 archivos (todos los .md de deseimp/) y se actualiza sola cuando se agregan archivos nuevos.

---

## [2026-06-25] — security: T196 — auth en endpoints sensibles (S1282)
**Archivos:** `server.js`, `public/index.html`, `.env`
**Endpoints protegidos:** `GET /api/docs`, `GET /api/docs/:id`, `GET /api/correo`, `PUT /api/tareas/:id`
**Mecanismo:** `DASHBOARD_KEY` en `.env` (`zya-dash-2026`); middleware `requireKey` verifica header `x-dashboard-key`. Frontend: `getDKey()` lee de `localStorage.dbk` (prompt en primer acceso), `authHdr()` inyecta el header en los 4 fetch afectados.

## [2026-06-17] — docs: auditoría AHCD+ACAL+AREV+AAP+AMON+ACOD (S1238)
**Hallazgos:**
- Health ✅, zya-about.js ✅, feedback widget ✅, CHANGELOG ✅, PM2 ✅, Monitor ✅
- CRÍTICA ASEG: sin auth en dashboard.zyaeti.mx — /api/docs/:id expone MEMORY.md/conversaciones.md, /api/correo puede exponer passwords, PUT /api/tareas/:id escribe backlog sin auth. Documentado en ESTADO.md. Requiere decisión arquitectural de Carlos.
- AHCD BAJA: rutas C:/Proyectos/deseimp/ hardcodeadas — aceptable para herramienta PC-específica
**Cambios:** Solo ESTADO.md y CHANGELOG.md (documentación).

## [2026-06-17] — chore: registrar unipay y conta-ia en PROYECTOS_DEF (S1228)
**Archivos:** `server.js`
- Nuevos proyectos: unipay (5454) y conta-ia (5456) con stack React+Vite+Express+PG
**Impacto:** Aparecen en dashboard con stats de código y git

---

## [2026-06-08] — chore: renombrar zya-markdown→markdown, zyapress→press; agregar check (S1197)
**Archivos:** `server.js`
- PROYECTOS_DEF: actualizar dir de markdown (antes zya-markdown), dir de press (antes zyapress)
- Agregar check (puerto 5452, check.zyaeti.mx)

---

## [2026-05-21] — feat: registrar zya-navigator en PROYECTOS_DEF
**Archivos:** `server.js`
**Motivo:** S993 — proyecto zya-navigator creado. Agregado a PROYECTOS_DEF para stats del dashboard.
**Impacto:** Retrocompatible.

## [2026-05-13] — feat: registrar zya-consolidate en PROYECTOS_DEF
**Archivos:** `server.js`
**Motivo:** Auditoría ZYA AAP — zya-consolidate no estaba en el dashboard.
**Cambio:** Entrada en PROYECTOS_DEF. consolidate.zyaeti.mx · puerto 5449 · React+Vite+Express+PG.

## [2026-05-02] — feat: GIT_SYNC dinámico real (S631)
**Archivos:** `server.js`, `public/index.html`
**Motivo:** GIT_SYNC era un array hardcodeado siempre en verde — no reflejaba el estado real.
**Cambios:** `calcularGitSync()` ejecuta `git status --porcelain` + `git log @{upstream}..HEAD` para cada proyecto NAS. Caché 2 min. NAS = `null` (no verificable sin SSH) → píldora gris "unknown" en UI. Descubrimiento inmediato: byrsa tiene cambios sin pushear en PC.
**Impacto:** La sección Git Sync del dashboard ahora muestra el estado real de la copia PC.

## [2026-05-02] — fix+feat: zya-launcher en PROYECTOS_DEF + bug esCerrado con emojis (S631)
**Archivos:** `server.js`, `public/index.html`
**Motivo:** zya-launcher (5447) no aparecía en el panel de proyectos. Bug: hilos con estado `✅ COMPLETADO` aparecían como activos porque el emoji bloqueaba el `startsWith('completo')`.
**Cambios:** Entrada `zya-launcher` en `PROYECTOS_DEF`. `esCerrado()` ahora strip caracteres no-palabra al inicio antes de comparar — HI-67 y futuros hilos con ✅ van correctamente a la sección CERRADOS.
**Impacto:** Panel de proyectos muestra los 32 proyectos del ecosistema. Sección Hilos correcta.

## [2026-05-01] — fix: sección buzones rota en producción
**Archivos:** `C:/Proyectos/ecosystem.config.js`, `correo-buzones.json`
**Motivo:** `/api/correo` devolvía `Invalid value "undefined" for header "X-API-Key"`. El proceso PM2 `dashboard` no tenía `MAILCOW_KEY` en su entorno (la auditoría S12 movió la key a env var pero no se agregó al ecosystem).
**Cambios:** Bloque `dashboard` en ecosystem.config.js gana `env: { MAILCOW_KEY: ... }`. `pm2 delete dashboard && pm2 start ecosystem --only dashboard && pm2 save`. Adicional: `correo-buzones.json` corregido — facturas@sanyos.mx tenía pwd stale `SanyosFacturas2026!`; la real (verificada con cfdi-ingestor IMAP en producción) es `F4cturas0psNAS!`.
**Impacto:** Sección Correo del dashboard vuelve a listar los 4 buzones con contraseñas correctas.

## [2026-04-27] — fix: auditoría S12-C — 12 correcciones aplicadas
**Archivos:** `server.js`, `public/index.html`, `.env.example`, `ESTADO.md`, `plans/auditoria-S12-B.md`, `memory/project_dashboard.md`
**Motivo:** Auditoría S12 — correcciones de hardcoding, documentación y calidad.
**Cambios:** MAILCOW_KEY a env var (.env), MAILCOW_API con fallback env var, PORT a env var, feedback widget agregado, favicon y meta description en HTML, ruta _zya-about relativa, .env.example creado, ESTADO.md actualizado (31 proyectos + módulo Correo), package.json v2.1.0, catch{} con comentario explicativo, memory file creado.
**Impacto:** Retrocompatible — ningún cambio funcional. Health OK dashboard.zyaeti.mx.

## [2026-04-26] — feat: registrar zya-auth y zya-suite en PROYECTOS_DEF
**Archivos:** `server.js`
**Motivo:** Alta de ZYA Auth (5445) y ZYA Suite (5446) en el panel (auditoría S02).

## [2026-04-24] — chore: registrar zya-markdown en PROYECTOS_DEF
**Archivos:** `server.js`
**Motivo:** Alta del nuevo servicio ZYA Markdown en el ecosistema.
**Cambios:** Entrada `zya-markdown` en PROYECTOS_DEF (dominio markdown.zyaeti.mx, puerto 5444).
**Impacto:** Retrocompatible.

## [2026-04-21-b] — feat: contraseñas de buzones en sección Correo
**Archivos:** `server.js`, `public/index.html`, `.gitignore`, `correo-buzones.json` (local, no en git)
**Motivo:** Carlos necesitaba ver las contraseñas de los buzones sin tener que recordarlas.
**Cambios:** `correo-buzones.json` almacena localmente username→contraseña (fuera de git). Endpoint `/api/correo` mezcla datos Mailcow con contraseñas. Dashboard muestra columna Contraseña con botón 👁 para revelar/ocultar.
**Impacto:** Contraseñas visibles solo en Dashboard local (no viajan a git ni GitHub).

## [2026-04-21] — feat: sección Correo con buzones Mailcow
**Archivos:** `server.js`, `public/index.html`
**Motivo:** Carlos necesitaba una lista de buzones con todos sus datos en el Dashboard.
**Cambios:** Nuevo endpoint `/api/correo` que consulta Mailcow API (caché 2 min). Sección "Correo" en el Dashboard con tabla: buzón, nombre, dominio, estado, mensajes, quota, último SMTP/IMAP, fecha creación.
**Impacto:** Los buzones de zyaeti.mx y sanyos.mx son visibles en tiempo real desde el Dashboard.

## [2026-04-20-b] — chore: baja COIMPRIT B2B del ecosistema
**Archivos:** `server.js`
**Motivo:** Cliente canceló proyecto.
**Cambios:** Eliminada entrada coimprit-b2b de PROYECTOS_DEF.
**Impacto:** Dashboard deja de mostrar stats de coimprit-b2b.

## [2026-04-20] — docs: auditoría sincronización — dashboard se auto-reporta, stacks corregidos

**Motivo:** Auditoría de sincronización globales/individuales/código detectó que el dashboard no estaba en su propio PROYECTOS_DEF y que los stacks de sanyos-ops y byrsa eran genéricos.

**Cambios:**
- `server.js` — `PROYECTOS_DEF`: agrega entrada del propio dashboard (puerto 4600, dashboard.zyaeti.mx) para auto-reporte de stats.
- `server.js` — `PROYECTOS_DEF`: corrige stack de sanyos-ops y byrsa a `React+Express+SQLite` (confirmado en package.json de cada proyecto).

**Impacto:** Dashboard ahora incluye sus propias stats en la vista de proyectos.

---

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
