/**
 * Direct migration script with hardcoded environment variables
 * This is a temporary solution for running the migration
 */

// Set environment variables directly
process.env.VITE_SUPABASE_URL = 'https://xyzcompany.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
process.env.VITE_ENCRYPTION_KEY = '#%$RroinyaholoAllahrBanda83640*!';

// Import the migration function
import { runMigration } from '../src/utils/migrateToEncryption';

// Run the migration
console.log('Starting migration with direct environment variables...');
runMigration()
  .then(() => {
    console.log('Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });