/**
 * Standalone script to encrypt data in Supabase
 * This script doesn't rely on any of the existing codebase
 */

// Import required libraries
import { createClient } from '@supabase/supabase-js';
import CryptoJS from 'crypto-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
function loadEnv() {
  try {
    const envPath = path.join(path.dirname(__dirname), '.env');
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
    console.error('Error loading .env file:', error);
    return {};
  }
}

// Load environment variables
const env = loadEnv();
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY;
const ENCRYPTION_KEY = env.VITE_ENCRYPTION_KEY;

console.log('Environment variables loaded:', {
  SUPABASE_URL: SUPABASE_URL ? '✓' : '✗',
  SUPABASE_ANON_KEY: SUPABASE_ANON_KEY ? '✓' : '✗',
  ENCRYPTION_KEY: ENCRYPTION_KEY ? '✓' : '✗'
});

// Check if environment variables are set
if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !ENCRYPTION_KEY) {
  console.error('Missing required environment variables. Please check your .env file.');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Encryption functions
function encryptData(data) {
  const dataString = typeof data === 'string' ? data : JSON.stringify(data);
  return CryptoJS.AES.encrypt(dataString, ENCRYPTION_KEY).toString();
}

function decryptData(encryptedData) {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

// Function to check if data is already encrypted
function isEncrypted(data) {
  if (typeof data !== 'string') return false;
  
  try {
    // Try to decrypt it
    const bytes = CryptoJS.AES.decrypt(data, ENCRYPTION_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    JSON.parse(decryptedString); // This will throw an error if not valid JSON
    return true;
  } catch (error) {
    return false;
  }
}

// Main migration function
async function migrateData() {
  try {
    console.log('Fetching data from Supabase...');
    const { data, error } = await supabase.from('cv_data').select('*').eq('id', 'main');
    
    if (error) {
      console.error('Error fetching data:', error);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('No data found to migrate.');
      return;
    }
    
    const record = data[0];
    console.log('Found record with ID:', record.id);
    
    // Check if data is already encrypted
    if (typeof record.data === 'string' && isEncrypted(record.data)) {
      console.log('Data is already encrypted. No migration needed.');
      return;
    }
    
    // Encrypt the data
    console.log('Encrypting data...');
    const encryptedData = encryptData(record.data);
    
    // Update the record with encrypted data
    console.log('Updating record with encrypted data...');
    const { error: updateError } = await supabase
      .from('cv_data')
      .update({ data: encryptedData })
      .eq('id', 'main');
    
    if (updateError) {
      console.error('Error updating data:', updateError);
      return;
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run the migration
migrateData();