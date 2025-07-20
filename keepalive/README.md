# RonyDB Cron Scheduler

This directory contains the cron job scheduler for RonyDB that runs daily at 12:00 PM BST (GMT+6).

## Features

- **Daily Keepalive Update**: Updates the keepalive table to maintain database activity
- **Daily Backup**: Creates a backup of all CV data and stores it in the backup-restore table
- **Automatic Cleanup**: Keeps only the latest 2 backups and removes older ones
- **BST Timezone**: All operations are logged with Bangladesh Standard Time (GMT+6)

## Schedule

The cron job runs **daily at 12:00 PM BST** (6:00 AM UTC).

## Files

- `cron-scheduler.js` - Main cron scheduler that runs both keepalive and backup tasks
- `start-cron.js` - Startup script with better logging and error handling
- `package.json` - Dependencies and npm scripts

## Usage

### Start the Cron Scheduler

```bash
# Using npm script (recommended)
npm start

# Or directly
node start-cron.js
```

### Run Cron Scheduler Directly

```bash
# Run cron scheduler directly
npm run cron
# or
node cron-scheduler.js
```

### Environment Variables

Make sure you have a `.env` file with:
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Deployment

### Local Development
```bash
cd keepalive
npm install
npm start
```

### Production Deployment
For production, you can use:
- **PM2**: `pm2 start start-cron.js --name "ronydb-cron"`
- **Docker**: Create a container with the cron scheduler
- **Systemd**: Create a systemd service
- **Cloud Platforms**: Use their cron job services (Vercel Cron, AWS EventBridge, etc.)
- **GitHub Actions**: Use the `daily-cron.yml` workflow

## Logs

The scheduler provides detailed logging:
- Task start/completion times
- Keepalive update confirmations
- Backup creation confirmations
- Old backup deletion confirmations
- Error messages if operations fail

## Timezone Handling

The scheduler uses UTC internally but:
- Logs all times in BST (GMT+6)
- Runs at 6:00 AM UTC (which is 12:00 PM BST)
- All database timestamps are in BST format

## Error Handling

The scheduler includes:
- Graceful shutdown on SIGINT/SIGTERM
- Uncaught exception handling
- Unhandled promise rejection handling
- Individual task error handling that doesn't stop the scheduler

## GitHub Actions Integration

This scheduler is designed to work with the GitHub Actions workflow in `.github/workflows/daily-cron.yml` which runs daily at 12:00 PM BST. 