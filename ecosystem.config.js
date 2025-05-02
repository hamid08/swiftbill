module.exports = {
  apps: [
    {
      name: "tracking-service-api",
      script: "dist/src/main.js",
      instances: "max", // Use all CPU cores
      autorestart: true,
      watch: false, // Disable in production
      max_memory_restart: "1G", // Auto-restart if memory > 1GB
      exec_mode: "cluster", // Best for HTTP servers
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },

      // Logging setup
      // error_file: "./logs/tracking-service-api-error.log", // Stderr logs
      // out_file: "./logs/tracking-service-api-out.log", // Stdout logs
      // pid_file: "./logs/tracking-service-api.pid", // Process ID file
      // merge_logs: true, // Combine instance logs
      // log_date_format: "YYYY-MM-DD HH:mm:ss.SSS", // More precise timestamps
      // time: true, // Log process uptime

      // Advanced settings
      min_uptime: "60s", // Minimum uptime before considered "stable"
      listen_timeout: 5000, // Timeout for app to start (ms)
      kill_timeout: 3000, // Timeout for graceful shutdown
    },
  ],
};