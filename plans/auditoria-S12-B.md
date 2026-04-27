# Plan de Acción — Auditoría S12-B
**Proyecto:** `dashboard`
**Sesión:** S12-B
**Fecha:** 2026-04-27
**Basado en:** `dashboard/plans/auditoria-S12-A.md`
**Hallazgos fase A:** 47 total (❌ 7 · ⚠️ 12 · ❓ 9)
**Confirmados:** 21 | **Descartados:** 7
**Estado:** ⏳ PENDIENTE APROBACIÓN CARLOS

> **Leyenda:**
> 🔴 Crítico — seguridad, datos expuestos, service-down
> 🟠 Importante — comportamiento incorrecto, hardcoding, bugs latentes
> 🟡 Menor — documentación, cosmética, mejoras opcionales
> ⏳ PENDIENTE | ✅ APLICADO YYYY-MM-DD | 🟢 DESCARTADO | ⏭️ DIFERIDO

---

## AHCD — Hardcoding

| ID | Ítem | Prioridad | Estado | Verificación | Acción (archivo:línea → cambio exacto) |
|----|------|:---------:|:------:|--------------|----------------------------------------|
| H2 | PORT hardcodeado | 🟠 | ⏳ | `Read server.js:8 → const PORT = 4600` | `server.js:8` → cambiar `const PORT = 4600` por `const PORT = parseInt(process.env.PORT) \|\| 4600` |
| H3 | MAILCOW_KEY real en código | 🔴 | ⏳ | `Read server.js:496 → const MAILCOW_KEY = 'zya-mailcow-22f3f71d4c3af7bc289eef236fa97445'` (valor real) | `server.js:496` → cambiar por `const MAILCOW_KEY = process.env.MAILCOW_KEY`; crear `.env` con `MAILCOW_KEY=zya-mailcow-22f3f71d4c3af7bc289eef236fa97445` |
| H4 | MAILCOW_API URL hardcodeada | 🟠 | ⏳ | `Read server.js:495 → const MAILCOW_API = 'https://webmail.zyaeti.mx/api/v1/get/mailbox/all'` | `server.js:495` → cambiar por `const MAILCOW_API = process.env.MAILCOW_API \|\| 'https://webmail.zyaeti.mx/api/v1/get/mailbox/all'` |
| H6 | Ruta absoluta en sendFile zya-about | 🟡 | ⏳ | `Read server.js:551 → path.join('C:/Proyectos/_zya-about/about.js')` — ruta absoluta Windows-only | `server.js:551` → cambiar `path.join('C:/Proyectos/_zya-about/about.js')` por `path.resolve(__dirname, '..', '_zya-about', 'about.js')` |
| H7 | CACHE_TTL/CORREO_TTL hardcodeados | 🟡 | ⏳ | `Read server.js:14,499 → CACHE_TTL = 5*60*1000, CORREO_TTL = 2*60*1000` — constantes nombradas con comentarios | `server.js:14` → agregar comentario `// configurable via CACHE_TTL_MS env var` (bajo impacto, sin cambio funcional requerido) |

---

## ACAL — Calidad y Bugs

| ID | Ítem | Prioridad | Estado | Verificación | Acción (archivo:línea → cambio exacto) |
|----|------|:---------:|:------:|--------------|----------------------------------------|
| Q6 | console.log en producción | 🟡 | ⏳ | `Read server.js:565 → console.log('ZYA Dashboard corriendo en...')` — startup log, benigno | `server.js:565` → sin cambio funcional requerido; aceptable como log de arranque |
| Q8 | catch{} vacíos en filesystem | 🟡 | ⏳ | `Read server.js:57,88,103 → catch { return; } / catch {} / catch { return; }` en contarArchivosPorExt, contarLineas, contarArchivosTotal | `server.js:88` → cambiar `catch {}` por `catch { /* fallo silencioso al leer archivo — el caller recibe 0 */ }` (los otros catch ya tienen return implícito) |

---

## AAP — Alta de Proyecto

