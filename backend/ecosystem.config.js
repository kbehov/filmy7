module.exports = {
  apps: [
    {
      name: 'filmy7-api',
      script: 'index.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '312M',
      node_args: '--max-old-space-size=256',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      error_file: './logs/pm2/filmy7-api.error.log', // error log file path
      out_file: './logs/pm2/filmy7-api.out.log', // output log file path
      log_date_format: 'YYYY-MM-DD HH:mm Z', // date format for logs
      combine_logs: true, // combine logs for all instances
    },
  ],
}
