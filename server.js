const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { execSync } = require('child_process');

const app = express();
const PORT = parseInt(process.env.PORT) || 4600;
const START_TIME = Date.now();

// ── Caché stats proyectos ────────────────────────────────────────────────────
let _proyectosCache = null;
let _proyectosCacheAt = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Definición de proyectos (metadatos estables — sin stats)
const PROYECTOS_DEF = [
  { nombre: 'anza-planner',       dir: 'C:/Proyectos/anza-planner',      dominio: 'anzaplanner.zyaeti.mx',          puerto: 3900,  tipo: 'local',      stack: 'Next.js' },
  { nombre: 'byrsa',              dir: 'C:/Proyectos/byrsa',             dominio: 'byrsa.zyaeti.mx',                puerto: 3001,  tipo: 'NAS',        stack: 'React+Express+SQLite' },
  { nombre: 'pricechecker',       dir: 'C:/Proyectos/pricechecker',      dominio: 'pricechecker.zyaeti.mx',         puerto: 3300,  tipo: 'local',      stack: 'Node+Express+PG' },
  { nombre: 'sanatorio-macias',   dir: 'C:/Proyectos/sanatorio-macias',  dominio: 'sanatorio.zyaeti.mx',            puerto: 3000,  tipo: 'local',      stack: 'Next.js' },
  { nombre: 'sesiona',            dir: 'C:/Proyectos/sesiona',           dominio: 'sesiona.zyaeti.mx',              puerto: 3400,  tipo: 'local',      stack: 'Next.js+PG' },
  { nombre: 'stockfs',            dir: 'C:/Proyectos/stockfs',           dominio: 'stockfs.zyaeti.mx',              puerto: 3500,  tipo: 'local',      stack: 'Next.js+PG' },
  { nombre: 'zya-changelog',      dir: 'C:/Proyectos/zya-changelog',     dominio: 'cambios.zyaeti.mx',              puerto: 3600,  tipo: 'local',      stack: 'Node' },
  { nombre: 'zya-landing',        dir: 'C:/Proyectos/zya-landing',       dominio: 'zyaeti.mx',                      puerto: 3800,  tipo: 'local',      stack: 'Node' },
  { nombre: 'zya-monitor',        dir: 'C:/Proyectos/zya-monitor',       dominio: 'monitor.zyaeti.mx',              puerto: 3700,  tipo: 'local',      stack: 'Node' },
  { nombre: 'luminn',             dir: 'C:/Proyectos/luminn',            dominio: 'luminn.zyaeti.mx',               puerto: 4100,  tipo: 'local',      stack: 'React+Express+PG' },
  { nombre: 'anonimastudio',      dir: 'C:/Proyectos/anonimastudio',     dominio: 'anonima.zyaeti.mx',              puerto: 4200,  tipo: 'local',      stack: 'Node+Express+SQLite' },
  { nombre: 'zyapress',           dir: 'C:/Proyectos/zyapress',          dominio: 'zyapress.zyaeti.mx',             puerto: 4300,  tipo: 'local',      stack: 'React+Express+PG' },
  { nombre: 'psicpatriciaoliver', dir: 'C:/Proyectos/psicpatriciaoliver',dominio: 'psicpatriciaoliver.zyaeti.mx',   puerto: 4005,  tipo: 'local',      stack: 'Node+Express' },
  { nombre: 'zya-quieromiweb',    dir: 'C:/Proyectos/zya-quieromiweb',   dominio: 'quieromiweb.zyaeti.mx',          puerto: 5438,  tipo: 'local',      stack: 'React+Express+SQLite' },
  { nombre: 'zya-ecommerce',      dir: 'C:/Proyectos/zya-ecommerce',     dominio: 'commerce.zyaeti.mx',             puerto: 4000,  tipo: 'local',      stack: 'React+Express+SQLite' },
  { nombre: 'sanyos-app',         dir: 'C:/Proyectos/sanyos-app',        dominio: 'sanyos.zyaeti.mx',               puerto: 3001,  tipo: 'NAS',        stack: 'Node+Express' },
  { nombre: 'sanyos-ops',         dir: 'C:/Proyectos/sanyos-ops',        dominio: 'ops.zyaeti.mx',                  puerto: 3001,  tipo: 'NAS',        stack: 'React+Express+SQLite' },
  { nombre: 'usg-solano',         dir: 'C:/Proyectos/usg-solano',        dominio: 'usg.zyaeti.mx',                  puerto: 3030,  tipo: 'NAS',        stack: 'Node+Express' },
  { nombre: '_playwright-zya',    dir: 'C:/Proyectos/_playwright-zya',   dominio: null,                             puerto: null,  tipo: 'herramienta',stack: 'Node' },
  { nombre: '_report-builder',    dir: 'C:/Proyectos/_report-builder',   dominio: null,                             puerto: null,  tipo: 'modulo',     stack: 'React+Node' },
  { nombre: '_zya-about',         dir: 'C:/Proyectos/_zya-about',        dominio: null,                             puerto: null,  tipo: 'modulo',     stack: 'JS vanilla' },
  { nombre: '_zya-theme',         dir: 'C:/Proyectos/_zya-theme',        dominio: null,                             puerto: null,  tipo: 'modulo',     stack: 'CSS' },
  { nombre: 'zya-soporte',        dir: 'C:/Proyectos/zya-soporte',       dominio: 'soporte.zyaeti.mx',              puerto: 5439,  tipo: 'local',      stack: 'React+Express+SQLite' },
  { nombre: 'optica-cha',         dir: 'C:/Proyectos/opticascha',        dominio: 'opticascha.com',                 puerto: 5441,  tipo: 'local',      stack: 'Next.js' },
  { nombre: 'sanyos-web',         dir: 'C:/Proyectos/sanyos-web',        dominio: 'sanyos.mx',                      puerto: 3850,  tipo: 'local',      stack: 'Node+Express' },
  { nombre: 'zya-notificaciones', dir: 'C:/Proyectos/zya-notificaciones', dominio: null,                            puerto: 5443,  tipo: 'local',      stack: 'Express+SQLite+Meta' },
  { nombre: 'zya-mail',           dir: 'C:/Proyectos/zya-mail',          dominio: 'webmail.zyaeti.mx',              puerto: null,  tipo: 'local',      stack: 'Mailcow+WSL2' },
  { nombre: 'zya-markdown',       dir: 'C:/Proyectos/zya-markdown',      dominio: 'markdown.zyaeti.mx',             puerto: 5444,  tipo: 'local',      stack: 'Express+SQLite+Tiptap' },
  { nombre: 'zya-auth',           dir: 'C:/Proyectos/zya-auth',          dominio: 'auth.zyaeti.mx',                 puerto: 5445,  tipo: 'local',      stack: 'Express+SQLite+JWT' },
  { nombre: 'zya-suite',          dir: 'C:/Proyectos/zya-suite',         dominio: 'suite.zyaeti.mx',                puerto: 5446,  tipo: 'local',      stack: 'React+Vite+Express' },
  { nombre: 'dashboard',          dir: 'C:/Proyectos/dashboard',         dominio: 'dashboard.zyaeti.mx',            puerto: 4600,  tipo: 'local',      stack: 'Node+Express' },
  { nombre: 'zya-launcher',       dir: 'C:/Proyectos/zya-launcher',      dominio: null,                             puerto: 5447,  tipo: 'local',      stack: 'Express+AHK' },
];

