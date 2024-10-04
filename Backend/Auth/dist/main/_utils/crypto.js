"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Crypto = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
const CryptoJS = __importStar(require("crypto-js"));
class Crypto {
    constructor({ aesKey = '', ivKey = '', secret = '' }) {
        this.algorithm = "aes-256-cbc";
        this.aesKey = aesKey;
        this.ivKey = ivKey;
        this.secret = secret;
    }
    encryptWithSecret(data) {
        const bytes = CryptoJS.AES.encrypt(data, this.secret);
        return bytes.toString();
    }
    decryptWithSecret(data) {
        const bytes = CryptoJS.AES.decrypt(data, this.secret);
        return bytes.toString(CryptoJS.enc.Utf8);
    }
    encryptWithKeyAndIV(dataToBeEncrypted) {
        if (typeof dataToBeEncrypted !== "string") {
            throw Error(`Cypher.encrypt: argument must be string; objects must must be stringified`);
        }
        const key = CryptoJS.enc.Utf8.parse(this.aesKey);
        const iv = CryptoJS.enc.Utf8.parse(this.ivKey);
        const encrypted = CryptoJS.AES.encrypt(JSON.stringify(dataToBeEncrypted), key, {
            keySize: 16,
            iv: iv,
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        });
        console.log(encrypted.toString());
        return encrypted.toString();
    }
    decryptWithKeyAndIV(encryptedData) {
        if (typeof encryptedData !== "string") {
            throw Error(`Cypher.decrypt error: argument must be string`);
        }
        const key = CryptoJS.enc.Utf8.parse(this.aesKey);
        const iv = CryptoJS.enc.Utf8.parse(this.ivKey);
        const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
            keySize: 16,
            iv: iv,
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        });
        return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
    }
}
exports.Crypto = Crypto;
;