| ID | Ítem | Prioridad | Estado | Verificación | Acción (archivo:línea → cambio exacto) |
|----|------|:---------:|:------:|--------------|----------------------------------------|
| P3 | ESTADO.md desactualizado | 🟡 | ⏳ | `Read ESTADO.md → "25 proyectos", Sync CC solo hasta 2026-04-14, sin módulo Correo, sin /api/correo en Endpoints` | `ESTADO.md` → actualizar a 31 proyectos, añadir sección Correo, añadir endpoint /api/correo, actualizar Sync CC con fecha actual |
| P6 | `<title>` sin branding ZYA | 🟡 | ⏳ | `grep -n '<title>' → "ZYA Dashboard — Ecosistema"` — falta "ZyA Especialistas en TI" | `public/index.html:9` → cambiar `<title>ZYA Dashboard — Ecosistema</title>` por `<title>ZYA Dashboard \| ZyA Especialistas en TI</title>` |
| P7 | Sin meta description | 🟡 | ⏳ | `Read public/index.html → sin <meta name="description">` confirmado | `public/index.html:9` (después de title) → agregar `<meta name="description" content="Dashboard centralizado del ecosistema ZyA — estadísticas de proyectos, estado de servicios y documentación viva.">` |
| P9 | Sin favicon | 🟡 | ⏳ | `ls public/ → index.html, robots.txt` — sin favicon.* | `public/` → agregar `favicon.ico` (copiar de zya-landing o zya-changelog) |
| P11 | Sin feedback widget | 🟠 | ⏳ | `grep -n "widget" public/index.html → sin resultados`. ESTANDARES §216: aplica a todo producto ZYA incluyendo herramientas internas | `public/index.html` antes de `</body>` → agregar `<script src="https://monitor.zyaeti.mx/feedback/widget.js" defer></script>` |
| P15 | Dashboard no en zya-landing | 🟠 | ⏭️ DIFERIDO | `grep -n "dashboard" zya-landing/server.js → sin resultados` — zya-monitor y zya-changelog sí están | Diferido — toca código de zya-landing (proyecto fuera de scope S12). Se aplica cuando se audite zya-landing (S14/S15) |

---

## AMON — Monitoreo

| ID | Ítem | Prioridad | Estado | Verificación | Acción (archivo:línea → cambio exacto) |
|----|------|:---------:|:------:|--------------|----------------------------------------|
| M4 | Logs podrían exponer stack traces | 🟡 | ⏳ | `Read server.js:565 → startup log benigno`. fetchMailboxes y loadCorreoPwds tienen errores capturados en try/catch del handler. PM2 logs son privados. | Sin cambio requerido — riesgo bajo para herramienta interna sin acceso público a logs |

---

## ACOD — Coherencia

| ID | Ítem | Prioridad | Estado | Verificación | Acción (archivo:línea → cambio exacto) |
|----|------|:---------:|:------:|--------------|----------------------------------------|
| D1 | ESTADO.md = código | 🟡 | ⏳ | `Read ESTADO.md → "25 proyectos", sin módulo Correo, sin Sync CC post-2026-04-14` — idéntico a P3 | Combinado con P3: actualizar ESTADO.md completo |
| D3 | memory/project_dashboard.md ausente | 🟡 | ⏳ | `ls memory/ → project_dashboard.md no existe`. Estado del dashboard en MEMORY.md general — aceptable dado que es herramienta de meta-nivel | Crear `memory/project_dashboard.md` con estado auditado |
| D6 | package.json version 1.0.0 | 🟡 | ⏳ | `cat package.json → version: "1.0.0"`. CHANGELOG documenta v2.0.0 desde 2026-04-14 y múltiples releases posteriores | `package.json:3` → cambiar `"version": "1.0.0"` por `"version": "2.1.0"` (post módulo Correo 2026-04-21) |
| D8 | Sin .env.example | 🟠 | ⏳ | `ls → sin .env.example`. MAILCOW_KEY y MAILCOW_API son variables sin documentar — ocultan la dependencia de env vars | Crear `.env.example` con: `MAILCOW_KEY=`, `MAILCOW_API=https://webmail.zyaeti.mx/api/v1/get/mailbox/all`, `PORT=4600` |

---

## Ítems descartados (falsos positivos fase A)

