/**
 * SafeGuard launcher — runs silently, auto-restarts crashed processes
 * Run with: node safeguard.js
 */
const { spawn } = require('child_process');
const path = require('path');
const fs   = require('fs');

const ROOT   = __dirname;
const LOGS   = path.join(ROOT, 'logs');
if (!fs.existsSync(LOGS)) fs.mkdirSync(LOGS);

const log = (msg) => {
  const line = `[${new Date().toLocaleTimeString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(path.join(LOGS, 'launcher.log'), line + '\n');
};

const processes = {};

function start(name, cmd, args, cwd) {
  const out = fs.openSync(path.join(LOGS, `${name}.log`), 'a');
  const proc = spawn(cmd, args, { cwd, stdio: ['ignore', out, out], shell: true, windowsHide: true });
  processes[name] = proc;
  log(`Started ${name} (pid ${proc.pid})`);

  proc.on('exit', (code) => {
    log(`${name} exited (code ${code}) — restarting in 3s...`);
    setTimeout(() => start(name, cmd, args, cwd), 3000);
  });
}

// Kill anything on ports first
const { execSync } = require('child_process');
try { execSync('for /f "tokens=5" %a in (\'netstat -aon ^| find ":5000"\') do taskkill /F /PID %a', { shell: true, stdio: 'ignore' }); } catch {}
try { execSync('for /f "tokens=5" %a in (\'netstat -aon ^| find ":3000"\') do taskkill /F /PID %a', { shell: true, stdio: 'ignore' }); } catch {}

setTimeout(() => {
  start('server',   'node', ['index.js'],          path.join(ROOT, 'server'));
}, 500);

setTimeout(() => {
  start('client',   'npx',  ['vite'],              path.join(ROOT, 'client'));
}, 2000);

setTimeout(() => {
  start('ngrok',    'npx',  ['ngrok', 'http', '3000'], ROOT);
}, 5000);

log('SafeGuard started. Logs in: ' + LOGS);
log('Local:  http://localhost:3000');
log('Mobile: http://localhost:4040 (get ngrok URL)');
