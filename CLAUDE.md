# CLAUDE.md — dashboard

## Contexto adicional
Lee ESTADO.md para el estado actual del proyecto antes de iniciar trabajo.

## Qué es
Dashboard de estadísticas del ecosistema ZYA. Muestra métricas reales de todos los proyectos: líneas de código, archivos, commits, estado de sincronización.

**Dominio:** dashboard.zyaeti.mx | **Puerto:** 4600

## Stack
- Node.js + Express
- HTML/CSS/JS vanilla en public/
- Sin base de datos — stats dinámicas (git log + filesystem, caché 5 min) + parseo en tiempo real de archivos .md de deseimp/

## Restricciones
- No-cache en HTML (obligatorio ZYA)
- Puerto 4600 fijo
- Stats de proyectos dinámicas (caché 5 min); metadatos estables en `PROYECTOS_DEF` de server.js, stats calculadas por `calcularProyectos()`
- Pendientes, hilos y backlog: parseo dinámico de deseimp/*.md — no editar arrays en server.js

## Protocolo estándar ZyA

### a) Verificación obligatoria post-cambio
- Sin TypeScript en este proyecto — verificar manualmente en http://localhost:4600
- Ejecutar `node server.js` y confirmar HTTP 200 antes de declarar listo

### b) Límites operativos
- No asumir lectura completa de archivos >500 líneas sin paginar
- Máximo 5 archivos modificados por sesión salvo instrucción explícita
- Los metadatos del ecosistema viven en `PROYECTOS_DEF` de server.js (dominio, puerto, stack). Las stats se calculan dinámicamente por `calcularProyectos()`

### c) Definición de "terminado"
- Una tarea está terminada cuando pasaría revisión de un dev senior perfeccionista
- Si hay deuda técnica visible, señalarla antes de cerrar (no silenciarla)

### d) Tareas grandes (>5 archivos)
- Usar sub-agentes paralelos agrupados por módulo o directorio
- Reportar resultado por grupo antes de integrar
