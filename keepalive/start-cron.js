#!/usr/bin/env node

console.log('=== RonyDB Cron Scheduler ===');
console.log('Starting daily backup and keepalive service...');
console.log('Time: ' + new Date().toISOString());
console.log('Timezone: UTC (will run at 6:00 AM UTC = 12:00 PM BST)');
console.log('================================');

// Import and run the cron scheduler
require('./cron-scheduler.js');

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nReceived SIGINT. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nReceived SIGTERM. Shutting down gracefully...');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
}); 