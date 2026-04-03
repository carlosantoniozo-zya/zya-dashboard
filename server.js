const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 4600;
const START_TIME = Date.now();

// ── Datos del ecosistema ──────────────────────────────────────────────────────
const PROYECTOS = [
  {
    nombre: 'anza-planner',
    dominio: 'anzaplanner.zyaeti.mx',
    puerto: 3900,
    tipo: 'local',
    stack: 'Next.js',
    js: 326, ts: 63, jsx: 0, tsx: 22, css: 2, md: 6,
    total_archivos: 1148, lineas: 33354,
    ultimo_commit: '9e7ed23 feat: splash screen propio',
    rama: 'main'
  },
  {
    nombre: 'byrsa',
    dominio: 'byrsa.zyaeti.mx',
    puerto: 3001,
    tipo: 'NAS',
    stack: 'React+Node',
    js: 21, ts: 0, jsx: 28, tsx: 0, css: 2, md: 7,
    total_archivos: 86, lineas: 11468,
    ultimo_commit: '5fe10b7 docs: screenshot referencia',
    rama: 'main'
  },
  {
    nombre: 'pricechecker',
    dominio: 'pricechecker.zyaeti.mx',
    puerto: 3300,
    tipo: 'local',
    stack: 'Node+Express+PG',
    js: 14, ts: 0, jsx: 7, tsx: 0, css: 2, md: 5,
    total_archivos: 47, lineas: 3062,
    ultimo_commit: '6e7d38a fix: ruta hardcodeada',
    rama: 'main'
  },
  {
    nombre: 'sanatorio-macias',
    dominio: 'sanatorio.zyaeti.mx',
    puerto: 3000,
    tipo: 'local',
    stack: 'Next.js',
    js: 136, ts: 131, jsx: 0, tsx: 28, css: 3, md: 6,
    total_archivos: 517, lineas: 36021,
    ultimo_commit: '4a3b928 docs: CLAUDE.md',
    rama: 'main'
  },
  {
    nombre: 'sesiona',
    dominio: 'sesiona.zyaeti.mx',
    puerto: 3400,
    tipo: 'local',
    stack: 'Next.js+PG',
    js: 123, ts: 80, jsx: 0, tsx: 25, css: 2, md: 3,
    total_archivos: 372, lineas: 16554,
    ultimo_commit: '9fb6149 chore: gitignore',
    rama: 'main'
  },
  {
    nombre: 'stockfs',
    dominio: 'stockfs.zyaeti.mx',
    puerto: 3500,
    tipo: 'local',
    stack: 'Next.js+PG',
    js: 110, ts: 94, jsx: 0, tsx: 17, css: 2, md: 4,
    total_archivos: 420, lineas: 31093,
    ultimo_commit: '94db823 chore: CLAUDE.md',
    rama: 'main'
  },
  {
    nombre: 'zya-changelog',
    dominio: 'cambios.zyaeti.mx',
    puerto: 3600,
    tipo: 'local',
    stack: 'Node',
    js: 1, ts: 0, jsx: 0, tsx: 0, css: 0, md: 4,
    total_archivos: 10, lineas: 304,
    ultimo_commit: '131e8e4 chore: gitignore',
    rama: 'main'
  },
  {
    nombre: 'zya-landing',
    dominio: 'zyaeti.mx',
    puerto: 3800,
    tipo: 'local',
    stack: 'Node',
    js: 3, ts: 0, jsx: 0, tsx: 0, css: 1, md: 4,
    total_archivos: 39, lineas: 1495,
    ultimo_commit: '72499f6 feat: pago.html',
    rama: 'main'
  },
  {
    nombre: 'zya-monitor',
    dominio: 'monitor.zyaeti.mx',
    puerto: 3700,
    tipo: 'local',
    stack: 'Node',
    js: 3, ts: 0, jsx: 0, tsx: 0, css: 0, md: 4,
    total_archivos: 15, lineas: 1158,
    ultimo_commit: 'fa1449c chore: CLAUDE.md',
    rama: 'main'
  },
  {
    nombre: 'luminn',
    dominio: 'luminn.zyaeti.mx',
    puerto: 4100,
    tipo: 'local',
    stack: 'React+Express+PG',
    js: 16, ts: 0, jsx: 17, tsx: 0, css: 1, md: 3,
    total_archivos: 48, lineas: 4156,
    ultimo_commit: '71c4fa7 chore: CLAUDE.md',
    rama: 'main'
  },
  {
    nombre: 'anonimastudio',
    dominio: 'anonima.zyaeti.mx',
    puerto: 4200,
    tipo: 'local',
    stack: 'Node+Express+SQLite',
    js: 1, ts: 0, jsx: 0, tsx: 0, css: 0, md: 3,
    total_archivos: 40, lineas: 647,
    ultimo_commit: '2e724d0 chore: gitignore',
    rama: 'master'
  },
  {
    nombre: 'zyapress',
    dominio: 'zyapress.zyaeti.mx',
    puerto: 4300,
    tipo: 'local',
    stack: 'React+Express+PG',
    js: 25, ts: 0, jsx: 23, tsx: 0, css: 1, md: 4,
    total_archivos: 79, lineas: 6779,
    ultimo_commit: 'cf35a60 chore: CLAUDE.md',
    rama: 'main'
  },
  {
    nombre: 'mardur',
    dominio: 'mardur.zyaeti.mx',
    puerto: 4500,
    tipo: 'local',
    stack: 'Node+Express',
    js: 58, ts: 5, jsx: 0, tsx: 0, css: 2, md: 4,
    total_archivos: 1568, lineas: 2539,
    ultimo_commit: 'abf5e35 feat: SEO',
    rama: 'master'
  },
  {
    nombre: 'psicpatriciaoliver',
    dominio: 'psicpatriciaoliver.zyaeti.mx',
    puerto: 4005,
    tipo: 'local',
    stack: 'Node+Express',
    js: 2, ts: 0, jsx: 0, tsx: 0, css: 0, md: 3,
    total_archivos: 20, lineas: 121,
    ultimo_commit: 'a205ed2 chore: CLAUDE.md',
    rama: 'main'
  },
  {
    nombre: 'zya-quieromiweb',
    dominio: 'quieromiweb.zyaeti.mx',
    puerto: 5438,
    tipo: 'local',
    stack: 'React+Express+SQLite',
    js: 10, ts: 0, jsx: 10, tsx: 0, css: 1, md: 2,
    total_archivos: 37, lineas: 1772,
    ultimo_commit: 'c1d78b4 chore: gitignore',
    rama: 'master'
  },
  {
    nombre: 'zya-ecommerce',
    dominio: 'commerce.zyaeti.mx',
    puerto: 4000,
    tipo: 'local',
    stack: 'React+Express+SQLite',
    js: 8, ts: 0, jsx: 11, tsx: 0, css: 1, md: 4,
    total_archivos: 41, lineas: 2446,
    ultimo_commit: 'b0aed29 docs: CLAUDE.md',
    rama: 'main'
  },
  {
    nombre: 'sanyos-app',
    dominio: 'sanyos.zyaeti.mx',
    puerto: 3001,
    tipo: 'NAS',
    stack: 'Node+Express',
    js: 6, ts: 0, jsx: 0, tsx: 0, css: 4, md: 5,
    total_archivos: 114, lineas: 3764,
    ultimo_commit: 'c25bde8 feat: splash propio',
    rama: 'main'
  },
  {
    nombre: 'sanyos-ops',
    dominio: 'ops.zyaeti.mx',
    puerto: 3001,
    tipo: 'NAS',
    stack: 'React+Node',
    js: 33, ts: 0, jsx: 44, tsx: 0, css: 6, md: 17,
    total_archivos: 187, lineas: 22536,
    ultimo_commit: '5d1a784 fix: FirmasOS',
    rama: 'main'
  },
  {
    nombre: 'usg-solano',
    dominio: 'usg.zyaeti.mx',
    puerto: 3030,
    tipo: 'NAS',
    stack: 'Node+Express',
    js: 7, ts: 0, jsx: 0, tsx: 0, css: 2, md: 6,
    total_archivos: 4842, lineas: 4336,
    ultimo_commit: '74afcc3 fix: gitignore',
    rama: 'main'
  },
  {
    nombre: '_playwright-zya',
    dominio: null,
    puerto: null,
    tipo: 'herramienta',
    stack: 'Node',
    js: 7, ts: 0, jsx: 0, tsx: 0, css: 0, md: 2,
    total_archivos: 15, lineas: 1024,
    ultimo_commit: '83e99ab docs: CLAUDE.md',
    rama: 'master'
  },
  {
    nombre: '_report-builder',
    dominio: null,
    puerto: null,
    tipo: 'modulo',
    stack: 'React+Node',
    js: 4, ts: 0, jsx: 1, tsx: 0, css: 1, md: 1,
    total_archivos: 11, lineas: 2096,
    ultimo_commit: '4d6235f docs: CLAUDE.md',
    rama: 'master'
  },
  {
    nombre: '_zya-about',
    dominio: null,
    puerto: null,
    tipo: 'modulo',
    stack: 'JS vanilla',
    js: 1, ts: 0, jsx: 0, tsx: 0, css: 0, md: 1,
    total_archivos: 3, lineas: 87,
    ultimo_commit: 'sin-git',
    rama: 'N/A'
  },
  {
    nombre: '_zya-theme',
    dominio: null,
    puerto: null,
    tipo: 'modulo',
    stack: 'CSS',
    js: 2, ts: 0, jsx: 0, tsx: 0, css: 1, md: 1,
    total_archivos: 4, lineas: 533,
    ultimo_commit: 'sin-git',
    rama: 'N/A'
  }
];

