/**
 * Script to migrate data from old encryption key to new encryption key
 * This script handles the complete migration process for both local and Supabase data
 */

import { createClient } from '@supabase/supabase-js';
import CryptoJS from 'crypto-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
function loadEnv(envPath) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    const envVars = {};
    envContent.split('\n').forEach(line => {
      const line_trim = line.trim();
      if (!line_trim || line_trim.startsWith('#')) return;
      
      const equalIndex = line_trim.indexOf('=');
      if (equalIndex === -1) return;
      
      const key = line_trim.substring(0, equalIndex).trim();
      let value = line_trim.substring(equalIndex + 1).trim();
      
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith('\'') && value.endsWith('\'')))
      {
        value = value.substring(1, value.length - 1);
      }
      
      envVars[key] = value;
    });
    
    return envVars;
  } catch (error) {
    console.error(`Error loading .env file from ${envPath}:`, error);
    return {};
  }
}

// Update .env file with new encryption key
function updateEnvFile(envPath, oldKey, newKey) {
  try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Replace the encryption key
    envContent = envContent.replace(
      `VITE_ENCRYPTION_KEY=${oldKey}`,
      `VITE_ENCRYPTION_KEY=${newKey}`
    );
    
    // Write the updated content back to the file
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log(`✅ Successfully updated encryption key in ${envPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error updating .env file at ${envPath}:`, error);
    return false;
  }
}

// Encryption/decryption functions
function decryptData(encryptedData, key) {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('❌ Decryption error:', error);
    return null;
  }
}

function encryptData(data, key) {
  const dataString = typeof data === 'string' ? data : JSON.stringify(data);
  return CryptoJS.AES.encrypt(dataString, key).toString();
}

// Main migration function
async function migrateEncryptionKey(oldKey, newKey, supabaseUrl, supabaseAnonKey) {
  try {
    console.log('🔄 Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    console.log('🔄 Fetching data from cv_data table...');
    const { data: cvData, error: cvError } = await supabase.from('cv_data').select('*');
    
    if (cvError) {
      console.error('❌ Error fetching cv_data:', cvError);
      return false;
    }
    
    if (!cvData || cvData.length === 0) {
      console.log('⚠️ No data found in cv_data table.');
    } else {
      console.log(`✅ Found ${cvData.length} records in cv_data table.`);
      
      // Process each record in cv_data
      for (const record of cvData) {
        console.log(`🔄 Processing cv_data record with ID: ${record.id}`);
        
        // Decrypt with old key
        const decryptedData = decryptData(record.data, oldKey);
        
        if (!decryptedData) {
          console.error(`❌ Failed to decrypt cv_data record with ID: ${record.id}. Skipping...`);
          continue;
        }
        
        // Encrypt with new key
        const newEncryptedData = encryptData(decryptedData, newKey);
        
        // Update the record
        const { error: updateError } = await supabase
          .from('cv_data')
          .update({ data: newEncryptedData })
          .eq('id', record.id);
        
        if (updateError) {
          console.error(`❌ Error updating cv_data record with ID: ${record.id}:`, updateError);
        } else {
          console.log(`✅ Successfully migrated cv_data record with ID: ${record.id}`);
        }
      }
    }
    
    console.log('🔄 Fetching data from backup-restore table...');
    const { data: backupData, error: backupError } = await supabase.from('backup-restore').select('*');
    
    if (backupError) {
      console.error('❌ Error fetching backup-restore:', backupError);
      return false;
    }
    
    if (!backupData || backupData.length === 0) {
      console.log('⚠️ No data found in backup-restore table.');
    } else {
      console.log(`✅ Found ${backupData.length} records in backup-restore table.`);
      
      // Process each record in backup-restore
      for (const backup of backupData) {
        console.log(`🔄 Processing backup-restore record with ID: ${backup.id}`);
        
        if (backup.data) {
          try {
            // Decrypt with old key
            const decryptedData = decryptData(backup.data, oldKey);
            
            if (!decryptedData) {
              console.error(`❌ Failed to decrypt backup-restore record with ID: ${backup.id}. Skipping...`);
              continue;
            }
            
            // Encrypt with new key
            const newEncryptedData = encryptData(decryptedData, newKey);
            
            // Update the record
            const { error: updateError } = await supabase
              .from('backup-restore')
              .update({ data: newEncryptedData })
              .eq('id', backup.id);
            
            if (updateError) {
              console.error(`❌ Error updating backup-restore record with ID: ${backup.id}:`, updateError);
            } else {
              console.log(`✅ Successfully migrated backup-restore record with ID: ${backup.id}`);
            }
          } catch (error) {
            console.error(`❌ Error processing backup-restore record with ID: ${backup.id}:`, error);
          }
        }
      }
    }
    
    console.log('✅ Migration completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return false;
  }
}

// Main execution
(async () => {
  console.log('🔄 Starting encryption key migration process...');
  
  // Load environment variables from root .env file
  const rootEnvPath = path.join(path.dirname(__dirname), '.env');
  const rootEnv = loadEnv(rootEnvPath);
  
  // Load environment variables from keepalive/.env file
  const keepaliveEnvPath = path.join(path.dirname(__dirname), 'keepalive', '.env');
  const keepaliveEnv = loadEnv(keepaliveEnvPath);
  
  // Get the old key from .env files
  const oldKey = rootEnv.VITE_ENCRYPTION_KEY;
  
  // Get the new key from command line arguments
  const newKey = process.env.NEW_ENCRYPTION_KEY;
  
  // Get Supabase credentials
  const supabaseUrl = rootEnv.VITE_SUPABASE_URL || keepaliveEnv.SUPABASE_URL;
  const supabaseAnonKey = rootEnv.VITE_SUPABASE_ANON_KEY || keepaliveEnv.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('Environment variables loaded:', {
    SUPABASE_URL: supabaseUrl ? '✓' : '✗',
    SUPABASE_KEY: supabaseAnonKey ? '✓' : '✗',
    OLD_ENCRYPTION_KEY: oldKey ? '✓' : '✗',
    NEW_ENCRYPTION_KEY: newKey ? '✓' : '✗'
  });
  
  // Validate required variables
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase credentials. Please check your .env files.');
    process.exit(1);
  }
  
  if (!oldKey) {
    console.error('❌ Could not find current encryption key in .env files.');
    process.exit(1);
  }
  
  if (!newKey) {
    console.error('❌ NEW_ENCRYPTION_KEY environment variable is required. Run with:');
    console.error('   NEW_ENCRYPTION_KEY=your_new_key_here node scripts/keyMigration.js');
    process.exit(1);
  }
  
  // Perform the migration
  const success = await migrateEncryptionKey(oldKey, newKey, supabaseUrl, supabaseAnonKey);
  
  if (success) {
    // Update .env files with the new key
    const rootUpdated = updateEnvFile(rootEnvPath, oldKey, newKey);
    const keepaliveUpdated = updateEnvFile(keepaliveEnvPath, oldKey, newKey);
    
    if (rootUpdated && keepaliveUpdated) {
      console.log('✅ All .env files updated successfully!');
    } else {
      console.log('⚠️ Some .env files could not be updated. Please update them manually:');
      if (!rootUpdated) console.log(`   - ${rootEnvPath}`);
      if (!keepaliveUpdated) console.log(`   - ${keepaliveEnvPath}`);
    }
    
    console.log('\n✅ Migration completed successfully! Please restart your application.');
  } else {
    console.error('\n❌ Migration failed. Please check the errors above and try again.');
    process.exit(1);
  }
})();