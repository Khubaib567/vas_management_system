const crypto = require('crypto');

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
const decryptWithRandomIV = ({ iv, ciphertext, authTag }, secretKey) => {
    // 1. Automatically convert hex string key into a Buffer if needed
    let keyBuffer = secretKey;
    if (typeof secretKey === 'string') {
        keyBuffer = Buffer.from(secretKey, 'hex');
    }

    // 2. Validate Key Length for AES-256 (32 bytes)
    if (!Buffer.isBuffer(keyBuffer) || keyBuffer.length !== 32) {
        throw new Error("Secret key must be a 32-byte Buffer.");
    }

    // 3. Convert input hex strings back into binary Buffers
    const ivBuffer = Buffer.from(iv, 'hex');
    const authTagBuffer = Buffer.from(authTag, 'hex');

    // 4. Initialize the AES-GCM decipher
    const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, ivBuffer);

    // 5. Set the authentication tag (Crucial step for AES-GCM integrity validation)
    decipher.setAuthTag(authTagBuffer);

    // 6. Decrypt the ciphertext
    let decrypted = decipher.update(ciphertext, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');

    // 7. Parse the original JSON structural layout to extract the raw plaintext data
    const parsedPayload = JSON.parse(decrypted);
    return parsedPayload;
};

// Export using CommonJS syntax
module.exports = {
    decryptWithRandomIV
};
