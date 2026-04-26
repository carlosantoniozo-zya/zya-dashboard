# Hallazgos de Auditoría — S12-A Discovery
**Proyecto:** `dashboard`
**Sesión:** S12-A
**Fecha:** 2026-04-26
**Auditorías aplicadas:** AHCD · ACAL · AAP · AMON · ACOD
**Siguiente paso:** Fase S12-B — Plan + Verificación

> **Leyenda:**
> ✅ OK — cumple el estándar ZYA
> ❌ Issue — incumplimiento confirmado solo con lectura
> ⚠️ Sospechoso — parece mal, requiere verificación activa en fase B
> ❓ Sin confirmar — contexto insuficiente para decidir

---

## AHCD — Hardcoding

| ID | Ítem | Estado | Hallazgo | Archivo:Línea |
|----|------|:------:|----------|:-------------:|
| H1 | IPs hardcodeadas (no en .env) | ✅ | No se encontraron IPs en dashboard/server.js | — |
| H2 | Puerto sin process.env.PORT | ❌ | `const PORT = 4600` fijo; no usa `process.env.PORT \|\| 4600` | server.js:8 |
| H3 | API keys / tokens en código fuente | ❌ | `MAILCOW_KEY = 'zya-mailcow-22f3f71d4c3af7bc289eef236fa97445'` hardcodeado | server.js:496 |
| H4 | URLs de producción hardcodeadas | ❌ | `MAILCOW_API = 'https://webmail.zyaeti.mx/api/v1/get/mailbox/all'` hardcodeado | server.js:495 |
| H5 | Credenciales de BD en código | ✅ | N/A — sin base de datos | — |
| H6 | Rutas absolutas del sistema hardcodeadas | ⚠️ | `PROYECTOS_DEF` tiene 31 entradas con rutas `C:/Proyectos/...`; `DOCS` tiene 9 rutas absolutas; `/zya-about.js` usa `path.join('C:/Proyectos/_zya-about/about.js')`. Son rutas de configuración del ecosistema, pero al ser Windows-only impiden portabilidad | server.js:18-48, 422-432, 551 |
| H7 | Números mágicos en lógica de negocio | ⚠️ | `CACHE_TTL = 5 * 60 * 1000`, `CORREO_TTL = 2 * 60 * 1000` — valores de caché no en constantes nombradas en .env; son configuración de operación | server.js:14,499 |
| H8 | Teléfonos hardcodeados (deben ir en .env) | ✅ | No se encontraron teléfonos hardcodeados | — |

---

## ACAL — Calidad y Bugs

| ID | Ítem | Estado | Hallazgo | Archivo:Línea |
|----|------|:------:|----------|:-------------:|
| Q1 | async/await sin try/catch | ⚠️ | Ruta `GET /api/correo` usa `await Promise.all(...)` dentro de try/catch correctamente. Sin embargo `fetchMailboxes()` devuelve una Promise sin `.catch()` externo — rechaza al llamador | server.js:520-548 |
| Q2 | .then() sin .catch() | ✅ | No se encontraron `.then()` en el código | — |
| Q3 | JSON.parse sin try/catch | ✅ | Las 3 ocurrencias están envueltas en try/catch: line 194 (loadTasksState), line 507 (fetchMailboxes callback), line 517 (loadCorreoPwds) | server.js:194,507,517 |
| Q4 | == en lugar de === | ✅ | No se encontraron comparaciones con `==` (solo `===`) | — |
| Q5 | Variables declaradas no usadas | ⚠️ | `sseClients` es array mutable global, pero `broadcastState()` llama `sseClients.forEach` — requiere verificación activa si hay limpieza correcta al desconectar | server.js:203,461-464 |
| Q6 | console.log en código de producción | ⚠️ | Una sola ocurrencia: `console.log(\`ZYA Dashboard corriendo en...\`)` — es startup log, práctica común aceptada en Node.js | server.js:565 |
| Q7 | Queries con concatenación de strings (SQLi) | ✅ | N/A — sin base de datos SQL | — |
| Q8 | Errores genéricos sin información útil | ⚠️ | En `contarArchivosPorExt`, `contarLineas`, `contarArchivosTotal` y `getUltimoCommit`: bloques `catch {}` vacíos que silencian errores de filesystem | server.js:57,88,107,119 |
| Q9 | Dependencias con vulnerabilidades críticas | ❓ | Solo una dependencia: `express ^4.18.2`. No es posible verificar vulnerabilidades CVE sin ejecutar `npm audit` (fase B) | — |