const GIT_SYNC = [
  { proyecto: 'byrsa', pc: true, nas: true, github: true },
  { proyecto: 'sanyos-ops', pc: true, nas: true, github: true },
  { proyecto: 'sanyos-app', pc: true, nas: true, github: true },
  { proyecto: 'usg-solano', pc: true, nas: true, github: true }
];

const PENDIENTES = [
  { descripcion: 'Activar toggle recordatorios en sesiona.zyaeti.mx/configuracion', tipo: 'manual', responsable: 'Carlos', proyecto: 'sesiona' },
  { descripcion: 'Llenar cédula/teléfono/dirección Dr. Solano en usg.zyaeti.mx/admin', tipo: 'manual', responsable: 'Carlos', proyecto: 'usg-solano' },
  { descripcion: 'Integrar canvas snapshot al PDF (USG)', tipo: 'código', responsable: 'CC', proyecto: 'usg-solano' },
  { descripcion: 'Sesiona: WebSockets chat + SERVER_ENCRYPTION_KEY', tipo: 'código', responsable: 'CC', proyecto: 'sesiona' },
  { descripcion: 'Byrsa: comparación digital inventario (escaneo vs Factusol)', tipo: 'código', responsable: 'CC', proyecto: 'byrsa' },
  { descripcion: 'Mardur: SMTP credenciales + WhatsApp', tipo: 'espera-cliente', responsable: 'cliente', proyecto: 'mardur' }
];

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());