function contarArchivosPorExt(dir) {
  const counts = { js: 0, ts: 0, jsx: 0, tsx: 0, css: 0, md: 0 };
  if (!fs.existsSync(dir)) return counts;
  function walk(d) {
    let entries;
    try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (e.name === 'node_modules' || e.name === '.git' || e.name === 'dist' || e.name === '.next') continue;
      const full = path.join(d, e.name);
      if (e.isDirectory()) { walk(full); }
      else {
        const ext = e.name.split('.').pop();
        if (counts.hasOwnProperty(ext)) counts[ext]++;
      }
    }
  }
  walk(dir);
  return counts;
}

function contarLineas(dir) {
  let total = 0;
  const exts = new Set(['js','ts','jsx','tsx','css','md']);
  if (!fs.existsSync(dir)) return 0;
  function walk(d) {
    let entries;
    try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (e.name === 'node_modules' || e.name === '.git' || e.name === 'dist' || e.name === '.next') continue;
      const full = path.join(d, e.name);
      if (e.isDirectory()) { walk(full); }
      else {
        const ext = e.name.split('.').pop();
        if (exts.has(ext)) {
          try {
            const content = fs.readFileSync(full, 'utf8');
            total += content.split('\n').length;
          } catch { /* fallo silencioso al leer archivo — el caller recibe 0 */ }
        }
      }
    }
  }
  walk(dir);
  return total;
}

