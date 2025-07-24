// Simple Encryption/Decryption Test Tool
// Save this file as simple-encryption-test.cjs in your test directory
// Run with: npm run decrypt

// ===== CONFIGURATION =====
// 1. Paste your encrypted string below (replace the empty string)
const ENCRYPTED_STRING = "";

// 2. Paste your encryption key below (replace the empty string)
const ENCRYPTION_KEY = "";

// ===== NO NEED TO EDIT BELOW THIS LINE =====
const CryptoJS = require('crypto-js');

console.log('🔐 Simple Encryption Test Tool');
console.log('=============================\n');

// Check if encrypted string is provided
if (!ENCRYPTED_STRING) {
  console.log('❌ No encrypted string provided. Please edit the file and add your encrypted string.');
  process.exit(1);
}

// Check if encryption key is provided
if (!ENCRYPTION_KEY) {
  console.log('❌ No encryption key provided. Please edit the file and add your encryption key.');
  process.exit(1);
}

// Function to decrypt data
function decrypt(encryptedData, key) {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decrypted) {
      return { success: false, error: 'Decryption failed - empty result' };
    }
    
    // Try to parse as JSON, otherwise return as string
    try {
      return { success: true, data: JSON.parse(decrypted) };
    } catch {
      return { success: true, data: decrypted };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Test decryption with empty key (should fail for secure encryption)
console.log('🔍 Testing with empty key...');
const emptyKeyResult = decrypt(ENCRYPTED_STRING, '');
console.log(`   ${emptyKeyResult.success ? '✅ Decrypted with empty key (INSECURE!)' : '❌ Failed to decrypt with empty key (SECURE!)'}`);

// Test decryption with actual key
console.log('\n🔑 Testing with provided key...');
const result = decrypt(ENCRYPTED_STRING, ENCRYPTION_KEY);

if (result.success) {
  console.log('✅ Successfully decrypted!');
  console.log('\n📝 Decrypted data:');
  console.log('-----------------');
  
  // Pretty print if it's an object
  if (typeof result.data === 'object' && result.data !== null) {
    console.log(JSON.stringify(result.data, null, 2));
  } else {
    console.log(result.data);
  }
} else {
  console.log('❌ Decryption failed!');
  console.log('   Error:', result.error);
  console.log('\nPossible issues:');
  console.log('1. Incorrect encryption key');
  console.log('2. Corrupted or invalid encrypted string');
  console.log('3. Mismatched encryption/decryption methods');
}

console.log('\n🔍 Test complete!');
