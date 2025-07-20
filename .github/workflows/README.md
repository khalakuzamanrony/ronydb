# GitHub Workflows for RonyDB Cron Scheduler

This directory contains GitHub Actions workflows for running the daily cron tasks.

## Workflows

### 1. `daily-cron.yml` (Recommended)
- **Schedule**: Daily at 6:00 AM UTC (12:00 PM BST/GMT+6)
- **Purpose**: Main daily cron job that runs both keepalive and backup tasks
- **Manual Trigger**: Available via `workflow_dispatch`

### 2. `backup-cron.yml`
- **Schedule**: Daily at 6:00 AM UTC (12:00 PM BST/GMT+6)
- **Purpose**: Legacy backup workflow, now uses the unified cron scheduler
- **Manual Trigger**: Available via `workflow_dispatch`

### 3. `keepalive-cron.yml`
- **Schedule**: Daily at 6:00 AM UTC (12:00 PM BST/GMT+6)
- **Purpose**: Legacy keepalive workflow, now uses the unified cron scheduler
- **Manual Trigger**: Available via `workflow_dispatch`

### 4. `test-cron.yml`
- **Schedule**: Manual only
- **Purpose**: Test workflow for manually running cron tasks
- **Manual Trigger**: Available via `workflow_dispatch` with task selection

## Schedule Details

All scheduled workflows run at **6:00 AM UTC**, which corresponds to **12:00 PM BST** (Bangladesh Standard Time, GMT+6).

## Tasks Performed

Each workflow runs the following tasks:
1. **Keepalive Update**: Updates the keepalive table to maintain database activity
2. **CV Data Backup**: Creates a backup of all CV data in the backup-restore table
3. **Cleanup**: Removes old backups, keeping only the latest 2

## Manual Testing

Use the `test-cron.yml` workflow to manually test:
- **All tasks**: Runs both keepalive and backup
- **Keepalive only**: Runs only the keepalive update
- **Backup only**: Runs only the backup and cleanup

## Environment Variables

All workflows require these secrets:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

## Workflow Features

- **Node.js 20**: Latest LTS version
- **Ubuntu Latest**: Reliable runner environment
- **Working Directory**: Set to `keepalive/` for proper file access
- **Error Handling**: Comprehensive logging and error reporting
- **Manual Triggers**: All workflows can be run manually for testing

## Monitoring

Check the Actions tab in your GitHub repository to:
- Monitor scheduled runs
- View logs and error messages
- Manually trigger workflows for testing
- Track execution history

## Recommendations

1. **Use `daily-cron.yml`** as your primary workflow
2. **Keep the legacy workflows** for backward compatibility
3. **Use `test-cron.yml`** for manual testing and debugging
4. **Monitor the Actions tab** regularly to ensure tasks are running successfully 