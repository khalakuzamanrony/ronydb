# Scripts Directory

## Overview

This directory contains utility scripts for managing and maintaining the RonyDB application. These scripts are designed to help with various administrative tasks, data management, and system maintenance.

## Available Scripts

### loadEnv.ts

A utility module for loading environment variables from `.env` files. This module is used by other scripts to access configuration settings.

**Usage:**
```typescript
import { loadEnvFile } from './loadEnv';

const envVars = loadEnvFile();
console.log(envVars.SOME_VARIABLE);
```

## Running Scripts

Most scripts can be run using npm commands defined in the root `package.json` file. For example:

```bash
npm run migrate-encryption
```

Alternatively, you can run Node.js scripts directly:

```bash
node scripts/loadEnv.ts
```

For TypeScript scripts, you may need to use ts-node:

```bash
npx ts-node scripts/someScript.ts
```

## Adding New Scripts

When adding new scripts to this directory:

1. Follow the existing naming conventions
2. Add appropriate documentation
3. Update this README.md file with information about the new script
4. Add an npm script to package.json if the script will be used frequently

## Security Considerations

- Scripts that handle sensitive data (like encryption keys) should include appropriate security measures
- Never hardcode sensitive information in scripts
- Use environment variables for configuration
- Validate inputs to prevent injection attacks