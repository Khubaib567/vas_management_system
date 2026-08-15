const crypto = require('crypto');

// CONFIG ENVIRONMENT VARIABLES.
if(process.env.ENV !== "production"){
  require('dotenv').config({path : './.secrets/.env'})
}

/**
 * Decrypts data encrypted with the encryptWithRandomIV function.
 * 
 * @param {Object} encryptedData - The object returned by the encryption function.
 * @param {string} encryptedData.iv - The hex-encoded 12-byte initialization vector.
 * @param {string} encryptedData.ciphertext - The hex-encoded encrypted payload string.
 * @param {string} encryptedData.authTag - The hex-encoded 16-byte GCM authentication tag.
 * @param {string|Buffer} secretKey - The 32-byte secret key (as a hex string or Buffer).
 * @returns {any} The original plaintext data (string, object, number, etc.).
 */

const decryptWithRandomIV = ({ iv, ciphertext, authTag }) => {
    
    // console.log("Secret_Key: " , process.env.SECRET_KEY);
    const key = Buffer.from(process.env.SECRET_KEY, 'hex');

    const iv_v4 = Buffer.from(iv, 'hex');
    const authtag_v4 = Buffer.from(authTag, 'hex');
    const ciphertext_v4 = Buffer.from(ciphertext, 'hex');

    // Create decipher
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv_v4);

    // Set the auth tag *before* finalizing
    decipher.setAuthTag(authtag_v4);

    // Decrypt
    const decrypted = Buffer.concat([
        decipher.update(ciphertext_v4),
        decipher.final()
    ]);

    return decrypted.toString('utf8');

};


// Export using CommonJS syntax
module.exports = {
    decryptWithRandomIV
};
