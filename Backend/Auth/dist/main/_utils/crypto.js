"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Crypto = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const crypto_1 = __importDefault(require("crypto"));
class Crypto {
    constructor({ aesKey = '' }) {
        this.algorithm = "aes-256-cbc";
        this.aesKey = aesKey;
    }
    encryptWithKeyAndIV(dataToBeEncrypted) {
        const aesKey = Buffer.from(this.aesKey, 'hex');
        const ivKey = crypto_1.default.randomBytes(16);
        const cipher = crypto_1.default.createCipheriv(this.algorithm, Buffer.from(aesKey), ivKey);
        let encrypted = cipher.update(dataToBeEncrypted);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return `${encrypted.toString('hex')}.${ivKey.toString('hex')}`;
    }
    decryptWithKeyAndIV(encryptedData) {
        const aesKey = Buffer.from(this.aesKey, 'hex');
        const [data, ivKey] = encryptedData.split('.');
        const encryptedText = Buffer.from(data, 'hex');
        const decipher = crypto_1.default.createDecipheriv(this.algorithm, Buffer.from(aesKey), Buffer.from(ivKey, 'hex'));
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }
}
exports.Crypto = Crypto;
;
