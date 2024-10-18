"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordManager = void 0;
const crypto_1 = require("crypto");
const util_1 = require("util");
const crypto_2 = require("./crypto");
const scryptAsync = (0, util_1.promisify)(crypto_1.scrypt);
class PasswordManager {
    static toHash(password) {
        return __awaiter(this, void 0, void 0, function* () {
            // First decrypt the password
            // const what = (new Crypto({ aesKey: process.env.AES_SECRET_KEY, ivKey: process.env.IV_SECRET_KEY })).encryptWithKeyAndIV(password);
            password = (new crypto_2.Crypto({ aesKey: process.env.AES_SECRET_KEY })).decryptWithKeyAndIV(password);
            const salt = (0, crypto_1.randomBytes)(8).toString('hex'); //Generate the salt
            const buf = (yield scryptAsync(password, salt, 64));
            return `${buf.toString('hex')}.${salt}`;
        });
    }
    static compare(storedPassword, suppliedPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            // Decrypt the supplied password
            const password = (new crypto_2.Crypto({ aesKey: process.env.AES_SECRET_KEY })).decryptWithKeyAndIV(suppliedPassword);
            const [hashedPassword, salt] = storedPassword.split('.');
            const buf = (yield scryptAsync(password, salt, 64));
            return buf.toString('hex') === hashedPassword;
        });
    }
}
exports.PasswordManager = PasswordManager;
