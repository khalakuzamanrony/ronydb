require('dotenv').config({ path: '../.env' });
const CryptoJS = require('crypto-js');

// Get encryption key from environment (same as the app uses)
const getEnv = (key) => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return '';
};

const SECRET_KEY = getEnv('VITE_ENCRYPTION_KEY') || 'ronydb-default-encryption-key-2025';

console.log('Using encryption key:', SECRET_KEY.substring(0, 10) + '...');

// Encrypt function
const encryptData = (data) => {
  const dataString = typeof data === 'string' ? data : JSON.stringify(data);
  return CryptoJS.AES.encrypt(dataString, SECRET_KEY).toString();
};

// Decrypt function (matches app's decryptData)
const decryptData = (encryptedData) => {
  if (!encryptedData || typeof encryptedData !== 'string') {
    return null;
  }
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedString) return null;
    try {
      return JSON.parse(decryptedString);
    } catch {
      return decryptedString;
    }
  } catch (error) {
    return null;
  }
};

// Demo user credentials
const demoEmail = 'khalekuzzamanrony3@gmail.com';
const demoPassword = 'admin123';
const demoName = 'Khalekuzzaman Rony';

// Hash password with SHA256 (same as login page)
const passwordHash = CryptoJS.SHA256(demoPassword).toString();

console.log('\n=== Password Hash Test ===');
console.log('Password:', demoPassword);
console.log('SHA256 Hash:', passwordHash);

// Encrypt fields for database storage
const encryptedEmail = encryptData(demoEmail);
const encryptedPasswordHash = encryptData(passwordHash);
const encryptedName = encryptData(demoName);

console.log('\n=== Encrypted Values ===');
console.log('Encrypted Email:', encryptedEmail);
console.log('Encrypted Password Hash:', encryptedPasswordHash);
console.log('Encrypted Name:', encryptedName);

// Test decryption (simulating login flow)
console.log('\n=== Decryption Test (Login Simulation) ===');
const decryptedEmail = decryptData(encryptedEmail);
const decryptedPasswordHash = decryptData(encryptedPasswordHash);
const decryptedName = decryptData(encryptedName);

console.log('Decrypted Email:', decryptedEmail);
console.log('Decrypted Password Hash:', decryptedPasswordHash);
console.log('Decrypted Name:', decryptedName);

// Verify
console.log('\n=== Verification ===');
console.log('Email match:', decryptedEmail === demoEmail);
console.log('Password hash match:', decryptedPasswordHash === passwordHash);

if (decryptedEmail === demoEmail && decryptedPasswordHash === passwordHash) {
  console.log('\n✅ SUCCESS: Encryption/Decryption working correctly!');
} else {
  console.log('\n❌ FAILED: Something is wrong with encryption/decryption');
}

console.log('\n=== SQL INSERT STATEMENT ===');
console.log(`INSERT INTO public.allowed_emails (email, password_hash, name, role) VALUES `);
console.log(`('${encryptedEmail}', '${encryptedPasswordHash}', '${encryptedName}', 'admin');`);
