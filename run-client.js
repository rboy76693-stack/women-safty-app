const { spawn } = require('child_process');
const path = require('path');

const vite = spawn(
  'node',
  [path.join(__dirname, 'client', 'node_modules', '.bin', 'vite')],
  {
    cwd: path.join(__dirname, 'client'),
    stdio: 'inherit',
    shell: true,
  }
);

vite.on('exit', (code) => process.exit(code));
