const CryptoJS = require('crypto-js');

/**
 * Gets the encryption key from environment variables
 * @returns {string} The encryption key
 */
const getEncryptionKey = () => {
  return process.env.VITE_ENCRYPTION_KEY || '';
};

/**
 * Encrypts data using AES encryption
 * @param {any} data Any data that can be stringified
 * @returns {string} Encrypted string
 */
const encryptData = (data) => {
  const dataString = typeof data === 'string' ? data : JSON.stringify(data);
  return CryptoJS.AES.encrypt(dataString, getEncryptionKey()).toString();
};

/**
 * Decrypts an encrypted string
 * @param {string} encryptedData The encrypted string
 * @returns {any} Decrypted data (parsed from JSON if possible)
 */
const decryptData = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, getEncryptionKey());
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

module.exports = {
  encryptData,
  decryptData
};