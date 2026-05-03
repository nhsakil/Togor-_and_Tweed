// PM2 Ecosystem Config — Torgor & Tweed
// Usage on server:
//   pm2 start ecosystem.config.js
//   pm2 save && pm2 startup

module.exports = {
  apps: [
    {
      name:         'torgor-tweed',
      script:       'node_modules/.bin/next',
      args:         'start',
      cwd:          '/var/www/torgor-tweed',
      instances:    'max',
      exec_mode:    'cluster',
      autorestart:  true,
      watch:        false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT:     3000,
      },
      kill_timeout:   5000,
      wait_ready:     true,
      listen_timeout: 10000,
      log_file:    '/var/log/pm2/torgor-tweed.log',
      out_file:    '/var/log/pm2/torgor-tweed-out.log',
      error_file:  '/var/log/pm2/torgor-tweed-err.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
