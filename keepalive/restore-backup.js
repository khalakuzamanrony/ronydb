require('dotenv').config({ path: './.env' });
const { createClient } = require('@supabase/supabase-js');
const { decryptData } = require('./encryptionUtils');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Lists all available backups from the backup-restore table
 */
async function listBackups() {
  try {
    const { data: backups, error } = await supabase
      .from('backup-restore')
      .select('id, backup_number, created_at')
      .order('backup_number', { ascending: true });

    if (error) {
      console.error('Failed to fetch backups:', error.message);
      return;
    }

    if (!backups || backups.length === 0) {
      console.log('No backups found.');
      return;
    }

    console.log('\nAvailable backups:');
    console.log('----------------');
    backups.forEach(backup => {
      console.log(`ID: ${backup.id} | Backup #${backup.backup_number} | Created: ${backup.created_at}`);
    });
    console.log('----------------');
    console.log('To restore a backup, run: node restore-backup.js <backup_id>');
    console.log('To restore and save to file, run: node restore-backup.js <backup_id> --save');
  } catch (error) {
    console.error('Error listing backups:', error.message);
  }
}

/**
 * Restores a backup by ID and optionally saves it to a file
 * @param {string} backupId - The ID of the backup to restore
 * @param {boolean} saveToFile - Whether to save the decrypted data to a file
 */
async function restoreBackup(backupId, saveToFile = false) {
  try {
    // Fetch the backup by ID
    const { data: backup, error } = await supabase
      .from('backup-restore')
      .select('*')
      .eq('id', backupId)
      .single();

    if (error) {
      console.error(`Failed to fetch backup with ID ${backupId}:`, error.message);
      return;
    }

    if (!backup) {
      console.error(`No backup found with ID ${backupId}`);
      return;
    }

    console.log(`Restoring backup #${backup.backup_number} created at ${backup.created_at}...`);

    // Decrypt the backup data
    const decryptedData = decryptData(backup.data);
    if (!decryptedData) {
      console.error('Failed to decrypt backup data. Check your encryption key.');
      return;
    }

    // If requested, save to file
    if (saveToFile) {
      const now = new Date();
      // Convert to GMT+6 (Bangladesh Time)
      const bdTime = new Date(now.getTime() + 6 * 60 * 60 * 1000);
      const date = bdTime.toISOString().slice(0, 10);
      const time = bdTime.toISOString().slice(11, 19).replace(/:/g, '-');
      const filename = `ronydb_restored_backup_${date}_${time}_BD.json`;
      const filePath = path.join(__dirname, filename);
      
      fs.writeFileSync(filePath, JSON.stringify(decryptedData, null, 2));
      console.log(`Backup saved to file: ${filePath}`);
    }

    // Restore to cv_data table
    console.log('Restoring data to cv_data table...');
    
    // For each record in the decrypted data, update the cv_data table
    for (const record of decryptedData) {
      const { error: updateError } = await supabase
        .from('cv_data')
        .upsert([record], { onConflict: ['id'] });

      if (updateError) {
        console.error(`Failed to restore record with ID ${record.id}:`, updateError.message);
      } else {
        console.log(`Successfully restored record with ID ${record.id}`);
      }
    }

    console.log('Restore operation completed.');
  } catch (error) {
    console.error('Error restoring backup:', error.message);
  }
}

// Main execution
(async () => {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // No arguments, just list backups
    await listBackups();
  } else {
    const backupId = args[0];
    const saveToFile = args.includes('--save');
    await restoreBackup(backupId, saveToFile);
  }
})();