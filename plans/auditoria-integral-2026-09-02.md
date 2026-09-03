# Auditoría integral — dashboard — 2026-09-02 (S1497)

## 1. Ficha
- **Qué es:** panel interno de Carlos: estado de 43 proyectos (`PROYECTOS_DEF`), parseo en vivo de `deseimp/*.md` (backlog, pendientes, hilos, sesiones), documentación viva, buzones Mailcow (API) y bandeja IMAP unificada de 6 buzones (T257).
- **Stack real** (`package.json`): `zya-dashboard` 2.1.0 — Express ^4.18, `imap-simple` ^5.1, `mailparser` ^3.9. Sin BD, sin dotenv (env solo vía `ecosystem.config.js`). Frontend: un solo `public/index.html` de 2,045 líneas, JS vanilla.
- **Host:** PC local, PM2 `dashboard` (SYSTEM), puerto 4600, `dashboard.zyaeti.mx` vía Cloudflare Tunnel (`config.yml:69`).
- **Último commit:** `c14157a` 2026-08-21 "fix: auth autorreparable ante clave DASHBOARD_KEY vieja/incorrecta (T264 pt2)".
- **Actividad:** 15 commits en 90 días (todos correctivos o de alta de proyectos; el único feature fue T257 bandeja el 08-20).

## 2. Estado operativo verificado
| Aspecto | Estado | Evidencia |
|---|---|---|
| HTTP local | ✅ 200 `/` (76 KB HTML) | `curl -I 127.0.0.1:4600/` |
| HTTP público | ✅ 200 `text/html` | `curl https://dashboard.zyaeti.mx/` |
| `/health` | ⚠️ 302 → `/api/health` (no está tras clave). `/api/health` devuelve `{status,version:'1.0.0',uptime}` — falta `service`/`timestamp`, versión no coincide con 2.1.0 | `server.js:272-279` |
| PM2 | ✅ online, uptime 420,487 s (~4.9 días) | `/api/health` |
| Git | ✅ limpio, `master...origin/master` sin ahead/behind | `git status -sb` |
| NAS sync | N/A (PC local) | — |
| Datos reales | 43 proyectos en `/api/stats`, **39 con `ultimo_commit: "sin-git"`** (T260 pendiente); 21 pendientes; tareas parseadas del backlog; `tasks-state.json` con 2 entradas (último uso 2026-04-16) | `curl /api/stats` + `tasks-state.json` |
| Tunnel / Monitor | ✅ hostname en `config.yml:69`; registrado en `zya-monitor/server.js:170` con healthcheck `/api/health` | grep |

## 3. Cumplimiento de auditorías ZYA

### ASEG — Seguridad (evaluada aunque el catálogo diga N/A: expone correo de clientes)
| ID | Ítem | Estado | Evidencia |
|---|---|---|---|
| ASEG-1 | X-Frame-Options | ❌ | `curl -I` solo trae Cache-Control/Pragma/Expires; no hay helmet ni setHeader en `server.js` |
| ASEG-2 | X-Content-Type-Options nosniff | ❌ | ídem |
| ASEG-3 | HSTS | ❌ | ídem (Cloudflare no lo inyecta por defecto) |
| ASEG-4 | Rate limiting en auth/API | ❌ | `grep -i rate server.js` → 0 resultados. `requireKey` (`server.js:16-20`) compara string sin límite de intentos; clave estática `zya-dash-2026` fuerza-bruteable |
| ASEG-5 | `trust proxy` | ❌ | no existe; irrelevante hoy porque no hay rate limit, pero necesario si se agrega |
| ASEG-6 | JWT con expiresIn | N/A | no usa JWT; clave única sin expiración en `localStorage('dbk')` (`index.html:1251-1254`) — nunca caduca |
| ASEG-7 | Rutas privadas con middleware | ❌ | Solo 5 rutas llevan `requireKey` (`PUT /api/tareas/:id`, `/api/docs*`, `/api/correo`, `/api/inbox*`). **Públicas sin clave:** `/api/stats`, `/api/tareas`, `/api/hilos`, `/api/pendientes`, `/api/sesiones-hoy`, `/api/tasks-state`, `/api/events`, `POST /api/toggle` (`server.js:281-338, 383, 468, 566-607`). Verificado: `curl https://dashboard.zyaeti.mx/api/tareas` → 200 |
| ASEG-8 | No exponer secretos en respuestas | ❌ | **(a)** `/api/tareas` público devuelve el cuerpo íntegro de `backlog.md`: `curl` público contiene 2× `<REDACTADO>` (password real de `tiktok@zyaeti.mx`, backlog línea 160), 21× "password", 3× "PASSPHRASE". **(b)** `/api/correo` (`server.js:654`) manda `password` en claro de cada buzón al navegador, y `index.html:1744` la inyecta en `onclick="togglePwd(...,'${b.password}')"`. **(c)** `/api/stats` público expone rutas locales `C:/Proyectos/...`, puertos y estado git de todo el ecosistema |
| ASEG-9 | CORS | ✅ | sin `cors()`, same-origin |
| ASEG-10 | `.env` en .gitignore y fuera del historial | ✅ | `.gitignore` incluye `.env`, `tasks-state.json`, `correo-buzones.json`; `git log --all -- .env` vacío; `git ls-files` no los lista |
| ASEG-11 | Secretos duplicados en 3 sitios | ⚠️ | Las 6 passwords IMAP viven en `.env` (muerto: no hay dotenv), `ecosystem.config.js:24` e `correo-buzones.json` — el desfase ya causó T262 |
| ASEG-12 | TLS IMAP | ⚠️ | `rejectUnauthorized:false` (`server.js:694`) — aceptable solo por ser 127.0.0.1 |

### AHCD — Hardcoding
| ID | Ítem | Estado | Evidencia |
|---|---|---|---|
| AHCD-1 | Puerto vía `process.env.PORT` | ✅ | `server.js:8` |
| AHCD-2 | API keys en código | ✅ | `MAILCOW_KEY`, `DASHBOARD_KEY`, `INBOX_*` vía env |
| AHCD-3 | Rutas absolutas `C:/` | ⚠️ | 43× en `PROYECTOS_DEF` (`server.js:29-71`), `deseimp` (`:211,308,342,441,473,534`), `MEMORY.md` (`:540`). Aceptable por ser herramienta PC-only, pero no portable |
| AHCD-4 | URLs de producción fijas | ⚠️ | `MAILCOW_API` con default `webmail.zyaeti.mx` (`:610`); iframes `monitor.zyaeti.mx`/`cambios.zyaeti.mx` (`index.html:1204,1214`) |
| AHCD-5 | Números mágicos | ✅ | TTLs nombrados (`CACHE_TTL`, `GIT_SYNC_TTL`, `INBOX_TTL`) |

### ACAL — Calidad
| ID | Ítem | Estado | Evidencia |
|---|---|---|---|
| ACAL-1 | `req.body`/params sin validar | ❌ | `PUT /api/tareas/:id` (`server.js:395-437`): `id` va directo a `new RegExp(\`^## ${id} — \`)` (`:408,418`) sin escape — inyección de regex; `cuerpo` sin límite ni sanitización se escribe a `backlog.md` |
| ACAL-2 | Escritura de archivo sin transacción/lock | ⚠️ | `fs.writeFileSync(backlogPath)` (`:435`) reescribe el backlog completo sin lock — si Claude Code está editando el mismo archivo se pierde una de las dos escrituras |
| ACAL-3 | Bloqueo del event loop | ⚠️ | `calcularProyectos()` (`:157-169`) recorre 43 árboles con `readdirSync`+`readFileSync` y 86 `execSync` git en el hilo principal, dentro del request (`:282`). Cada 5 min un request paga segundos de bloqueo |
| ACAL-4 | JSON.parse con try | ✅ | `:240, :622, :632, :673` |
| ACAL-5 | parseInt sin NaN | ✅ | `:8` y `:671` con fallback |
| ACAL-6 | Promesas con catch | ✅ | `Promise.allSettled` (`:746`), try/finally en IMAP (`:702-726, 770-788`) |
| ACAL-7 | `==` | ✅ | no encontrado |
| ACAL-8 | Vulnerabilidades npm | ❌ | `npm audit`: 9 (7 high, 1 moderate, 1 low). Cadena `imap-simple→imap→utf7→semver` (ReDoS) y `mailparser→html-to-text→deepmerge-ts` (stack exhaustion), `qs` DoS. `imap-simple` está sin mantenimiento |

