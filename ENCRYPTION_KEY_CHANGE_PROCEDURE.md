# Secret Procedure for Changing the Encryption Key

## Overview

This document outlines the step-by-step procedure for changing the `VITE_ENCRYPTION_KEY` in your `.env` file. Since your data is encrypted with the current key, changing it requires a careful migration process to ensure your data remains accessible in both local and GitHub environments.

## Prerequisites

- Backup your database before proceeding
- Ensure you have Node.js installed
- Have both the old and new encryption keys available

## Step-by-Step Procedure

### 1. Create a Backup (Automatic)

When you change the key through the Dashboard > Backup-Restore tab, a backup is automatically created before the key change process begins.

### 2. Change the Key in the Dashboard

1. Navigate to the Dashboard > Backup-Restore tab
2. Scroll down to the "Change Secret Key" section
3. Click the "Change Key" button
4. Enter your new encryption key
5. Click "Change Key" to apply the change

### 3. Run the Migration Script

After changing the key in the Dashboard, you **MUST** run the migration script to update all data in Supabase and update the `.env` files:

```bash
# Run the migration script with your new key
NEW_ENCRYPTION_KEY=your_new_key_here npm run migrate-key
```

This script will:
1. Fetch all data from Supabase (both `cv_data` and `backup-restore` tables)
2. Decrypt the data using the old key
3. Re-encrypt the data using the new key
4. Update the data in Supabase
5. Update both `.env` files with the new key

### 4. Verify the Changes

After running the migration script, verify that:

1. Both `.env` files have been updated with the new key:
   - Root directory `.env` file
   - `keepalive/.env` file
2. You can log in successfully
3. All your CV data is accessible and displays correctly
4. You can save new data and it's properly encrypted with the new key
5. Backups are accessible and can be restored

### 5. Commit and Push Changes

After verifying that everything works correctly, commit and push the changes to GitHub:

```bash
git add .
git commit -m "Update encryption key"
git push
```

## Troubleshooting

If you encounter issues during the migration:

1. **Data Not Decrypting**: Ensure your old key is correct in the `.env` files
2. **Database Connection Issues**: Check your Supabase credentials
3. **Script Errors**: Check the console output for specific error messages

If you need to restore from a backup:

1. Navigate to Dashboard > Backup-Restore
2. Click "Show Backups"
3. Find the backup created before the key change
4. Click the restore button

## Important Notes

- The key change process involves two steps: changing the key in the Dashboard UI and running the migration script
- The Dashboard UI change only affects the current session and the main data record
- The migration script is required to update all backups and `.env` files
- Always test thoroughly after the migration to ensure your data remains accessible
- Never commit your `.env` file to version control

## Security Considerations

- Keep backups of both your old and new keys until you're sure the migration is successful
- Consider using a secure password manager for storing your encryption keys
- Use a strong, unique encryption key that is not used elsewhere

## Conclusion

Changing your encryption key requires careful planning and execution. Always follow this procedure to ensure your data remains accessible and secure after the key change.