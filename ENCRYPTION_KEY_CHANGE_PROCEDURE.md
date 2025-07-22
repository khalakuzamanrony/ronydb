# Secret Procedure for Changing the Encryption Key

## Overview

This document outlines the step-by-step procedure for changing the `VITE_ENCRYPTION_KEY` in your `.env` file. Since your data is now encrypted with the current key, changing it requires a careful migration process to ensure your data remains accessible.

## Prerequisites

- Backup your database before proceeding
- Ensure your application is not running during the migration
- Have both the old and new encryption keys available

## Step-by-Step Procedure

### 1. Create a Backup

```bash
# Export your current data as a backup
# You can use Supabase dashboard to export your data or use their API
```

### 2. Create a Migration Script

Create a new file called `scripts/keyMigration.js` with the following content:

```javascript
/**
 * Script to migrate data from old encryption key to new encryption key
 */

import { createClient } from '@supabase/supabase-js';
import CryptoJS from 'crypto-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define your old and new keys
const OLD_KEY = process.env.OLD_ENCRYPTION_KEY;
const NEW_KEY = process.env.NEW_ENCRYPTION_KEY;

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

// If old key not provided as environment variable, use the one from .env
if (!OLD_KEY) {
  process.env.OLD_ENCRYPTION_KEY = env.VITE_ENCRYPTION_KEY;
}

// If new key not provided, exit
if (!NEW_KEY) {
  console.error('NEW_ENCRYPTION_KEY environment variable is required');
  process.exit(1);
}

console.log('Environment variables loaded:', {
  SUPABASE_URL: SUPABASE_URL ? '✓' : '✗',
  SUPABASE_ANON_KEY: SUPABASE_ANON_KEY ? '✓' : '✗',
  OLD_ENCRYPTION_KEY: process.env.OLD_ENCRYPTION_KEY ? '✓' : '✗',
  NEW_ENCRYPTION_KEY: NEW_KEY ? '✓' : '✗'
});

// Check if environment variables are set
if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !process.env.OLD_ENCRYPTION_KEY || !NEW_KEY) {
  console.error('Missing required environment variables. Please check your .env file.');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Encryption/decryption functions
function decryptData(encryptedData, key) {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

function encryptData(data, key) {
  const dataString = typeof data === 'string' ? data : JSON.stringify(data);
  return CryptoJS.AES.encrypt(dataString, key).toString();
}

// Main migration function
async function migrateEncryptionKey() {
  try {
    console.log('Fetching data from Supabase...');
    const { data, error } = await supabase.from('cv_data').select('*');
    
    if (error) {
      console.error('Error fetching data:', error);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('No data found to migrate.');
      return;
    }
    
    console.log(`Found ${data.length} records to migrate.`);
    
    // Process each record
    for (const record of data) {
      console.log(`Processing record with ID: ${record.id}`);
      
      // Decrypt with old key
      const decryptedData = decryptData(record.data, process.env.OLD_ENCRYPTION_KEY);
      
      if (!decryptedData) {
        console.error(`Failed to decrypt record with ID: ${record.id}. Skipping...`);
        continue;
      }
      
      // Encrypt with new key
      const newEncryptedData = encryptData(decryptedData, NEW_KEY);
      
      // Update the record
      const { error: updateError } = await supabase
        .from('cv_data')
        .update({ data: newEncryptedData })
        .eq('id', record.id);
      
      if (updateError) {
        console.error(`Error updating record with ID: ${record.id}:`, updateError);
      } else {
        console.log(`Successfully migrated record with ID: ${record.id}`);
      }
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run the migration
migrateEncryptionKey();
```

### 3. Add a Script to package.json

Add the following script to your `package.json` file:

```json
"scripts": {
  // ... existing scripts
  "migrate-key": "NEW_ENCRYPTION_KEY=your_new_key_here node scripts/keyMigration.js"
}
```

### 4. Stop Your Application

Ensure your application is not running during the migration process.

### 5. Run the Migration Script

```bash
# Run the migration script with your new key
npm run migrate-key
```

### 6. Update Your .env File

After the migration is successful, update your `.env` file with the new encryption key:

```
VITE_ENCRYPTION_KEY=your_new_key_here
```

### 7. Test Your Application

Start your application and verify that:

1. You can log in successfully
2. All your CV data is accessible and displays correctly
3. You can save new data and it's properly encrypted with the new key

### 8. Clean Up

Once you've confirmed everything is working correctly:

1. Remove the `keyMigration.js` script or keep it for future migrations
2. Secure your `.env` file
3. Consider updating any documentation about your encryption key

## Troubleshooting

If you encounter issues during the migration:

1. **Data Not Decrypting**: Ensure your old key is correct
2. **Database Connection Issues**: Check your Supabase credentials
3. **Script Errors**: Check the console output for specific error messages

## Security Considerations

- Never commit your `.env` file to version control
- Keep backups of both your old and new keys until you're sure the migration is successful
- Consider using a secure password manager for storing your encryption keys

## Conclusion

Changing your encryption key requires careful planning and execution. Always test thoroughly after the migration to ensure your data remains accessible and secure.