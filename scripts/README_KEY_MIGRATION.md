# Key Migration Script

## Overview

The `keyMigration.js` script is designed to safely migrate your encrypted data from an old encryption key to a new one. This script is essential when changing the encryption key in your application, as it ensures all data in Supabase remains accessible.

## How It Works

The script performs the following operations:

1. Loads environment variables from both the root `.env` file and the `keepalive/.env` file
2. Retrieves the old encryption key from the `.env` files
3. Gets the new encryption key from the command line arguments
4. Connects to Supabase using credentials from the `.env` files
5. Fetches all records from the `cv_data` table
6. Decrypts each record using the old key
7. Re-encrypts each record using the new key
8. Updates each record in Supabase
9. Repeats steps 5-8 for the `backup-restore` table
10. Updates both `.env` files with the new encryption key

## Prerequisites

Before running this script, ensure you have:

1. Node.js installed
2. Access to your Supabase database
3. Your current encryption key in the `.env` files
4. A new encryption key ready to use

## Usage

Run the script using npm with your new encryption key:

```bash
NEW_ENCRYPTION_KEY=your_new_key_here npm run migrate-key
```

Alternatively, you can run the script directly:

```bash
NEW_ENCRYPTION_KEY=your_new_key_here node scripts/keyMigration.js
```

## Important Notes

- **Always create a backup** before running this script
- The script will automatically update both `.env` files with the new key
- After running the script, verify that all your data is accessible
- This script should be run after changing the key in the Dashboard UI

## Troubleshooting

If you encounter issues:

1. Check that your old key is correct in the `.env` files
2. Verify your Supabase credentials
3. Ensure you have provided the new key as an environment variable
4. Check the console output for specific error messages

## Security Considerations

- Never commit your `.env` files to version control
- Keep backups of both your old and new keys until you're sure the migration is successful
- Use a secure method to store and share encryption keys

## Related Documentation

For a complete guide on changing your encryption key, refer to the `ENCRYPTION_KEY_CHANGE_PROCEDURE.md` file in the root directory.