### AREV — Lógica
| ID | Ítem | Estado | Evidencia |
|---|---|---|---|
| AREV-1 | Auth faltante en POST/PUT | ❌ | `POST /api/toggle` (`:584`) escribe `tasks-state.json` sin `requireKey` |
| AREV-2 | Lectura de secretos de terceros | ❌ | `/api/docs/:id` con clave sirve `credenciales.md` (`DOC_META:485`) y `MEMORY.md` (`:540`) — todo el secreto del ecosistema tras una clave de 12 caracteres sin rate limit |
| AREV-3 | Fechas sin TZ | ⚠️ | `parseSesionesHoy` usa `toISOString().slice(0,10)` (`:444`) = UTC; después de las 18:00 CDMX "hoy" salta al día siguiente y la sección queda vacía |
| AREV-4 | Clasificación por keywords | ⚠️ | `clasificarEstado()` (`:370-381`) admite falsos positivos por subcadena (reconocido en CHANGELOG 08-19) |
| AREV-5 | `.catch(()=>{})` silencioso | ⚠️ | `gitCmd` (`:192-193`) y `getUltimoCommit` devuelven `null`/`sin-git` sin log — por eso T260 (dubious ownership) pasó meses invisible |
| AREV-6 | Ruta `zya-consolidate` inexistente | ❌ | `PROYECTOS_DEF:62` apunta a `C:/Proyectos/zya-consolidate`; el repo real es `C:/Proyectos/consolidate` (verificado `ls`). Stats = 0 y "sin-git" permanente |
| AREV-7 | Cron sin guard | N/A | no hay cron |

### AAP — Alta de proyecto
| ID | Ítem | Estado | Evidencia |
|---|---|---|---|
| AAP-1 | CHANGELOG.md | ✅ | 39 KB, última entrada 2026-08-21 = último commit |
| AAP-2 | ESTADO.md 9 secciones | ⚠️ | existe, pero "Última actualización: 2026-07-12" y contiene T257 (08-20); "Pendientes: Ninguno" con T260 y P-S1471 abiertos |
| AAP-3 | CLAUDE.md | ✅ | correcto: puerto, stack, PROYECTOS_DEF |
| AAP-4 | .gitignore | ✅ | node_modules, .env, logs, json de estado |
| AAP-5 | pre-commit hook | ✅ | `.git/hooks/pre-commit` bloquea código sin CHANGELOG |
| AAP-6 | `/health` 200 JSON estándar | ❌ | `/health` es 302; `/api/health` sin `service`/`timestamp`, `version:'1.0.0'` ≠ 2.1.0 (`:272-279`) |
| AAP-7 | No-cache HTML | ⚠️ | Cache-Control/Pragma/Expires OK (`:260-264`) pero falta `Cloudflare-CDN-Cache-Control: no-store` |
| AAP-8 | Registrado en monitor / ECOSISTEMA / tunnel / landing | ✅ | `zya-monitor/server.js:170`, ECOSISTEMA #13, `config.yml:69`, `zya-landing PROYECTOS_MAP` (P15) |
| AAP-9 | zya-about.js + feedback widget | ✅ | `index.html:1984, 2043`; `server.js:791` |
| AAP-10 | README.md | ❌ | ausente (reconocido en ESTADO) |
| AAP-11 | PROYECTOS_DEF vs ECOSISTEMA (45) | ❌ | **Faltan 5:** `armador-expedientes` (5448), `casa-galindo` (5459), `casa-galindo/intranet` (5468), `jod` (5458), `JOD/permisos` (5469). **Sobran 4** no listados como servicios: `_playwright-zya`, `_report-builder`, `_zya-about`, `_zya-theme` (módulos, tipo distinto — aceptable). `luminn-chihami` comparte repo con `luminn` (OK). Ruta `zya-consolidate` rota (AREV-6) |

