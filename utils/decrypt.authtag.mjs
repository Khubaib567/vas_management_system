// const crypto = require('crypto');
import crypto from 'node:crypto';
import { config } from 'dotenv';


// CONFIG ENVIRONMENT VARIABLES.
if(process.env.ENV !== "production"){
  config({path : './.secrets/.env'})
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

export const decryptWithRandomIV = ( userPayload ) => {
    
    console.log("Secret_Key: " , userPayload);
    const key = Buffer.from(process.env.SECRET_KEY, 'hex');

    const iv_v4 = Buffer.from(userPayload.iv, 'hex');
    const authtag_v4 = Buffer.from(userPayload.authTag, 'hex');
    const ciphertext_v4 = Buffer.from(userPayload.ciphertext, 'hex');

    // Create decipher
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv_v4);

    // console.log("Decipher: " , decipher);

    // Set the auth tag *before* finalizing
    decipher.setAuthTag(authtag_v4);

    // Decrypt
    const decrypted = Buffer.concat([
        decipher.update(ciphertext_v4),
        decipher.final()
    ]);

    // console.log("Decrypt Data: " , decrypted);

    return decrypted.toString('utf8');

};


// Export using CommonJS syntax
// module.exports = {
//     decryptWithRandomIV
// };