// No-cache para HTML
const noCacheHeaders = (res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
};

// ── Rutas ────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  noCacheHeaders(res);
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    uptime: Math.floor((Date.now() - START_TIME) / 1000)
  });
});

app.get('/api/stats', (req, res) => {
  const totalLineas = PROYECTOS.reduce((s, p) => s + p.lineas, 0);
  const totalArchivos = PROYECTOS.reduce((s, p) => s + p.total_archivos, 0);
  const serviciosActivos = PROYECTOS.filter(p => p.dominio !== null).length;

  res.json({
    resumen: {
      total_proyectos: PROYECTOS.length,
      total_lineas: totalLineas,
      total_archivos: totalArchivos,
      servicios_activos: serviciosActivos,
      actualizado: '2026-04-03'
    },
    proyectos: PROYECTOS,
    git_sync: GIT_SYNC,
    pendientes: PENDIENTES
  });
});

app.get('/zya-about.js', (req, res) => {
  const aboutPath = path.join('C:/Proyectos/_zya-about/about.js');
  if (fs.existsSync(aboutPath)) {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.resolve(aboutPath));
  } else {
    res.status(404).send('// about.js no encontrado');
  }
});

// ── Static ────────────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`ZYA Dashboard corriendo en http://localhost:${PORT}`);
});
