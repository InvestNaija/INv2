import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { Crypto } from "./crypto";

const scryptAsync = promisify(scrypt);

export class PasswordManager {
   static async toHash(password: string) {

      const salt = randomBytes(8).toString('hex'); //Generate the salt
      const buf = (await scryptAsync(password, salt, 64)) as Buffer;

      return `${buf.toString('hex')}.${salt}`;
   }

   static async compare(storedPassword: string, suppliedPassword: string) {
      try {
         if(process.env.NODE_ENV !== 'production') {
            const hash = await this.toHash(suppliedPassword);
            console.log(hash);
         }

         const [ hashedPassword, salt ] = storedPassword.split('.');
         const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;
         // console.log(buf.toString('hex'));
         
         return buf.toString('hex') === hashedPassword;
      } catch (e) {
         console.log(e);
         return false;
      }
   }
}