---

## AAP — Alta de Proyecto

| ID | Ítem | Estado | Hallazgo | Archivo:Línea |
|----|------|:------:|----------|:-------------:|
| P1 | CLAUDE.md existe y está completo | ✅ | Existe con stack, puerto, restricciones y protocolo estándar | CLAUDE.md |
| P2 | CHANGELOG.md existe con entradas | ✅ | Existe con 20+ entradas fechadas desde 2026-04-03 | CHANGELOG.md |
| P3 | ESTADO.md existe y está actualizado | ⚠️ | Existe pero indica "25 proyectos" en funcionalidades; PROYECTOS_DEF actual tiene 31 entradas. ESTADO.md dice "v2.0.0" y funcionalidades no incluyen el módulo Correo (añadido 2026-04-21) ni la sesión sesiones-hoy | ESTADO.md |
| P4 | .gitignore cubre .env | ✅ | `.gitignore` incluye `.env`, `tasks-state.json` y `correo-buzones.json` | .gitignore |
| P5 | Pre-commit hook instalado y ejecutable | ✅ | Archivo `pre-commit` existe en `.git/hooks/` | .git/hooks/pre-commit |
| P6 | `<title>` sigue formato ZYA | ⚠️ | `<title>ZYA Dashboard — Ecosistema</title>` — no incluye "ZyA Especialistas en TI" que sí tiene el monitor | public/index.html:9 |
| P7 | Meta description presente y descriptiva | ❌ | No se encontró `<meta name="description">` en index.html | public/index.html |
| P8 | `<html lang="es">` | ✅ | `<html lang="es">` presente | public/index.html:2 |
| P9 | Favicon presente | ❌ | No se encontró ningún `favicon.*` en `public/` | public/ |
| P10 | Cache-Control en HTML (no-cache, no-store) | ✅ | `noCacheHeaders()` aplicado en ruta `/`; además meta tags no-cache en index.html | server.js:214-218, public/index.html:6-8 |
| P11 | Widget feedback presente | ❌ | No se encontró script de `feedback/widget` en index.html. Herramienta interna — evaluar si aplica en fase B | public/index.html |
| P12 | Script zya-about.js presente | ✅ | `<script src="/zya-about.js">` en línea 1881 del index.html | public/index.html:1881 |
| P13 | Registrado en zya-monitor (seedProyectos) | ✅ | Entrada `dashboard` en seedProyectos con id='dashboard', puerto 4600, health_path='/api/health' | zya-monitor/server.js:133 |
| P14 | Registrado en zya-changelog | ✅ | Entrada `dashboard` en zya-changelog/server.js | zya-changelog/server.js:17 |
| P15 | Registrado en zya-landing | ❓ | No se verificó zya-landing en esta fase (requiere lectura adicional en fase B) | — |
| P16 | Registrado en credenciales.md | ❓ | credenciales.md no está en git (excluido) — no verificable en esta fase | — |

---

## AMON — Monitoreo e Integraciones

| ID | Ítem | Estado | Hallazgo | Archivo:Línea |
|----|------|:------:|----------|:-------------:|
| M1 | En seedProyectos de zya-monitor | ✅ | Entrada `dashboard` presente con id, dominio, puerto y health_path correctos | zya-monitor/server.js:133 |
| M2 | Auto-recovery configurado (tipo: 'local') | ✅ | `tipo: 'local'` — auto-recovery vía `pm2 restart dashboard` activado para fallos #2 y #4 | zya-monitor/server.js:133 |
| M3 | /health responde 200 | ❓ | Endpoint `/health` redirige a `/api/health` con `res.redirect()`. El monitor apunta a `/api/health` directamente (healthFixes). Requiere verificación HTTP en fase B | server.js:233 |
| M4 | Logs no exponen datos sensibles | ⚠️ | `console.log('ZYA Dashboard corriendo en...')` es benigno. Sin embargo, errores de fetchMailboxes y loadCorreoPwds podrían loguear stack traces con rutas en PM2 logs | server.js:565 |
| M5 | Alertas Telegram/WA configuradas si aplica | ✅ | N/A — dashboard es herramienta interna sin templates WA propios; las alertas de caída las gestiona zya-monitor | — |
| M6 | Entrada en zya-changelog | ✅ | Entrada `dashboard` confirmada en zya-changelog | zya-changelog/server.js:17 |
| M7 | PM2 tiene la app configurada | ✅ | `name: 'dashboard'` en ecosystem.config.js con `cwd: 'C:\\Proyectos\\dashboard'` | ecosystem.config.js:5-7 |
| M8 | PM2 save ejecutado | ❓ | No verificable con solo lectura — requiere `pm2 list` en fase B | — |

