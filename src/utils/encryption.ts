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

// Use the environment variable for the encryption key, fallback to a default key
const SECRET_KEY = getEnv('VITE_ENCRYPTION_KEY') || 'ronydb-default-encryption-key-2025';

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
  if (!encryptedData || typeof encryptedData !== 'string') {
    console.error('Invalid encrypted data:', encryptedData);
    return null;
  }
  
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedString) {
      console.error('Decryption resulted in empty string');
      return null;
    }
    
    // Try to parse as JSON, return as string if not valid JSON
    try {
      return JSON.parse(decryptedString);
    } catch {
      return decryptedString;
    }
  } catch (error) {
    // console.error('Decryption failed:', error);
    return null;
  }
};

/**
 * Encrypts sensitive user data for database storage
 * @param userData User data object
 * @returns Object with encrypted sensitive fields
 */
export const encryptUserData = (userData: any) => {
  return {
    ...userData,
    password_hash: encryptData(userData.password_hash),
    email: encryptData(userData.email),
    name: userData.name ? encryptData(userData.name) : null
  };
};

/**
 * Decrypts user data from database
 * @param encryptedUserData Encrypted user data from database
 * @returns Object with decrypted fields
 */
export const decryptUserData = (encryptedUserData: any) => {
  if (!encryptedUserData) {
    console.error('No encrypted user data provided');
    return null;
  }

  try {
    // console.log('Decrypting user data:', encryptedUserData);
    
    const result = {
      ...encryptedUserData,
      password_hash: encryptedUserData.password_hash ? decryptData(encryptedUserData.password_hash) : encryptedUserData.password_hash,
      email: encryptedUserData.email ? decryptData(encryptedUserData.email) : encryptedUserData.email,
      name: encryptedUserData.name ? decryptData(encryptedUserData.name) : encryptedUserData.name,
      role: encryptedUserData.role // role is not encrypted
    };

    // console.log('Decryption result:', result);

    // Check if decryption failed for critical fields (only for login validation)
    // For dashboard display, we can work with whatever we have
    if (result.email === null || result.password_hash === null) {
      console.log('Some fields failed to decrypt, but continuing...');
    }

    return result;
  } catch (error) {
    console.error('Error in decryptUserData:', error);
    return null;
  }
};

/**
 * Test function to verify encryption/decryption works correctly
 * Call this in browser console to test
 */
export const testEncryption = () => {
  console.log('🔐 Testing Encryption/Decryption...');
  
  // Test data
  const testUser = {
    email: 'test@example.com',
    password_hash: 'original_password_hash_123',
    name: 'Test User',
    role: 'admin'
  };
  
  console.log('📝 Original Data:', testUser);
  
  // Encrypt
  const encrypted = encryptUserData(testUser);
  console.log('🔒 Encrypted Data:', encrypted);
  
  // Decrypt
  const decrypted = decryptUserData(encrypted);
  console.log('🔓 Decrypted Data:', decrypted);
  
  // Verify
  const isValid = 
    decrypted.email === testUser.email &&
    decrypted.password_hash === testUser.password_hash &&
    decrypted.name === testUser.name;
    
  console.log(isValid ? '✅ Test PASSED' : '❌ Test FAILED');
  
  return { original: testUser, encrypted, decrypted, isValid };
};