/**
 * Migration script to encrypt existing data in the database
 * Run this once to convert all unencrypted data to encrypted format
 */

import { supabase } from './supabaseClient';
import { encryptData } from './encryption';
import { defaultCVData } from './cvData';

export const migrateToEncryption = async (): Promise<void> => {
  try {
    console.log('Starting migration to encrypted data...');
    
    // 1. Fetch current data
    const { data, error } = await supabase
      .from('cv_data')
      .select('id, data')
      .eq('id', 'main')
      .single();
    
    if (error) {
      console.error('Error fetching data for migration:', error);
      return;
    }
    
    if (!data?.data) {
      console.log('No data found to migrate');
      return;
    }
    
    // 2. Check if data is already a string (might already be encrypted)
    if (typeof data.data === 'string') {
      console.log('Data appears to already be encrypted (string format)');
      return;
    }
    
    // 3. Encrypt the data
    const encryptedData = encryptData(data.data);
    
    // 4. Save the encrypted data back
    const { error: updateError } = await supabase
      .from('cv_data')
      .update({ data: encryptedData })
      .eq('id', 'main');
    
    if (updateError) {
      console.error('Error updating with encrypted data:', updateError);
      return;
    }
    
    console.log('Migration to encrypted data completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
};

// Function to run the migration
export const runMigration = async (): Promise<void> => {
  console.log('Starting encryption migration process...');
  await migrateToEncryption();
  console.log('Encryption migration process completed.');
};