### AMON — Monitoreo
| ID | Ítem | Estado | Evidencia |
|---|---|---|---|
| AMON-1 | En monitor con URL/healthcheck correctos | ✅ | `zya-monitor/server.js:170,243` → `/api/health` |
| AMON-2 | En `ecosystem.config.js` | ✅ | líneas 13-25, con `exp_backoff_restart_delay` |
| AMON-3 | Logs de error | ⚠️ | ningún `console.error` fuera del arranque; fallos git/IMAP mudos (AREV-5) |
| AMON-4 | Cron documentados | N/A | sin cron |

### ACOD — Coherencia código-doc
| ID | Ítem | Estado | Evidencia |
|---|---|---|---|
| ACOD-1 | CHANGELOG fecha ≥ último commit | ✅ | 08-21 = 08-21 |
| ACOD-2 | ESTADO "Variables de entorno" | ❌ | dice "MAILCOW_KEY en .env" (`ESTADO.md:20,52`) — `server.js` nunca carga dotenv (T223); `.env` es config muerta que induce drift (T262) |
| ACOD-3 | Pendientes en ESTADO ya hechos / abiertos omitidos | ❌ | T260 (39/43 sin-git) y 3 passwords faltantes (P-S1471) no aparecen |
| ACOD-4 | `plans/` | ✅ | `index-planes.md` sin activos, S12 cerrado |
| ACOD-5 | `control-auditorias.md` "ASEG CRÍTICA abierta" | ⚠️ | Se refiere a S1238 (endpoints sin auth). T196 (06-25) la "cerró" pero **nunca estuvo activa** (T223: sin dotenv → fail-open); T223 (07-12) la activó solo para 5 rutas. **Sigue abierta de facto** por ASEG-7/8: el backlog con passwords sigue público |
| ACOD-6 | `conversaciones/dashboard.md` | ❌ | última entrada 2026-04-04; `conversaciones.md` tiene 53 menciones posteriores |

### AMET
| ID | Ítem | Estado | Evidencia |
|---|---|---|---|
| AMET-1 | title/description/lang/favicon | ✅ | `index.html:2,9,10`; favicon regenerado T199 |
| AMET-2 | `.env.example` al día | ✅ | 7 variables, coincide con lo usado |
| AMET-3 | robots.txt | ✅ | `public/robots.txt` |

**ASI** N/A (PC local, sin NAS). **ASEO** N/A (herramienta privada).