| ID original | Ítem | Evidencia de descarte |
|-------------|------|-----------------------|
| Q1 | async/await sin try/catch en fetchMailboxes | `Read server.js:524-540` → fetchMailboxes() se llama dentro de `await Promise.all([...])` envuelto en try/catch. El caller maneja el rechazo correctamente |
| Q2 | .then() sin .catch() | `Read server.js completo` → no existen llamadas .then() en el código |
| Q5 | sseClients sin cleanup al desconectar | `Read server.js:461-464` → `req.on('close', () => { const i = sseClients.indexOf(res); if (i > -1) sseClients.splice(i, 1); })` — limpieza correcta |
| Q9 | Dependencias con vulnerabilidades | `npm audit → found 0 vulnerabilities` en express ^4.18.2 |
| P16 | No en credenciales.md | `Read credenciales.md` → herramienta interna sin credenciales propias de cliente. MAILCOW_KEY es credencial del sistema, se documenta en .env.example (D8) |
| D4 | conversaciones/dashboard.md ausente | `ls deseimp/conversaciones/dashboard.md → EXISTE` |
| D7 | Puerto en .env discrepante | No existe .env ni discrepancia entre archivos. Issue real es H2 (PORT hardcodeado), ya incluido |

---

## Lista de correcciones — pendiente aprobación Carlos

| # | ID | Ítem | Prioridad | Archivo:Línea | Fix propuesto | Estado |
|---|----|------|:---------:|:-------------:|---------------|:------:|
| 1 | H3 | MAILCOW_KEY real hardcodeado | 🔴 | server.js:496 | `const MAILCOW_KEY = process.env.MAILCOW_KEY` + crear `.env` con valor real | ⏳ |
| 2 | H4 | MAILCOW_API URL hardcodeada | 🟠 | server.js:495 | `process.env.MAILCOW_API \|\| '...'` | ⏳ |
| 3 | H2 | PORT hardcodeado | 🟠 | server.js:8 | `parseInt(process.env.PORT) \|\| 4600` | ⏳ |
| 4 | P11 | Sin feedback widget | 🟠 | public/index.html (antes de </body>) | Agregar `<script src="https://monitor.zyaeti.mx/feedback/widget.js" defer>` | ⏳ |
| 5 | D8 | Sin .env.example | 🟠 | — (crear archivo) | `.env.example` con MAILCOW_KEY=, MAILCOW_API=, PORT= | ⏳ |
| 6 | P3+D1 | ESTADO.md desactualizado | 🟡 | ESTADO.md | Actualizar: 31 proyectos, módulo Correo, Sync CC, endpoints | ⏳ |
| 7 | P6 | `<title>` sin branding | 🟡 | public/index.html:9 | `ZYA Dashboard \| ZyA Especialistas en TI` | ⏳ |
| 8 | P7 | Sin meta description | 🟡 | public/index.html:9 | Agregar `<meta name="description" content="...">` | ⏳ |
| 9 | P9 | Sin favicon | 🟡 | public/ | Copiar favicon.ico de otro proyecto ZYA | ⏳ |
| 10 | D6 | package.json v1.0.0 | 🟡 | package.json:3 | Actualizar a `"2.1.0"` | ⏳ |
| 11 | H6 | Ruta absoluta en sendFile | 🟡 | server.js:551 | `path.resolve(__dirname, '..', '_zya-about', 'about.js')` | ⏳ |
| 12 | D3 | Sin memory/project_dashboard.md | 🟡 | memory/ | Crear archivo con estado auditado | ⏳ |
| — | P15 | Dashboard no en zya-landing | 🟠 | zya-landing/server.js | ⏭️ DIFERIDO — aplicar en auditoría S14/S15 (zya-landing) | ⏭️ |

---

## Aprobación de Carlos

*(Llenar cuando Carlos da el visto bueno — antes de arrancar fase C)*

**Aprobado:** Carlos Antonio Zapata Oliver
**Fecha:** 2026-04-27
**Vetos/modificaciones:** P15 diferido — toca zya-landing (fuera de scope S12), se aplica en S14/S15
**Notas:** —

---

*Generado en auditoría S12-B — 2026-04-27*
*Siguiente fase: S12-C — leer `deseimp/instruccion-auditoria-C.md` · requiere aprobación de Carlos*
