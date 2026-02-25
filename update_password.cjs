require('dotenv').config({ path: '../.env' });
const CryptoJS = require('crypto-js');

const getEnv = (key) => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return '';
};

const SECRET_KEY = getEnv('VITE_ENCRYPTION_KEY') || 'ronydb-default-encryption-key-2025';

const encryptData = (data) => {
  const dataString = typeof data === 'string' ? data : JSON.stringify(data);
  return CryptoJS.AES.encrypt(dataString, SECRET_KEY).toString();
};

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

// Demo user credentials with new password
const demoEmail = 'khalekuzzamanrony3@gmail.com';
const demoPassword = '#Rony7669!';
const demoName = 'Khalekuzzaman Rony';

// Hash password with SHA256
const passwordHash = CryptoJS.SHA256(demoPassword).toString();

console.log('=== New Credentials ===');
console.log('Email:', demoEmail);
console.log('Password:', demoPassword);
console.log('SHA256 Hash:', passwordHash);

// Encrypt fields
const encryptedEmail = encryptData(demoEmail);
const encryptedPasswordHash = encryptData(passwordHash);
const encryptedName = encryptData(demoName);

console.log('\n=== Encrypted Values ===');
console.log('Email:', encryptedEmail);
console.log('Password Hash:', encryptedPasswordHash);
console.log('Name:', encryptedName);

// Verify decryption works
const decEmail = decryptData(encryptedEmail);
const decPass = decryptData(encryptedPasswordHash);
const decName = decryptData(encryptedName);

console.log('\n=== Verification ===');
console.log('Decrypted Email:', decEmail, '| Match:', decEmail === demoEmail);
console.log('Decrypted Hash:', decPass, '| Match:', decPass === passwordHash);
console.log('Decrypted Name:', decName, '| Match:', decName === demoName);

console.log('\n=== SQL INSERT ===');
console.log(`INSERT INTO public.allowed_emails (email, password_hash, name, role) VALUES `);
console.log(`('${encryptedEmail}', '${encryptedPasswordHash}', '${encryptedName}', 'admin');`);