## 4. Hallazgos de código
1. **Alta** — Password real de buzón expuesta públicamente sin autenticación: `GET /api/tareas` (`server.js:383-393`, sin `requireKey`) sirve el cuerpo completo de `deseimp/backlog.md`, que en T262 (línea 160) documenta `<REDACTADO>`. Verificado con `curl` público (2 coincidencias). Impacto: cualquiera en Internet lee ese buzón; además 21 menciones de "password" y 3 "PASSPHRASE" en otras tareas. Recomendación: `requireKey` en todas las rutas `/api/*` excepto `/api/health`, y purgar la password del backlog.
2. **Alta** — `/api/correo` devuelve passwords de todos los buzones Mailcow en claro (`server.js:654`) e `index.html:1744` las incrusta en un atributo `onclick` sin escapar. Una clave estática de 12 caracteres, sin rate limit, protege el correo de Sanyos, Casa Galindo y ZYA. Recomendación: eliminar el campo `password` de la respuesta (o servirlo solo bajo un segundo endpoint con confirmación) y agregar `express-rate-limit` a `requireKey`.
3. **Alta** — Superficie pública amplia: `/api/stats`, `/api/hilos`, `/api/pendientes`, `/api/sesiones-hoy`, `/api/tasks-state`, `/api/events` y `POST /api/toggle` sin auth (`server.js:281-338, 468, 566-607`). Exponen rutas locales, puertos, resúmenes de sesiones de trabajo y permiten escribir `tasks-state.json`. Recomendación: `app.use('/api', requireKey)` antes de las rutas, excluyendo health.
4. **Media** — `PUT /api/tareas/:id` construye regex con `id` sin escapar (`server.js:408,418`) y reescribe `backlog.md` sin lock (`:435`). Riesgo de corromper el archivo maestro de tareas. Recomendación: validar `id` con `/^T\d+$/` y escribir vía archivo temporal + rename.
5. **Media** — Métrica central rota: 39/43 proyectos "sin-git" (T260, `git safe.directory`) + `zya-consolidate` con ruta inexistente (`:62`) + 5 servicios ausentes de `PROYECTOS_DEF`. La tabla de proyectos, razón de ser original del dashboard, no refleja la realidad desde mayo.
6. **Media** — 7 vulnerabilidades high en dependencias (`npm audit`): `imap-simple` (abandonado) e `mailparser`. Recomendación: migrar a `imapflow` + actualizar `mailparser`; hasta entonces el riesgo real es bajo (solo procesa correo de buzones propios).
7. **Media** — Sin headers de seguridad ni `X-Powered-By` desactivado (`curl -I`). Recomendación: `helmet()` con `frameguard` (la página se carga sola, no en iframes) y `hsts`.
8. **Baja** — `parseSesionesHoy` usa fecha UTC (`server.js:444`): tras las 18:00 hora CDMX la sección "Sesiones de hoy" queda vacía.
9. **Baja** — `calcularProyectos()` bloquea el event loop con 86 `execSync` + lectura de miles de archivos (`:157-169`); mover a `setInterval` en background o `child_process` asíncrono.
10. **Baja** — `/api/health` reporta `version:'1.0.0'` (`:275`) con `package.json` 2.1.0; leer `require('./package.json').version`.

## 5. Mejoras técnicas propuestas
1. `server.js`: `app.use('/api', (req,res,next) => req.path === '/health' ? next() : requireKey(req,res,next))` — cierra los hallazgos 1 y 3 en 3 líneas.
2. `server.js` + `helmet` + `express-rate-limit` (p. ej. 20 intentos/15 min en 401) con `app.set('trust proxy', 1)` por Cloudflare.
3. Quitar `password` de `/api/correo` y eliminar `correo-buzones.json`; una sola fuente de secretos (`ecosystem.config.js`) y borrar el `.env` muerto o cargar dotenv de verdad.
4. Purgar `<REDACTADO>` de `deseimp/backlog.md:160` y rotar esa password (ya fue pública por 13 días).
5. `PROYECTOS_DEF`: corregir `zya-consolidate → consolidate`; agregar `armador-expedientes`, `casa-galindo`, `casa-galindo/intranet`, `jod`, `JOD/permisos`. Mejor aún: generar la lista desde `ECOSISTEMA.md` como ya se hace con docs (`listDocs`).
6. Carlos ejecuta `git config --system --add safe.directory "*"` (T260) → recupera `ultimo_commit` en 39 proyectos.
7. `/health` → responder 200 JSON directo con `service`, `version` del package y `timestamp`; agregar `Cloudflare-CDN-Cache-Control: no-store`.
8. Validar `id` en `PUT /api/tareas/:id` y escribir con temp+rename; loggear errores de `gitCmd`/IMAP con `console.error`.
9. `parseSesionesHoy`: fecha con `toLocaleDateString('sv-SE',{timeZone:'America/Mexico_City'})`.
10. Sustituir `imap-simple` por `imapflow` (mantenido, sin la cadena `utf7/semver`).

