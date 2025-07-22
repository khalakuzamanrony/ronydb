/**
 * Simple utility to load environment variables from .env file
 */
import fs from 'fs';
import path from 'path';

export function loadEnvFile() {
  try {
    // Read the .env file
    const envPath = path.resolve(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Parse the .env file content
    const envVars = envContent.split('\n').reduce((acc, line) => {
      // Skip empty lines and comments
      if (!line || line.startsWith('#')) return acc;
      
      // Split by the first equals sign
      const equalIndex = line.indexOf('=');
      if (equalIndex === -1) return acc;
      
      const key = line.substring(0, equalIndex).trim();
      let value = line.substring(equalIndex + 1).trim();
      
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith('\'') && value.endsWith('\'')))
      {
        value = value.substring(1, value.length - 1);
      }
      
      // Set the environment variable
      process.env[key] = value;
      acc[key] = value;
      
      return acc;
    }, {} as Record<string, string>);
    
    console.log('Loaded environment variables:', Object.keys(envVars).join(', '));
    return envVars;
  } catch (error) {
    console.error('Error loading .env file:', error);
    return {};
  }
}