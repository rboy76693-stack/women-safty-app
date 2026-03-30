module.exports = {
  apps: [
    {
      name: 'safeguard-server',
      script: 'index.js',
      cwd: './server',
      interpreter: 'C:\\Program Files\\nodejs\\node.exe',
      watch: false,
      autorestart: true,
      restart_delay: 2000,
    },
    {
      name: 'safeguard-client',
      script: 'run-client.js',
      cwd: '.',
      interpreter: 'C:\\Program Files\\nodejs\\node.exe',
      watch: false,
      autorestart: true,
      restart_delay: 2000,
    },
    {
      name: 'safeguard-ngrok',
      script: 'C:\\Users\\kshit\\AppData\\Roaming\\npm\\node_modules\\ngrok\\bin\\ngrok.exe',
      args: 'http 3000',
      interpreter: 'none',
      watch: false,
      autorestart: true,
      restart_delay: 5000,
    },
  ],
};
