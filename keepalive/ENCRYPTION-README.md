# Backup Encryption Implementation

## Overview

This document describes the encryption implementation for the daily backup process that stores CV data in the `backup-restore` table in Supabase.

## Implementation Details

### Encryption Utility

A standalone encryption utility (`encryptionUtils.js`) has been created specifically for the keepalive scripts. This utility:

- Uses the `crypto-js` library for AES encryption
- Retrieves the encryption key from environment variables
- Provides `encryptData` and `decryptData` functions

### Environment Configuration

The encryption key is stored in the `.env` file in the keepalive directory:

```
SUPABASE_URL=https://zbshwdeudpcopkahgvzu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_ENCRYPTION_KEY=#%$RroinyaholoAllahrBanda83640*!!
```

### Backup Process

The backup process is implemented in two scripts:

1. `cron-scheduler.js` - Runs daily via a cron job
2. `run-once.js` - Can be run manually to create a backup

Both scripts:

1. Fetch all data from the `cv_data` table
2. Encrypt the data using the `encryptData` function
3. Store the encrypted data in the `backup-restore` table
4. Maintain a rotation of backups (keeping only the 3 most recent)

## Security Considerations

- The encryption key is stored in the `.env` file, which should be kept secure and not committed to version control
- The backup data is encrypted before being stored in the database
- The same encryption key is used for both the main application and the backup process

## Testing

To test the backup process manually, run:

```bash
cd keepalive
node run-once.js
```

This will create a new backup with the current data from the `cv_data` table.