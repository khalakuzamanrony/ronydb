# GitHub Workflows for RonyDB Cron Scheduler

This directory contains GitHub Actions workflows for running the daily cron tasks.

## 🎯 RECOMMENDED WORKFLOW

### `daily-cron.yml` (USE THIS ONE)
- **Schedule**: Daily at 6:00 AM UTC (12:00 PM BST/GMT+6)
- **Purpose**: **MAIN workflow** that runs both keepalive and backup tasks together
- **Manual Trigger**: Available via `workflow_dispatch`
- **Status**: ✅ **ACTIVE - Use this workflow**

## 🧪 TESTING WORKFLOW

### `test-cron.yml`
- **Schedule**: Manual only
- **Purpose**: Test workflow for manually running cron tasks
- **Manual Trigger**: Available via `workflow_dispatch` with task selection
- **Status**: ✅ **ACTIVE - Use for testing**

## ❌ DEPRECATED WORKFLOWS (DON'T USE)

### `backup-cron.yml` and `keepalive-cron.yml`
- **Status**: ❌ **DEPRECATED - These are redundant**
- **Reason**: We now have a unified scheduler that handles both tasks together
- **Action**: These can be deleted or disabled

## Why Only One Main Workflow?

Since we created a unified `cron-scheduler.js` that handles both keepalive and backup tasks together, there's no need for separate workflows. The unified approach is:

1. **Simpler**: One workflow instead of multiple
2. **More reliable**: Both tasks run together or not at all
3. **Easier to maintain**: Single source of truth
4. **Better logging**: Combined logs for both tasks

## Schedule Details

The main workflow runs at **6:00 AM UTC**, which corresponds to **12:00 PM BST** (Bangladesh Standard Time, GMT+6).

## Tasks Performed

The main workflow runs these tasks together:
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

## Summary

**Use `daily-cron.yml` for your main daily tasks.**
**Use `test-cron.yml` for manual testing.**
**Ignore the other workflows - they're redundant.** 