---

## ACOD — Coherencia Código-Documentación

| ID | Ítem | Estado | Hallazgo | Archivo:Línea |
|----|------|:------:|----------|:-------------:|
| D1 | ESTADO.md = módulos reales en código | ❌ | ESTADO.md dice "25 proyectos" en funcionalidades; PROYECTOS_DEF tiene 31 entradas (incluyendo dashboard mismo). ESTADO.md no menciona módulo Correo (endpoint `/api/correo`, sección Mailcow) añadido el 2026-04-21 | ESTADO.md vs server.js |
| D2 | CHANGELOG.md = último cambio real con fecha | ✅ | Última entrada 2026-04-26 coincide con último git commit 2026-04-26 14:28 | CHANGELOG.md, git log |
| D3 | memory/project_*.md = estado auditado | ❓ | No existe archivo `memory/project_dashboard.md` en la memoria de Claude específico para este proyecto — el estado del dashboard vive embebido en MEMORY.md general; no es posible verificar si refleja el estado auditado sin acceso a la memoria completa | — |
| D4 | conversaciones/dashboard.md = sesiones reales | ❓ | No se verificó si existe `deseimp/conversaciones/dashboard.md` en esta fase | — |
| D5 | plans/ no tiene planes huérfanos | ✅ | Solo existe `plans/index-planes.md` sin planes activos ni cerrados huérfanos | plans/index-planes.md |
| D6 | package.json version coherente con CHANGELOG | ⚠️ | `package.json` version `1.0.0`; CHANGELOG documenta v2.0.0 (2026-04-14c) y múltiples entradas posteriores — versión de package.json nunca fue actualizada | package.json:3, CHANGELOG.md |
| D7 | Puerto en .env = puerto en server.js listen() | ⚠️ | No existe `.env` ni `.env.example` en el proyecto. El puerto 4600 está hardcodeado en `server.js:8`. No hay discrepancia entre archivos pero viola el patrón de process.env | server.js:8 |
| D8 | Variables en .env.example = variables usadas en código | ❌ | No existe `.env.example`. El código usa `MAILCOW_KEY` hardcodeado (no en env) y no documenta variables de entorno esperadas (no tiene ninguna excepto las que hereda del sistema via PM2) | — |

---

## Resumen de hallazgos — dashboard

| Categoría | ✅ OK | ❌ Issue | ⚠️ Sospechoso | ❓ Sin confirmar | Total ítems |
|-----------|:-----:|:--------:|:--------------:|:----------------:|:-----------:|
| AHCD | 3 | 2 | 2 | 0 | 7 |
| ACAL | 3 | 0 | 4 | 1 | 8 |
| AAP | 7 | 3 | 3 | 3 | 16 |
| AMON | 4 | 0 | 1 | 3 | 8 |
| ACOD | 2 | 2 | 2 | 2 | 8 |
| **TOTAL** | **19** | **7** | **12** | **9** | **47** |

> Nota: AHCD tiene 7 ítems en lugar de 8 porque H5 (credenciales BD) aplica a proyectos con BD — el dashboard no tiene BD propia.

---

### Issues prioritarios (❌)

1. **H2** — `PORT` hardcodeado como `const PORT = 4600`, no usa `process.env.PORT`
2. **H3** — `MAILCOW_KEY` con valor real hardcodeado en código fuente (debería ir en .env)
3. **H4** — `MAILCOW_API` URL hardcodeada (debería ir en .env)
4. **P7** — Sin `<meta name="description">` en index.html
5. **P9** — Sin favicon en `public/`
6. **P11** — Sin feedback widget (verificar si aplica a herramientas internas en fase B)
7. **D1** — ESTADO.md desactualizado: indica 25 proyectos (actual: 31) y omite módulo Correo
8. **D8** — No existe `.env.example`; MAILCOW_KEY no está documentado ni en env

---

*Generado en auditoría S12-A — 2026-04-26*
*Siguiente fase: S12-B — leer `deseimp/instruccion-auditoria-B.md`*
