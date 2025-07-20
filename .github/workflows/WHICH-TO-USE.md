# Which GitHub Workflow to Use?

## ✅ ACTIVE WORKFLOWS (Only 2 files remain):

### `daily-cron.yml` - MAIN WORKFLOW
- **Purpose**: Main daily cron job that runs both keepalive and backup tasks
- **Schedule**: Daily at 12:00 PM BST (6:00 AM UTC)
- **Manual Trigger**: Available via `workflow_dispatch`
- **Status**: ✅ **ACTIVE - Use this for daily tasks**

### `test-cron.yml` - TESTING WORKFLOW
- **Purpose**: Manual testing of cron tasks
- **Schedule**: Manual only
- **Manual Trigger**: Available via `workflow_dispatch`
- **Status**: ✅ **ACTIVE - Use for testing**

## ❌ DELETED WORKFLOWS:
- `backup-cron.yml` - **DELETED** ✅
- `keepalive-cron.yml` - **DELETED** ✅

## How to Test Your Workflows:

### 1. Test the Main Workflow (`daily-cron.yml`):
1. Go to your GitHub repository
2. Click on "Actions" tab
3. Find "Daily Cron Scheduler (MAIN)"
4. Click "Run workflow" button
5. Click "Run workflow" to execute

### 2. Test the Test Workflow (`test-cron.yml`):
1. Go to your GitHub repository
2. Click on "Actions" tab
3. Find "Test Cron Scheduler"
4. Click "Run workflow" button
5. Select "all" from the dropdown
6. Click "Run workflow" to execute

## Why This Setup is Perfect:

- **Only 2 workflows** - No confusion
- **Unified scheduler** - Both tasks run together
- **Easy testing** - Manual triggers available
- **Clean structure** - No redundant files

**Use `daily-cron.yml` for your daily tasks!** 🎉 