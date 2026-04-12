import * as crypto from 'crypto';

export interface KeyPairResult {
    publicKey: string;
    privateKey: string;
    cleanPublicKey: string;
    cleanPrivateKey: string;
}

/**
 * Generates a 2048-bit RSA key pair for transit encryption.
 * Outputs both full PEM and "Clean Base64" (without headers/footers).
 */
export function generateRSAKeyPair(): KeyPairResult {
    // console.log('Generating 2048-bit RSA key pair (OAEP-SHA256 compliant)...');

    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });

    // Extract the "Clean" base64 body (for UI use)
    const cleanPublicKey = (publicKey as string)
        .replace(/-----BEGIN PUBLIC KEY-----/g, '')
        .replace(/-----END PUBLIC KEY-----/g, '')
        .replace(/\n/g, '')
        .trim();

    const cleanPrivateKey = (privateKey as string)
        .replace(/-----BEGIN PRIVATE KEY-----/g, '')
        .replace(/-----END PRIVATE KEY-----/g, '')
        .replace(/\n/g, '')
        .trim();

    return { publicKey: publicKey as string, privateKey: privateKey as string, cleanPublicKey, cleanPrivateKey };
}

if (typeof require !== 'undefined' && require.main === module) {
    const keys = generateRSAKeyPair();
    console.log('\n--- FULL PEM PUBLIC KEY ---\n', keys.publicKey);
    console.log('\n--- CLEAN BASE64 PUBLIC KEY (FOR UI) ---\n', keys.cleanPublicKey);
    console.log('\n--- FULL PEM PRIVATE KEY (FOR .ENV) ---\n', keys.privateKey);
    console.log('\nKeys generated successfully.');
}
