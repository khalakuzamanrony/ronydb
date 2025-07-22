import CryptoJS from 'crypto-js';

// Handle both Vite and Node.js environments
const getEnv = (key: string): string => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key] as string;
  }
  return '';
};

// Use the environment variable for the encryption key
const SECRET_KEY = getEnv('VITE_ENCRYPTION_KEY');

/**
 * Encrypts data using AES encryption
 * @param data Any data that can be stringified
 * @returns Encrypted string
 */
export const encryptData = (data: any): string => {
  const dataString = typeof data === 'string' ? data : JSON.stringify(data);
  return CryptoJS.AES.encrypt(dataString, SECRET_KEY).toString();
};

/**
 * Decrypts an encrypted string
 * @param encryptedData The encrypted string
 * @returns Decrypted data (parsed from JSON if possible)
 */
export const decryptData = (encryptedData: string): any => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    
    // Try to parse as JSON, return as string if not valid JSON
    try {
      return JSON.parse(decryptedString);
    } catch {
      return decryptedString;
    }
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};