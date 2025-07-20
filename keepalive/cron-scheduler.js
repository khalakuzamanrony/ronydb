require('dotenv').config();
const cron = require('node-cron');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function getGMT6ISOString() {
  const now = new Date();
  // Add 6 hours (6 * 60 * 60 * 1000 ms)
  const gmt6 = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  return gmt6.toISOString();
}

function getBDTimeString() {
  const now = new Date();
  // Convert to GMT+6 (Bangladesh Time)
  const bdTime = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  const date = bdTime.toISOString().slice(0, 10);
  const time = bdTime.toISOString().slice(11, 19);
  return `Backup created at ${date} + ${time} BD`;
}

async function updateKeepalive() {
  const gmt6Time = getGMT6ISOString();
  const message = `updated at ${gmt6Time}`;
  const { error } = await supabase
    .from('keepalive')
    .upsert([{ id: 'main', updated: message }], { onConflict: ['id'] });

  if (error) {
    console.error('Failed to update keepalive:', error.message);
  } else {
    console.log('keepalive updated @', gmt6Time);
  }
}

async function backupAndPrune() {
  try {
    // 1. Fetch all data from cv_data
    const { data: cvData, error: fetchError } = await supabase
      .from('cv_data')
      .select('*');

    if (fetchError) {
      console.error('Failed to fetch cv_data:', fetchError.message);
      return;
    }

    // 2. Get current backups to determine new backup number
    const { data: currentBackups, error: fetchBackupsError } = await supabase
      .from('backup-restore')
      .select('id,backup_number,created_at')
      .order('backup_number', { ascending: true });

    if (fetchBackupsError) {
      console.error('Failed to fetch current backups:', fetchBackupsError.message);
      return;
    }

    // 3. Calculate new backup number (0 for latest)
    const newBackupNumber = 0;
    
    // 4. Shift existing backup numbers (increment all by 1)
    if (currentBackups && currentBackups.length > 0) {
      const updatePromises = currentBackups.map(backup => 
        supabase
          .from('backup-restore')
          .update({ backup_number: backup.backup_number + 1 })
          .eq('id', backup.id)
      );
      
      await Promise.all(updatePromises);
      console.log('Shifted existing backup numbers');
    }

    // 5. Insert new backup with number 0 (latest)
    const createdAt = getBDTimeString();
    const { error: insertError } = await supabase
      .from('backup-restore')
      .insert([{ 
        data: cvData, 
        created_at: createdAt,
        backup_number: newBackupNumber
      }]);

    if (insertError) {
      console.error('Failed to insert backup:', insertError.message);
      return;
    } else {
      console.log('Backup created:', createdAt, '(backup_number: 0)');
    }

    // 6. Delete backups with backup_number >= 3 (keep only 0, 1, 2)
    const { error: deleteError } = await supabase
      .from('backup-restore')
      .delete()
      .gte('backup_number', 3);

    if (deleteError) {
      console.error('Failed to delete old backups:', deleteError.message);
    } else {
      // Get final state to show what was kept
      const { data: finalBackups, error: finalError } = await supabase
        .from('backup-restore')
        .select('id,backup_number,created_at')
        .order('backup_number', { ascending: true });

      if (!finalError && finalBackups) {
        console.log('Kept backups:', finalBackups.map(b => 
          `#${b.backup_number} (${b.created_at})`
        ));
      }
    }

  } catch (error) {
    console.error('Error in backupAndPrune:', error.message);
  }
}

async function dailyTask() {
  console.log('Starting daily cron task at', new Date().toISOString());
  
  // Run keepalive update
  await updateKeepalive();
  
  // Run backup and prune
  await backupAndPrune();
  
  console.log('Daily cron task completed at', new Date().toISOString());
}

// Schedule the task to run daily at 12:00 PM BST (GMT+6)
// Since we're running this in a server that might be in a different timezone,
// we'll schedule it for 6:00 AM UTC (which is 12:00 PM BST)
const cronExpression = '0 6 * * *'; // Every day at 6:00 AM UTC (12:00 PM BST)

console.log('Starting cron scheduler...');
console.log('Scheduled to run daily at 12:00 PM BST (6:00 AM UTC)');

// Start the cron job
cron.schedule(cronExpression, dailyTask, {
  scheduled: true,
  timezone: "UTC"
});

// Also run once immediately for testing
console.log('Running initial task for testing...');
dailyTask();

console.log('Cron scheduler is running. Press Ctrl+C to stop.'); 