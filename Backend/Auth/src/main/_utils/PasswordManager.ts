import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { Crypto } from "./crypto";

const scryptAsync = promisify(scrypt);

export class PasswordManager {
   static async toHash(password: string) {
      // First decrypt the password
      // const what = (new Crypto({ aesKey: process.env.AES_SECRET_KEY, ivKey: process.env.IV_SECRET_KEY })).encryptWithKeyAndIV(password);
      password = (new Crypto({ aesKey: process.env.AES_SECRET_KEY})).decryptWithKeyAndIV(password);

      const salt = randomBytes(8).toString('hex'); //Generate the salt
      const buf = (await scryptAsync(password, salt, 64)) as Buffer;

      return `${buf.toString('hex')}.${salt}`;
   }

   static async compare(storedPassword: string, suppliedPassword: string) {
      // Decrypt the supplied password
      const password = (new Crypto({ aesKey: process.env.AES_SECRET_KEY})).decryptWithKeyAndIV(suppliedPassword);

      const [ hashedPassword, salt ] = storedPassword.split('.');
      const buf = (await scryptAsync(password, salt, 64)) as Buffer;

      return buf.toString('hex') === hashedPassword;
   }
}