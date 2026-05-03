/**
 * QA smoke automatizado: ESLint + build de producción.
 * La checklist manual está en docs/QA-SMOKE.md
 *
 * Uso: npm run qa
 * Código de salida: 0 = OK, 1 = falló algún paso
 */

import { spawnSync } from 'node:child_process';
import { writeFileSync, appendFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const logFile = join(root, 'QA-SMOKE-LOG.txt');

function ts() {
  return new Date().toISOString();
}

function runStep(label, cmd, args) {
  console.log(`\n━━ ${label} ━━\n`);
  const r = spawnSync(cmd, args, {
    cwd: root,
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });
  const code = r.status ?? 1;
  const line = `[${ts()}] ${label}: ${code === 0 ? 'OK' : 'FAIL'} (exit ${code})\n`;
  try {
    appendFileSync(logFile, line);
  } catch {
    /* ignore */
  }
  return code;
}

function banner() {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║  FormaFlow — QA smoke (automatizado)                    ║
║  Manual: docs/QA-SMOKE.md                               ║
╚══════════════════════════════════════════════════════════╝
`);
}

function footer(ok) {
  console.log(
    ok
      ? `\n✓ QA automatizado: TODO OK (${ts()})\nSiguiente: checklist manual en docs/QA-SMOKE.md\n`
      : `\n✗ QA automatizado: REVISAR SALIDA ARRIBA (${ts()})\n`
  );
}

function initLog() {
  const header = `\n======== QA-SMOKE ========= ${ts()} =========\n`;
  try {
    writeFileSync(logFile, header);
  } catch {
    /* ignore */
  }
}

initLog();
banner();

const lint = runStep('ESLint (npm run lint)', 'npm', ['run', 'lint']);
if (lint !== 0) {
  footer(false);
  process.exit(1);
}

const build = runStep('Vite build (npm run build)', 'npm', ['run', 'build']);
if (build !== 0) {
  footer(false);
  process.exit(1);
}

// Comprobación liviana: existe salida de build
const distIndex = join(root, 'dist', 'index.html');
if (!existsSync(distIndex)) {
  console.error('No se encontró dist/index.html tras el build.');
  appendFileSync(logFile, `[${ts()}] dist/index.html: FAIL (missing)\n`);
  footer(false);
  process.exit(1);
}

console.log(`\n✓ dist/index.html generado correctamente.`);
appendFileSync(logFile, `[${ts()}] dist/index.html: OK\n`);

footer(true);
process.exit(0);
