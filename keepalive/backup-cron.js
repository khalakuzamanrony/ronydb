require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function getBDTimeString() {
  const now = new Date();
  // Convert to GMT+6 (Bangladesh Time)
  const bdTime = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  const date = bdTime.toISOString().slice(0, 10);
  const time = bdTime.toISOString().slice(11, 19);
  return `Backup created at ${date} + ${time} BD`;
}

async function backupAndPrune() {
  // 1. Fetch all data from cv_data
  const { data: cvData, error: fetchError } = await supabase
    .from('cv_data')
    .select('*');

  if (fetchError) {
    console.error('Failed to fetch cv_data:', fetchError.message);
    process.exit(1);
  }

  // 2. Insert backup into backup-restore table with BD time string
  const createdAt = getBDTimeString();
  const { error: insertError } = await supabase
    .from('backup-restore')
    .insert([{ data: cvData, created_at: createdAt }]);

  if (insertError) {
    console.error('Failed to insert backup:', insertError.message);
    process.exit(1);
  } else {
    console.log('Backup created:', createdAt);
  }

  // 3. Delete backups except the latest 2 (by id desc)
  const { data: backups, error: fetchBackupsError } = await supabase
    .from('backup-restore')
    .select('id,created_at')
    .order('id', { ascending: false });

  if (fetchBackupsError) {
    console.error('Failed to fetch backups:', fetchBackupsError.message);
    process.exit(1);
  }

  if (backups && backups.length > 2) {
    const idsToDelete = backups.slice(2).map(b => b.id);
    const { error: deleteError } = await supabase
      .from('backup-restore')
      .delete()
      .in('id', idsToDelete);
    if (deleteError) {
      console.error('Failed to delete old backups:', deleteError.message);
      process.exit(1);
    } else {
      console.log('Old backups deleted:', idsToDelete);
    }
  } else {
    console.log('No old backups to delete.');
  }
}

backupAndPrune(); 