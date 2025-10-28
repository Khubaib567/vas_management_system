const crypto = require('crypto');

// Generate a 32-byte (256-bit) random token in hexadecimal format
const accessToken = crypto.randomBytes(32).toString('hex');

console.log('Access Token:', accessToken);
