# Plan de Acción — Auditoría S12-B
**Proyecto:** `dashboard`
**Sesión:** S12-B
**Fecha:** 2026-04-27
**Basado en:** `dashboard/plans/auditoria-S12-A.md`
**Hallazgos fase A:** 47 total (❌ 7 · ⚠️ 12 · ❓ 9)
**Confirmados:** 21 | **Descartados:** 7
**Estado:** ✅ APLICADO 2026-04-27

> **Leyenda:**
> 🔴 Crítico — seguridad, datos expuestos, service-down
> 🟠 Importante — comportamiento incorrecto, hardcoding, bugs latentes
> 🟡 Menor — documentación, cosmética, mejoras opcionales
> ⏳ PENDIENTE | ✅ APLICADO YYYY-MM-DD | 🟢 DESCARTADO | ⏭️ DIFERIDO

---

## AHCD — Hardcoding

| ID | Ítem | Prioridad | Estado | Verificación | Acción (archivo:línea → cambio exacto) |
|----|------|:---------:|:------:|--------------|----------------------------------------|
| H2 | PORT hardcodeado | 🟠 | ✅ 2026-04-27 | `grep -n "PORT" server.js:8 → const PORT = parseInt(process.env.PORT) \|\| 4600` — env var con fallback | ya aplicado |
| H3 | MAILCOW_KEY real en código | 🔴 | ✅ 2026-04-27 | `grep -n "MAILCOW_KEY" server.js:496 → const MAILCOW_KEY = process.env.MAILCOW_KEY` — sin valor hardcodeado | ya aplicado; .env con valor real creado |
| H4 | MAILCOW_API URL hardcodeada | 🟠 | ✅ 2026-04-27 | `server.js:495 → const MAILCOW_API = process.env.MAILCOW_API \|\| 'https://...'` — env var con fallback | ya aplicado |
| H6 | Ruta absoluta en sendFile zya-about | 🟡 | ✅ 2026-04-27 | `server.js:551 → path.resolve(__dirname, '..', '_zya-about', 'about.js')` — ruta relativa | ya aplicado |
| H7 | CACHE_TTL/CORREO_TTL hardcodeados | 🟡 | ✅ 2026-04-27 | Constantes con nombres claros — sin cambio funcional requerido per plan | descartado por plan |

---

## ACAL — Calidad y Bugs

| ID | Ítem | Prioridad | Estado | Verificación | Acción (archivo:línea → cambio exacto) |
|----|------|:---------:|:------:|--------------|----------------------------------------|
| Q6 | console.log en producción | 🟡 | ✅ 2026-04-27 | startup log benigno — sin cambio requerido per plan | descartado por plan |
| Q8 | catch{} vacíos en filesystem | 🟡 | ✅ 2026-04-27 | `server.js:88 → catch { /* fallo silencioso al leer archivo — el caller recibe 0 */ }` | comentario añadido 2026-04-27 |

---

## AAP — Alta de Proyecto

| ID | Ítem | Prioridad | Estado | Verificación | Acción (archivo:línea → cambio exacto) |
|----|------|:---------:|:------:|--------------|----------------------------------------|
| P3 | ESTADO.md desactualizado | 🟡 | ✅ 2026-04-27 | ESTADO.md: v2.1.0, 31 proyectos, módulo Correo, endpoints actualizados, Sync CC fecha actual | ya aplicado |
| P6 | `<title>` sin branding ZYA | 🟡 | ✅ 2026-04-27 | `index.html:9 → <title>ZYA Dashboard \| ZyA Especialistas en TI</title>` | ya aplicado |
| P7 | Sin meta description | 🟡 | ✅ 2026-04-27 | `index.html:10 → <meta name="description" content="Dashboard centralizado...">` | ya aplicado |
| P9 | Sin favicon | 🟡 | ✅ 2026-04-27 | `ls public/ → favicon.ico` existe | ya aplicado |
| P11 | Sin feedback widget | 🟠 | ✅ 2026-04-27 | `grep "widget" index.html → línea 1930: <script src="https://monitor.zyaeti.mx/feedback/widget.js" defer>` | ya aplicado |
| P15 | Dashboard no en zya-landing | 🟠 | ⏭️ DIFERIDO | `grep -n "dashboard" zya-landing/server.js → sin resultados` — zya-monitor y zya-changelog sí están | Diferido — toca código de zya-landing (proyecto fuera de scope S12). Se aplica cuando se audite zya-landing (S14/S15) |

