# ESTADO.md — dashboard
Última actualización: 2026-05-07

## Resumen
Dashboard operativo del ecosistema ZYA · Node.js + Express + HTML/CSS/JS vanilla · dashboard.zyaeti.mx · puerto 4600 · PC local

## Implementado ✅
- Stats del ecosistema (vía metadatos PROYECTOS_DEF + cálculo dinámico calcularProyectos())
- Tabla de todos los proyectos con estado
- Iframes integrados: ZYA Monitor + ZYA Changelog
- SSE para updates en tiempo real (/api/events)
- Lectura dinámica de deseimp/*.md: backlog, pendientes, hilos abiertos
- Documentación viva: 9 archivos .md accesibles desde /api/docs
- Auto-refresh configurable
- Git sync endpoint
- /api/toggle para habilitar/deshabilitar proyectos
- /api/correo endpoint
- v2.1.0 — Auditoría S12-C (2026-04-27): MAILCOW_KEY a .env, feedback widget, favicon agregados
- Health endpoint, no-cache, PM2, Cloudflare, Monitor
- MAILCOW_KEY en .env (no hardcodeado — fix S12-C)
- Dashboard registrado en zya-landing PROYECTOS_MAP (S631, commit ce3f80a — P15 resuelto)

## Pendientes 🔄
- Ninguno activo conocido

## Bugs conocidos 🐛
- Sin TypeScript — verificar manualmente (sin compilador de tipos)

## Deuda técnica ⚠️
- Sin TypeScript — errores de tipo solo visibles en runtime
- README.md ausente

## Próximas implementaciones 💡
- Agregar nuevos proyectos del ecosistema a PROYECTOS_DEF cuando se creen
- README.md (documentación mínima)

## Decisiones de arquitectura
- Sin framework frontend (HTML/CSS/JS vanilla) — herramienta interna, simplicidad sobre modernidad
- Sin BD — todo se lee dinámicamente de archivos .md y del filesystem
- SSE (no WebSockets) — updates unidireccionales del servidor son suficientes
- PROYECTOS_DEF con metadatos + calcularProyectos() dinámico — dos capas: estático + calculado

## Integraciones
- **ZYA Monitor** (monitor.zyaeti.mx) — iframe integrado
- **ZYA Changelog** (cambios.zyaeti.mx) — iframe integrado
- **deseimp/*.md** — lectura dinámica de backlog, pendientes, hilos
- **Mailcow** — /api/correo endpoint (MAILCOW_KEY en .env)

## Variables de entorno requeridas
- PORT=4600
- MAILCOW_KEY
- NODE_ENV=production
