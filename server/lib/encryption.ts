import crypto from 'crypto';

// Get encryption key from environment (should be 32 bytes for AES-256)
const getEncryptionKey = (): Buffer => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    // Generate a deterministic key from JWT_SECRET if ENCRYPTION_KEY not set
    const jwtSecret = process.env.JWT_SECRET || 'default-encryption-key';
    return crypto.createHash('sha256').update(jwtSecret).digest();
  }
  // If key is hex string, convert to buffer
  if (key.length === 64 && /^[0-9a-f]+$/.test(key)) {
    return Buffer.from(key, 'hex');
  }
  // Otherwise, hash it to get 32 bytes
  return crypto.createHash('sha256').update(key).digest();
};

/**
 * Encrypts a string using AES-256-GCM
 * Returns a base64 string with IV and auth tag included
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12); // 12 bytes for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  const authTag = cipher.getAuthTag();
  
  // Format: iv:authTag:encrypted (all base64)
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
}

/**
 * Decrypts a string encrypted with encrypt()
 */
export function decrypt(ciphertext: string): string {
  try {
    const key = getEncryptionKey();
    const [ivBase64, authTagBase64, encrypted] = ciphertext.split(':');
    
    if (!ivBase64 || !authTagBase64 || !encrypted) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(ivBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Generates a new encryption key (for setup)
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}