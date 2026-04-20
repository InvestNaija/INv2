import * as crypto from 'crypto';

export interface RSAEncryptionOptions {
    privateKey?: string;
}

/**
 * RSAEncryption class for Asymmetric Decryption (Best Practice for Passwords).
 * Supports both full PEM format and "Clean Base64" (without headers).
 * @class RSAEncryption
 */
export class RSAEncryption {
    private privateKey: string;
    private padding: number;
    private oaepHash: string;

    /**
     * @param {Object} options
     * @param {string} options.privateKey - PEM or Clean Base64 private key.
     */
    constructor({ privateKey = process.env.RSA_PRIVATE_KEY }: RSAEncryptionOptions = {}) {
        if (!privateKey) {
            throw new Error('RSA Decryption error: RSA_PRIVATE_KEY is missing from environment.');
        }
        this.privateKey = this.ensurePemFormat(privateKey, 'PRIVATE');
        this.padding = crypto.constants.RSA_PKCS1_OAEP_PADDING;
        this.oaepHash = 'sha256';
    }

    /**
     * Ensures the key string is in PEM format by adding headers if missing.
     * Logic similar to the Python counterpart for consistency.
     */
    public ensurePemFormat(key: string, type: 'PRIVATE' | 'PUBLIC'): string {
        // Normalize whitespace and remove existing headers/footers
        const cleanKey = key.replace(/-----BEGIN [\w\s]+-----/g, '')
                          .replace(/-----END [\w\s]+-----/g, '')
                          .replace(/\s/g, '');
        
        // Split into 64-character lines (standard PEM formatting)
        const lines = cleanKey.match(/.{1,64}/g) || [];
        const formatted = lines.join('\n');
        
        return `-----BEGIN ${type} KEY-----\n${formatted}\n-----END ${type} KEY-----\n`;
    }

    /**
     * Decrypts data that was encrypted with the corresponding Public Key.
     * @param {string} encryptedData - Base64 encoded ciphertext.
     * @returns {string} - The decrypted plain text.
     */
    public decrypt(encryptedData: string): string {
        if (!encryptedData || typeof encryptedData !== 'string') {
            throw new Error('RSA Decryption error: Encrypted data must be a non-empty base64 string.');
        }

        try {
            const buffer = Buffer.from(encryptedData, 'base64');
            const decrypted = crypto.privateDecrypt(
                {
                    key: this.privateKey,
                    padding: this.padding,
                    oaepHash: this.oaepHash,
                },
                buffer
            );
            return decrypted.toString('utf8');
        } catch (error: any) {
            console.error('RSA Decryption details:', error.message);
            throw new Error('RSA Decryption failed. Ensure the UI is using OAEP-SHA256 padding.');
        }
    }

    /**
     * Utility method to encrypt data with a PUBLIC key (PEM or Clean Base64).
     */
    public static encryptWithPublicKey(text: string, publicKey: string): string {
        // Use a temporary instance to handle PEM formatting
        const dummy = new RSAEncryption({ privateKey: 'dummy' }); 
        const formattedPublicKey = dummy.ensurePemFormat(publicKey, 'PUBLIC');
        
        const buffer = Buffer.from(text, 'utf8');
        const encrypted = crypto.publicEncrypt(
            {
                key: formattedPublicKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256',
            },
            buffer
        );
        return encrypted.toString('base64');
    }
}