function contarArchivosTotal(dir) {
  let total = 0;
  if (!fs.existsSync(dir)) return 0;
  function walk(d) {
    let entries;
    try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (e.name === 'node_modules' || e.name === '.git' || e.name === 'dist' || e.name === '.next') continue;
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk(full);
      else total++;
    }
  }
  walk(dir);
  return total;
}

function getUltimoCommit(dir) {
  if (!fs.existsSync(dir)) return 'sin-git';
  try {
    const result = execSync('git log --oneline -1', { cwd: dir, timeout: 3000, encoding: 'utf8', stdio: ['pipe','pipe','pipe'], windowsHide: true });
    return result.trim() || 'sin commits';
  } catch {
    return 'sin-git';
  }
}

function getRama(dir) {
  if (!fs.existsSync(dir)) return 'N/A';
  try {
    const result = execSync('git rev-parse --abbrev-ref HEAD', { cwd: dir, timeout: 3000, encoding: 'utf8', stdio: ['pipe','pipe','pipe'], windowsHide: true });
    return result.trim() || 'N/A';
  } catch {
    return 'N/A';
  }
}

function calcularProyectos() {
  return PROYECTOS_DEF.map(p => {
    const exts = contarArchivosPorExt(p.dir);
    return {
      ...p,
      ...exts,
      total_archivos: contarArchivosTotal(p.dir),
      lineas: contarLineas(p.dir),
      ultimo_commit: getUltimoCommit(p.dir),
      rama: getRama(p.dir),
    };
  });
}

function getProyectos() {
  const now = Date.now();
  if (_proyectosCache && (now - _proyectosCacheAt) < CACHE_TTL) return _proyectosCache;
  _proyectosCache = calcularProyectos();
  _proyectosCacheAt = now;
  return _proyectosCache;
}

// ── Git sync dinámico (PC real, NAS no verificable desde aquí) ───────────────
const GIT_SYNC_PROYECTOS = [
  { proyecto: 'byrsa',      dir: 'C:/Proyectos/byrsa' },
  { proyecto: 'sanyos-ops', dir: 'C:/Proyectos/sanyos-ops' },
  { proyecto: 'sanyos-app', dir: 'C:/Proyectos/sanyos-app' },
  { proyecto: 'usg-solano', dir: 'C:/Proyectos/usg-solano' },
];

let _gitSyncCache = null;
let _gitSyncCacheAt = 0;
const GIT_SYNC_TTL = 2 * 60 * 1000;

function gitCmd(dir, args) {
  try { return execSync(`git -C "${dir}" ${args}`, { timeout: 5000, encoding: 'utf8' }).trim(); }
  catch { return null; }
}

function calcularGitSync() {
  const now = Date.now();
  if (_gitSyncCache && (now - _gitSyncCacheAt) < GIT_SYNC_TTL) return _gitSyncCache;
  _gitSyncCache = GIT_SYNC_PROYECTOS.map(({ proyecto, dir }) => {
    const dirty  = gitCmd(dir, 'status --porcelain');
    const ahead  = gitCmd(dir, 'log @{upstream}..HEAD --oneline');
    const pc     = dirty === '' && ahead === '';
    return { proyecto, pc, github: pc, nas: null }; // nas = no verificable sin SSH
  });
  _gitSyncCacheAt = now;
  return _gitSyncCache;
}