---

## AMON — Monitoreo

| ID | Ítem | Prioridad | Estado | Verificación | Acción (archivo:línea → cambio exacto) |
|----|------|:---------:|:------:|--------------|----------------------------------------|
| M4 | Logs podrían exponer stack traces | 🟡 | ✅ 2026-04-27 | riesgo bajo, logs privados PM2 — sin cambio requerido per plan | descartado por plan |

---

## ACOD — Coherencia

| ID | Ítem | Prioridad | Estado | Verificación | Acción (archivo:línea → cambio exacto) |
|----|------|:---------:|:------:|--------------|----------------------------------------|
| D1 | ESTADO.md = código | 🟡 | ✅ 2026-04-27 | combinado con P3 — ESTADO.md actualizado | ya aplicado |
| D3 | memory/project_dashboard.md ausente | 🟡 | ✅ 2026-04-27 | `memory/project_dashboard.md` existe con estado post-auditoría S12 | ya aplicado |
| D6 | package.json version 1.0.0 | 🟡 | ✅ 2026-04-27 | `package.json → "version": "2.1.0"` | ya aplicado |
| D8 | Sin .env.example | 🟠 | ✅ 2026-04-27 | `.env.example` existe con MAILCOW_KEY=, MAILCOW_API=, PORT= | ya aplicado |

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
| 1 | H3 | MAILCOW_KEY real hardcodeado | 🔴 | server.js:496 | `const MAILCOW_KEY = process.env.MAILCOW_KEY` + crear `.env` con valor real | ✅ 2026-04-27 |
| 2 | H4 | MAILCOW_API URL hardcodeada | 🟠 | server.js:495 | `process.env.MAILCOW_API \|\| '...'` | ✅ 2026-04-27 |
| 3 | H2 | PORT hardcodeado | 🟠 | server.js:8 | `parseInt(process.env.PORT) \|\| 4600` | ✅ 2026-04-27 |
| 4 | P11 | Sin feedback widget | 🟠 | public/index.html:1930 | `<script src="https://monitor.zyaeti.mx/feedback/widget.js" defer>` | ✅ 2026-04-27 |
| 5 | D8 | Sin .env.example | 🟠 | .env.example | `.env.example` con MAILCOW_KEY=, MAILCOW_API=, PORT= | ✅ 2026-04-27 |
| 6 | P3+D1 | ESTADO.md desactualizado | 🟡 | ESTADO.md | 31 proyectos, módulo Correo, Sync CC, endpoints actualizados | ✅ 2026-04-27 |
| 7 | P6 | `<title>` sin branding | 🟡 | public/index.html:9 | `ZYA Dashboard \| ZyA Especialistas en TI` | ✅ 2026-04-27 |
| 8 | P7 | Sin meta description | 🟡 | public/index.html:10 | `<meta name="description" content="...">` presente | ✅ 2026-04-27 |
| 9 | P9 | Sin favicon | 🟡 | public/favicon.ico | favicon.ico presente | ✅ 2026-04-27 |
| 10 | D6 | package.json v1.0.0 | 🟡 | package.json:3 | `"version": "2.1.0"` | ✅ 2026-04-27 |
| 11 | H6 | Ruta absoluta en sendFile | 🟡 | server.js:551 | `path.resolve(__dirname, '..', '_zya-about', 'about.js')` | ✅ 2026-04-27 |
| 12 | D3 | Sin memory/project_dashboard.md | 🟡 | memory/ | `project_dashboard.md` creado con estado auditado | ✅ 2026-04-27 |
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
