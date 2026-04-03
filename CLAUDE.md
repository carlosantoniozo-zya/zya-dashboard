# CLAUDE.md — dashboard

## Contexto adicional
Lee ESTADO.md para el estado actual del proyecto antes de iniciar trabajo.

## Qué es
Dashboard de estadísticas del ecosistema ZYA. Muestra métricas reales de todos los proyectos: líneas de código, archivos, commits, estado de sincronización.

**Dominio:** dashboard.zyaeti.mx | **Puerto:** 4600

## Stack
- Node.js + Express
- HTML/CSS/JS vanilla en public/
- Sin base de datos (datos en JSON hardcoded en server.js + API futura)

## Restricciones
- No-cache en HTML (obligatorio ZYA)
- Stats actualizadas manualmente por ahora (futuro: git API)
- Puerto 4600 fijo

## Protocolo estándar ZyA

### a) Verificación obligatoria post-cambio
- Sin TypeScript en este proyecto — verificar manualmente en http://localhost:4600
- Ejecutar `node server.js` y confirmar HTTP 200 antes de declarar listo

### b) Límites operativos
- No asumir lectura completa de archivos >500 líneas sin paginar
- Máximo 5 archivos modificados por sesión salvo instrucción explícita
- Los datos del ecosistema viven en el array PROYECTOS de server.js

### c) Definición de "terminado"
- Una tarea está terminada cuando pasaría revisión de un dev senior perfeccionista
- Si hay deuda técnica visible, señalarla antes de cerrar (no silenciarla)

### d) Tareas grandes (>5 archivos)
- Usar sub-agentes paralelos agrupados por módulo o directorio
- Reportar resultado por grupo antes de integrar