// ── Parser pendientes.md ──────────────────────────────────────────────────────
function parsePendientes() {
  const pendientesPath = 'C:/Proyectos/deseimp/pendientes.md';
  if (!fs.existsSync(pendientesPath)) return [];
  const content = fs.readFileSync(pendientesPath, 'utf8');
  const items = [];
  let actual = null;
  for (const line of content.split('\n')) {
    if (line.startsWith('#') && !line.startsWith('##')) continue; // título principal
    const encabezado = line.match(/^## ([^\s—]+) — (.+)/);
    if (encabezado) {
      if (actual) items.push(actual);
      actual = { id: encabezado[1], descripcion: encabezado[2], tipo: '', responsable: '', proyecto: '' };
    } else if (actual) {
      const tipo = line.match(/\*\*Tipo:\*\* (.+)/);
      if (tipo) actual.tipo = tipo[1].trim();
      const resp = line.match(/\*\*Responsable:\*\* (.+)/);
      if (resp) actual.responsable = resp[1].trim();
      const proy = line.match(/\*\*Proyecto:\*\* (.+)/);
      if (proy) actual.proyecto = proy[1].trim();
    }
  }
  if (actual) items.push(actual);
  return items.filter(i => i.id);
}

// ── Tasks state (checkboxes) ──────────────────────────────────────────────────
const STATE_PATH = path.join(__dirname, 'tasks-state.json');

function loadTasksState() {
  if (!fs.existsSync(STATE_PATH)) return { pendientes: {}, hilos: {} };
  try { return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8')); }
  catch { return { pendientes: {}, hilos: {} }; }
}

function saveTasksState(state) {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
}

// SSE — lista de clientes conectados
const sseClients = [];

function broadcastState(state) {
  const msg = `data: ${JSON.stringify({ type: 'update', state })}\n\n`;
  sseClients.forEach(c => c.write(msg));
}

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
app.get('/health', (req, res) => res.redirect('/api/health'));

app.get('/api/stats', (req, res) => {
  const proyectos = getProyectos();
  const totalLineas = proyectos.reduce((s, p) => s + p.lineas, 0);
  const totalArchivos = proyectos.reduce((s, p) => s + p.total_archivos, 0);
  const serviciosActivos = proyectos.filter(p => p.dominio !== null).length;

  const hoy = new Date().toISOString().slice(0, 10);
  res.json({
    resumen: {
      total_proyectos: proyectos.length,
      total_lineas: totalLineas,
      total_archivos: totalArchivos,
      servicios_activos: serviciosActivos,
      actualizado: hoy
    },
    proyectos,
    git_sync: calcularGitSync(),
    pendientes: parsePendientes()
  });
});

app.get('/api/pendientes', (req, res) => {
  res.json({ pendientes: parsePendientes() });
});

// ── Hilos abiertos (parsea deseimp/hilos-abiertos.md) ───────────────────────
function parseHilosAbiertos() {
  const hilosPath = 'C:/Proyectos/deseimp/hilos-abiertos.md';
  if (!fs.existsSync(hilosPath)) return [];
  const content = fs.readFileSync(hilosPath, 'utf8');
  const hilos = [];
  let proyectoActual = 'General';
  let hiloActual = null;
  for (const line of content.split('\n')) {
    if (line.startsWith('## ') && !line.startsWith('### ')) {
      proyectoActual = line.replace('## ', '').trim();
    } else if (line.startsWith('### ')) {
      if (hiloActual) hilos.push(hiloActual);
      const m = line.match(/### (HI-\d+) — (.+)/);
      if (m) {
        hiloActual = { id: m[1], titulo: m[2], proyecto: proyectoActual, estado: '', proximo: '' };
      } else {
        hiloActual = null; // subsección auxiliar (### P1, ### F2, etc.), ignorar
      }
    } else if (hiloActual) {
      const est = line.match(/\*\*Estado:\*\* (.+)/);
      if (est) hiloActual.estado = est[1];
      const prox = line.match(/\*\*Próximo paso:\*\* (.+)/);
      if (prox) hiloActual.proximo = prox[1];
    }
  }
  if (hiloActual) hilos.push(hiloActual);
  return hilos.filter(h => h.id); // solo entradas válidas
}

app.get('/api/hilos', (req, res) => {
  res.json({ hilos: parseHilosAbiertos() });
});

// ── Tareas backlog (parsea deseimp/backlog.md) ───────────────────────────────
function parseTareas() {
  const backlogPath = 'C:/Proyectos/deseimp/backlog.md';
  if (!fs.existsSync(backlogPath)) return [];
  const content = fs.readFileSync(backlogPath, 'utf8');
  const tareas = [];
  let tareaActual = null;
  let bodyLines = [];
  for (const line of content.split('\n')) {
    const encabezado = line.match(/^## (T\d+) — (.+)/);
    if (encabezado) {
      if (tareaActual) { tareaActual.cuerpo = bodyLines.join('\n').trim(); tareas.push(tareaActual); }
      tareaActual = { id: encabezado[1], titulo: encabezado[2], estado: '', proyecto: '', cuerpo: '' };
      bodyLines = [];
    } else if (tareaActual) {
      const est = line.match(/\*\*Estado:\*\* (.+)/);
      if (est) tareaActual.estado = est[1];
      const proy = line.match(/\*\*Proyecto:\*\* (.+)/);
      if (proy) tareaActual.proyecto = proy[1].replace(/\s*\(.*\)/, '').trim();
      bodyLines.push(line);
    }
  }
  if (tareaActual) { tareaActual.cuerpo = bodyLines.join('\n').trim(); tareas.push(tareaActual); }
  return tareas.filter(t => t.id);
}

function clasificarEstado(estado) {
  const e = estado.toLowerCase();
  // Verificar inicio del estado primero para evitar falsos positivos
  if (e.startsWith('en proceso') || e.startsWith('en progreso') || e.startsWith('en desarrollo') || e.startsWith('montado en') || e.startsWith('activo')) return 'en-proceso';
  if (e.includes('completada') || e.includes('completo'))  return 'completada';
  if (e.includes('cancelad'))                               return 'cancelada';
  if (e.includes('en espera') || e.includes('bloqueado'))   return 'espera';
  if (e.includes('en proceso') || e.includes('en progreso') || e.includes('en desarrollo')) return 'en-proceso';
  if (e.includes('planificada'))                            return 'planificada';
  return 'pendiente';
}

app.get('/api/tareas', (req, res) => {
  const tareas = parseTareas().map(t => ({ ...t, clase: clasificarEstado(t.estado) }));
  const resumen = {
    total: tareas.length,
    completadas: tareas.filter(t => t.clase === 'completada').length,
    abiertas: tareas.filter(t => ['en-proceso','pendiente','planificada'].includes(t.clase)).length,
    espera: tareas.filter(t => t.clase === 'espera').length,
    canceladas: tareas.filter(t => t.clase === 'cancelada').length,
  };
  res.json({ tareas, resumen });
});

app.put('/api/tareas/:id', (req, res) => {
  const { id } = req.params;
  const { estado, cuerpo } = req.body;
  if (!estado || cuerpo === undefined) return res.status(400).json({ error: 'Faltan parámetros' });

  const backlogPath = 'C:/Proyectos/deseimp/backlog.md';
  if (!fs.existsSync(backlogPath)) return res.status(404).json({ error: 'backlog.md no encontrado' });

  const content = fs.readFileSync(backlogPath, 'utf8');
  const lines = content.split('\n');

  let startIdx = -1, endIdx = lines.length;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(new RegExp(`^## ${id} — `))) {
      startIdx = i;
    } else if (startIdx !== -1 && lines[i].match(/^## T\d+ — /) && i > startIdx) {
      endIdx = i;
      break;
    }
  }

  if (startIdx === -1) return res.status(404).json({ error: `Tarea ${id} no encontrada` });

  const titulo = lines[startIdx].replace(new RegExp(`^## ${id} — `), '').trim();

  // Actualizar la línea **Estado:** dentro del cuerpo
  let newCuerpo = cuerpo;
  if (/\*\*Estado:\*\*/.test(newCuerpo)) {
    newCuerpo = newCuerpo.replace(/\*\*Estado:\*\* [^\n]+/, `**Estado:** ${estado}`);
  }

  const newBlockLines = [`## ${id} — ${titulo}`, ...newCuerpo.split('\n')];

  // Preservar la línea en blanco que precede al siguiente bloque
  const newLines = [
    ...lines.slice(0, startIdx),
    ...newBlockLines,
    ...lines.slice(endIdx)
  ];

  fs.writeFileSync(backlogPath, newLines.join('\n'), 'utf8');
  res.json({ ok: true, titulo });
});

// ── Sesiones de hoy (parsea conversaciones.md) ──────────────────────────────
function parseSesionesHoy() {
  const convPath = 'C:/Proyectos/deseimp/conversaciones.md';
  if (!fs.existsSync(convPath)) return [];
  const content = fs.readFileSync(convPath, 'utf8');
  const hoy = new Date().toISOString().slice(0, 10);

  const sesiones = [];
  let actual = null;

  for (const line of content.split('\n')) {
    const m = line.match(/^## (\d{4}-\d{2}-\d{2}) — Sesion (\d+)/);
    if (m) {
      if (actual) sesiones.push(actual);
      actual = { fecha: m[1], numero: parseInt(m[2]), tema: '', resumen: '', cambios: '' };
    } else if (actual) {
      const tema     = line.match(/\*\*Tema:\*\* (.+)/);
      if (tema)    actual.tema    = tema[1].trim();
      const resumen  = line.match(/\*\*Resumen:\*\* (.+)/);
      if (resumen) actual.resumen = resumen[1].trim();
      const cambios  = line.match(/\*\*Cambios:\*\* (.+)/);
      if (cambios) actual.cambios = cambios[1].trim();
    }
  }
  if (actual) sesiones.push(actual);

  return sesiones.filter(s => s.fecha === hoy).sort((a, b) => b.numero - a.numero);
}

app.get('/api/sesiones-hoy', (req, res) => {
  res.json({ sesiones: parseSesionesHoy(), fecha: new Date().toISOString().slice(0, 10) });
});

// ── Documentación viva ────────────────────────────────────────────────────────
const DOCS = [
  { id: 'backlog',        label: 'Backlog',                 path: 'C:/Proyectos/deseimp/backlog.md',         categoria: 'operativo'    },
  { id: 'hilos',         label: 'Hilos abiertos',          path: 'C:/Proyectos/deseimp/hilos-abiertos.md', categoria: 'operativo'    },
  { id: 'conversaciones',label: 'Conversaciones',           path: 'C:/Proyectos/deseimp/conversaciones.md', categoria: 'operativo'    },
  { id: 'preguntas',     label: 'Preguntas pendientes',    path: 'C:/Proyectos/deseimp/preguntas.md',       categoria: 'operativo'    },
  { id: 'memory',        label: 'Memoria (MEMORY.md)',     path: 'C:/Users/Carlos Antonio/.claude/projects/C--Proyectos/memory/MEMORY.md', categoria: 'memoria' },
  { id: 'ecosistema',    label: 'Ecosistema',              path: 'C:/Proyectos/deseimp/ECOSISTEMA.md',      categoria: 'arquitectura' },
  { id: 'estandares',    label: 'Estándares ZYA',          path: 'C:/Proyectos/deseimp/ESTANDARES-ZYA.md', categoria: 'arquitectura' },
  { id: 'procedimientos',label: 'Manual de procedimientos',path: 'C:/Proyectos/deseimp/manual-procedimientos.md', categoria: 'arquitectura' },
  { id: 'decisiones',    label: 'Decisiones',              path: 'C:/Proyectos/deseimp/conversaciones/decisiones.md', categoria: 'historial' },
];

app.get('/api/docs', (req, res) => {
  res.json(DOCS.map(d => ({ id: d.id, label: d.label, categoria: d.categoria })));
});

app.get('/api/docs/:id', (req, res) => {
  const doc = DOCS.find(d => d.id === req.params.id);
  if (!doc) return res.status(404).json({ error: 'doc no encontrado' });
  if (!fs.existsSync(doc.path)) return res.status(404).json({ error: 'archivo no encontrado', path: doc.path });
  const content = fs.readFileSync(doc.path, 'utf8');
  // Para conversaciones, devolver solo las últimas 15000 chars (es muy largo)
  const trimmed = doc.id === 'conversaciones' && content.length > 15000
    ? '… (mostrando últimas entradas)\n\n' + content.slice(-15000)
    : content;
  res.json({ id: doc.id, label: doc.label, content: trimmed });
});

// ── SSE ───────────────────────────────────────────────────────────────────────
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const state = loadTasksState();
  res.write(`data: ${JSON.stringify({ type: 'init', state })}\n\n`);

  sseClients.push(res);
  req.on('close', () => {
    const i = sseClients.indexOf(res);
    if (i > -1) sseClients.splice(i, 1);
  });
});

// ── Toggle checkbox ───────────────────────────────────────────────────────────
// body: { tipo: 'pendientes'|'hilos', id: string, quien: 'Carlos'|'CC' }
app.post('/api/toggle', (req, res) => {
  const { tipo, id, quien } = req.body;
  if (!tipo || !id || !quien) return res.status(400).json({ error: 'Faltan parámetros' });
  if (!['pendientes', 'hilos'].includes(tipo)) return res.status(400).json({ error: 'tipo inválido' });

  const state = loadTasksState();
  if (!state[tipo]) state[tipo] = {};

  const actual = state[tipo][id];
  if (actual && actual.completado) {
    state[tipo][id] = { completado: false, quien: null, cuando: null };
  } else {
    state[tipo][id] = { completado: true, quien, cuando: new Date().toISOString() };
  }

  saveTasksState(state);
  broadcastState(state);
  res.json({ ok: true, item: state[tipo][id] });
});

// ── Estado actual de tasks ────────────────────────────────────────────────────
app.get('/api/tasks-state', (req, res) => {
  res.json(loadTasksState());
});

// ── Correo (Mailcow) ──────────────────────────────────────────────────────────
const MAILCOW_API = process.env.MAILCOW_API || 'https://webmail.zyaeti.mx/api/v1/get/mailbox/all';
const MAILCOW_KEY = process.env.MAILCOW_KEY;
let _correoCache = null;
let _correoCacheAt = 0;
const CORREO_TTL = 2 * 60 * 1000;

function fetchMailboxes() {
  return new Promise((resolve, reject) => {
    const req = https.get(MAILCOW_API, { headers: { 'X-API-Key': MAILCOW_KEY } }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.setTimeout(8000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

const CORREO_PWD_FILE = path.join(__dirname, 'correo-buzones.json');
function loadCorreoPwds() {
  try { return JSON.parse(fs.readFileSync(CORREO_PWD_FILE, 'utf8')); } catch { return {}; }
}

app.get('/api/correo', async (req, res) => {
  if (_correoCache && (Date.now() - _correoCacheAt) < CORREO_TTL) {
    return res.json({ buzones: _correoCache, cached: true });
  }
  try {
    const [data, pwds] = await Promise.all([fetchMailboxes(), Promise.resolve(loadCorreoPwds())]);
    const buzones = data.map(m => ({
      username:        m.username,
      local_part:      m.local_part,
      domain:          m.domain,
      name:            m.name,
      active:          m.active === 1,
      quota_total_mb:  Math.round(m.quota / 1048576),
      quota_used_mb:   Math.round((m.quota_used || 0) / 1048576),
      percent:         m.percent_in_use,
      messages:        m.messages,
      created:         m.created,
      last_imap:       m.last_imap_login,
      last_smtp:       m.last_smtp_login,
      password:        pwds[m.username] || null,
    }));
    _correoCache = buzones;
    _correoCacheAt = Date.now();
    res.json({ buzones, cached: false });
  } catch (e) {
    if (_correoCache) return res.json({ buzones: _correoCache, cached: true, error: e.message });
    res.status(503).json({ error: e.message });
  }
});

app.get('/zya-about.js', (req, res) => {
  const aboutPath = path.resolve(__dirname, '..', '_zya-about', 'about.js');
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
