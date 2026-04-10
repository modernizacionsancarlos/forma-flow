import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const LOG_DIR = './logs';
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR);
}

const getLogFile = () => {
    const date = new Date();
    const fileName = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}.log`;
    return path.join(LOG_DIR, fileName);
};

const formatLog = (message) => {
    const now = new Date();
    const timestamp = now.toLocaleString('es-AR', { 
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    return `[${timestamp}] ${message}\n`;
};

const writeLog = (message) => {
    try {
        fs.appendFileSync(getLogFile(), formatLog(message));
    } catch (err) {
        console.error('Error escribiendo en el log:', err);
    }
};

console.log('\x1b[36m%s\x1b[0m', '🚀 Iniciando servidor de desarrollo con logger diario...');
writeLog('--- NUEVA SESIÓN DE DESARROLLO ---');

// Corremos vite
const vite = spawn('npx', ['vite'], { shell: true, stdio: ['inherit', 'pipe', 'pipe'] });

vite.stdout.on('data', (data) => {
    const output = data.toString();
    process.stdout.write(output);
    // Logueamos advertencias o errores del proceso
    if (output.toLowerCase().includes('warn') || output.toLowerCase().includes('error')) {
        writeLog(`[LOG] ${output.trim()}`);
    }
});

vite.stderr.on('data', (data) => {
    const output = data.toString();
    process.stderr.write(output);
    writeLog(`[ERROR] ${output.trim()}`);
});

vite.on('close', (code) => {
    writeLog(`[EXIT] El proceso terminó con código ${code}`);
    console.log(`\n🛑 Proceso terminado (${code})`);
});
