# Backup Restore Functionality

## Overview

This document describes how to restore encrypted backups from the `backup-restore` table in Supabase. The backup system automatically creates encrypted backups of your CV data, and this restore functionality allows you to recover data from these backups when needed.

## Restore Script

A dedicated restore script (`restore-backup.js`) has been created to handle the restoration process. This script:

- Lists all available backups in the `backup-restore` table
- Allows you to restore a specific backup by ID
- Can save the decrypted backup data to a file
- Restores the data to the `cv_data` table

## Usage

### Listing Available Backups

To see all available backups:

```bash
cd keepalive
npm run list-backups
```

This will display a list of all backups with their IDs, backup numbers, and creation dates.

### Restoring a Backup

To restore a specific backup:

```bash
cd keepalive
npm run restore -- <backup_id>
```

Replace `<backup_id>` with the ID of the backup you want to restore.

### Saving Backup to File

To restore a backup and also save it to a file:

```bash
cd keepalive
node restore-backup.js <backup_id> --save
```

This will restore the backup to the `cv_data` table and also save the decrypted data to a JSON file in the `keepalive` directory.

## How It Works

1. The script connects to Supabase using the credentials in your `.env` file
2. It fetches the encrypted backup data from the `backup-restore` table
3. It decrypts the data using the encryption key from your `.env` file
4. It restores the decrypted data to the `cv_data` table
5. If requested, it also saves the decrypted data to a JSON file

## Security Considerations

- The backup data is encrypted in the database and only decrypted during the restore process
- The encryption key is stored in your `.env` file and should be kept secure
- The decrypted data is only stored in memory during the restore process, unless you use the `--save` option
- If you save the decrypted data to a file, make sure to secure or delete the file after use

## Troubleshooting

If you encounter issues during the restore process:

1. **Decryption Errors**: Ensure your encryption key in the `.env` file is correct
2. **Database Connection Issues**: Check your Supabase credentials
3. **No Backups Found**: Verify that backups have been created using the backup process
4. **Restore Failures**: Check the console output for specific error messages

## Example Workflow

1. List all available backups: `npm run list-backups`
2. Identify the backup you want to restore (e.g., ID: 123)
3. Restore the backup: `npm run restore -- 123`
4. Verify that the data has been restored correctly