## 6. Producto y negocio
- **Para quién:** exclusivamente Carlos. Resuelve "ver todo en un lugar": tareas del backlog, sesiones, docs y correo entrante.
- **Uso real:** hay evidencia concreta y reciente, pero concentrada en dos funciones: (a) **backlog/tareas** — sesiones S1428/S1431/S1471 y `conversaciones.md:599,623,1574` muestran a Carlos consultando "pendientes reales" y cuestionando conteos; (b) **correo** — T257 lo pidió él, T262/T264 son reportes suyos de que "no carga". Las demás secciones no tienen rastro de uso: `tasks-state.json` (checkboxes) sin cambios desde 2026-04-16; la tabla de proyectos lleva 4 meses mostrando "sin-git" sin que se reclamara; docs viva y "Vista integrada" son iframes de monitor/changelog que ya existen solos.
- **Solapamientos:** `zya-monitor` ya hace estado de servicios, uptime y recovery (dashboard solo lo embebe); `zya-landing /admin` ya expone credenciales de ~22 sistemas (T241) — la sección "Correo" con passwords duplica esa función con menos protección; `webmail.zyaeti.mx` (SOGo) ya permite leer los buzones. Lo único **no duplicado** es el parser de `deseimp/*.md` y la bandeja unificada multi-buzón.
- **Monetización:** ninguna; costo cero de hosting, pero costo de mantenimiento real: 15 commits en 90 días, casi todos arreglos.
- **Qué le falta:** decidir su alcance. Hoy es cuatro herramientas en una página de 2,045 líneas con una clave compartida.
- **Riesgos:** el mayor es de seguridad, no de negocio: concentra secretos de clientes (buzones Sanyos/Casa Galindo, `credenciales.md`, `MEMORY.md`) detrás de la protección más débil del ecosistema. Un incidente aquí afecta a terceros.
- **Recomendación: MANTENER, reducido.** Conservar backlog/tareas + bandeja IMAP (lo que Carlos usa), cerrar la API pública y quitar la sección "Correo" con passwords (ya vive en zya-landing admin, que tiene auth propia). No fusionar con zya-monitor: son públicos distintos (monitor = servicios, dashboard = trabajo de Carlos), y la fusión sería un refactor sin beneficio. **Siguiente paso mínimo:** aplicar la mejora 1 (auth global `/api`) y purgar/rotar la password del backlog — 30 minutos.

## 7. Documentación
- **ESTADO.md:** desactualizado en cabecera (07-12 vs contenido 08-20); "Pendientes: Ninguno" es falso (T260, P-S1471, 9 vulns npm); afirma "MAILCOW_KEY en .env" cuando `.env` no se lee (T223).
- **CHANGELOG.md:** al día y de buena calidad (causa raíz, verificación, impacto). Es la mejor fuente de verdad del proyecto.
- **CLAUDE.md:** correcto y breve.
- **README:** ausente.
- **plans/:** índice coherente, sin planes huérfanos.
- **`conversaciones/dashboard.md`:** congelado desde 2026-04-04 pese a ~10 sesiones posteriores relevantes (T223, T256, T257, T262, T264).
- **`control-auditorias.md`:** "ASEG CRÍTICA abierta" sigue siendo cierto en la práctica (ver ACOD-5) aunque T196/T223 se marcaron resueltos.
- **`.env`:** existe con secretos reales pero es archivo muerto — contradice ESTADO y ya causó un incidente (T262).

## 8. Resumen priorizado
1. 🔴 `server.js:383` — `/api/tareas` público filtra `<REDACTADO>` y 20+ menciones de passwords del backlog. Cerrar con auth global `/api` + rotar password + purgar `backlog.md:160`.
2. 🔴 `server.js:654` + `index.html:1744` — quitar passwords de `/api/correo`; añadir `express-rate-limit` + `trust proxy` a `requireKey`.
3. 🔴 `server.js:584` y rutas GET públicas — `POST /api/toggle`, `/api/stats`, `/api/sesiones-hoy` sin auth.
4. 🟠 `server.js:62` + T260 — `zya-consolidate → consolidate`, agregar 5 servicios faltantes, ejecutar `safe.directory "*"` (Carlos). Recupera la tabla de proyectos.
5. 🟠 `server.js:408,435` — validar `id` y escritura atómica de `backlog.md`.
6. 🟠 `npm audit` — 7 high; migrar `imap-simple → imapflow`.
7. 🟡 `server.js:272-279` — `/health` 200 directo con `service`/`timestamp`/versión real; `helmet`; `Cloudflare-CDN-Cache-Control`.
8. 🟡 ESTADO.md + `conversaciones/dashboard.md` — actualizar; decidir si `.env` se elimina o se carga con dotenv.

**Conteo:** 22 ✅ · 17 ❌ · 13 ⚠️ · 0 ❓
