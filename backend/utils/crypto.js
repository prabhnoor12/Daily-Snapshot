
import crypto from 'crypto';

// Constants for encryption
const ALGORITHM = 'aes-256-gcm';
const KEY = process.env.SESSION_ENCRYPTION_KEY;
const IV_LENGTH = 12;

/**
 * Encrypts text using AES-256-GCM.
 * @param {string} text - Text to encrypt.
 * @returns {string} Encrypted string with IV and AuthTag.
 */
export function encrypt(text) {
    if (!KEY) throw new Error('SESSION_ENCRYPTION_KEY not set');
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(KEY, 'hex'), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag();
    return iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
}

/**
 * Decrypts data encrypted with encrypt().
 * @param {string} data - Encrypted string.
 * @returns {string} Decrypted text.
 */
export function decrypt(data) {
    if (!KEY) throw new Error('SESSION_ENCRYPTION_KEY not set');
    const [ivHex, tagHex, encrypted] = data.split(':');
    if (!ivHex || !tagHex || !encrypted) throw new Error('Invalid encrypted data format');
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(KEY, 'hex'), iv);
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

/**
 * Anonymizes a string by hashing it (irreversible pseudonymization).
 * @param {string} value - Value to anonymize.
 * @returns {string} SHA-256 hash.
 */
export function anonymize(value) {
    return crypto.createHash('sha256').update(value).digest('hex');
}

/**
 * Pseudonymizes a string using keyed HMAC (reversible if key is retained).
 * @param {string} value - Value to pseudonymize.
 * @returns {string} HMAC-SHA256 pseudonymized value.
 */
export function pseudonymize(value) {
    if (!KEY) throw new Error('SESSION_ENCRYPTION_KEY not set');
    return crypto.createHmac('sha256', KEY).update(value).digest('hex');
}

/**
 * Securely deletes sensitive data from memory (best effort in JS).
 * @param {object} obj - Object containing sensitive fields.
 * @param {string[]} fields - Array of field names to delete.
 */
export function secureDelete(obj, fields) {
    if (!obj || !Array.isArray(fields)) return;
    for (const field of fields) {
        if (obj[field]) {
            obj[field] = undefined;
            delete obj[field];
        }
    }
}

/**
 * Utility to check if a string contains personal data (simple heuristic).
 * @param {string} value - Value to check.
 * @returns {boolean} True if likely personal data.
 */
export function isPersonalData(value) {
    // Example: check for email, phone, or name patterns
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const phoneRegex = /\+?\d{10,15}/;
    return emailRegex.test(value) || phoneRegex.test(value);
}
