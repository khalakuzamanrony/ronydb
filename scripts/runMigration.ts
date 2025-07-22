/**
 * Script to run the data encryption migration
 * 
 * Usage: 
 * npm run migrate-encryption
 */

// Import our custom environment loader
import { loadEnvFile } from './loadEnv';

// Load environment variables from .env file
const envVars = loadEnvFile();

// Log the loaded environment variables (without showing the actual values for security)
console.log('Environment variables loaded:', {
  VITE_SUPABASE_URL: envVars.VITE_SUPABASE_URL ? '✓' : '✗',
  VITE_SUPABASE_ANON_KEY: envVars.VITE_SUPABASE_ANON_KEY ? '✓' : '✗',
  VITE_ENCRYPTION_KEY: envVars.VITE_ENCRYPTION_KEY ? '✓' : '✗'
});

import { runMigration } from '../src/utils/migrateToEncryption';

// Run the migration
runMigration()
  .then(() => {
    console.log('Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });