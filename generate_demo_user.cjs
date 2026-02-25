require('dotenv').config({ path: './.env' });
const CryptoJS = require('crypto-js');

// Get encryption key from environment (same as the app uses)
const getEnv = (key) => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return '';
};

const SECRET_KEY = getEnv('VITE_ENCRYPTION_KEY') || 'ronydb-default-encryption-key-2025';

// Encrypt function (matches the app's encryptData)
const encryptData = (data) => {
  const dataString = typeof data === 'string' ? data : JSON.stringify(data);
  return CryptoJS.AES.encrypt(dataString, SECRET_KEY).toString();
};

// Generate demo user credentials
const demoEmail = 'khalekuzzamanrony3@gmail.com';
const demoPassword = 'admin123';
const demoName = 'Khalekuzzaman Rony';

// Hash password with SHA256 (same as login page)
const passwordHash = CryptoJS.SHA256(demoPassword).toString();

// Encrypt fields for database storage
const encryptedEmail = encryptData(demoEmail);
const encryptedPasswordHash = encryptData(passwordHash);
const encryptedName = encryptData(demoName);

console.log('==============================================');
console.log('Demo User Credentials for SQL Insert');
console.log('==============================================');
console.log(`Email: ${demoEmail}`);
console.log(`Password: ${demoPassword}`);
console.log(`Name: ${demoName}`);
console.log('');
console.log('--- SQL INSERT STATEMENT ---');
console.log(`INSERT INTO public.allowed_emails (email, password_hash, name, role) VALUES ('${encryptedEmail}', '${encryptedPasswordHash}', '${encryptedName}', 'admin');`);
console.log('');
console.log('--- Copy and paste the above INSERT into your SQL Editor ---');
console.log('==============================================');
