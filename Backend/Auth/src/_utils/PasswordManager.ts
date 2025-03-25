import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { Crypto } from "./crypto";

const scryptAsync = promisify(scrypt);

export class PasswordManager {
   static async toHash(password: string) {
      // const what = (new Crypto({ aesKey: process.env.AES_SECRET_KEY })).encryptWithKeyAndIV(password);
      // First decrypt the password
      password = (new Crypto({ aesKey: process.env.AES_SECRET_KEY})).decryptWithKeyAndIV(password);

      const salt = randomBytes(8).toString('hex'); //Generate the salt
      const buf = (await scryptAsync(password, salt, 64)) as Buffer;

      return `${buf.toString('hex')}.${salt}`;
   }

   static async compare(storedPassword: string, suppliedPassword: string) {
      try {
         // Decrypt the supplied password
         // const what = (new Crypto({ aesKey: process.env.AES_SECRET_KEY })).encryptWithKeyAndIV(suppliedPassword);
         const password = (new Crypto({ aesKey: process.env.AES_SECRET_KEY})).decryptWithKeyAndIV(suppliedPassword);
   
         const [ hashedPassword, salt ] = storedPassword.split('.');
         const buf = (await scryptAsync(password, salt, 64)) as Buffer;
         // console.log(buf.toString('hex'));
         
         return buf.toString('hex') === hashedPassword;
      } catch (e) {
         console.log(e);
         return false;
      }
   }
}