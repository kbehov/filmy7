module.exports = {
  apps: [
    {
      name: 'Filmy7',
      script: '.next/standalone/server.js',
      cwd: '/var/www/filmy7/frontend',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      node_args: '--max-old-space-size=400',
      env: {
        NODE_ENV: 'production',
        PORT: 3636,
        HOSTNAME: '0.0.0.0',
      },

      log_date_format: 'YYYY-MM-DD HH:mm Z',
      combine_logs: true,
      out_file: '/var/www/filmy7/frontend/logs/pm2/filmy7.log',
      error_file: '/var/www/filmy7/frontend/logs/pm2/filmy7-error.log',

      kill_timeout: 5000,
      wait_ready: false,
      listen_timeout: 10000,
      shutdown_with_message: false,
    },
  ],
}
