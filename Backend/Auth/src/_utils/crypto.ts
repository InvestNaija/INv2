/* eslint-disable @typescript-eslint/no-explicit-any */
import crypto from 'crypto';


export class Crypto {
   private aesKey: string;
   private algorithm: string = "aes-256-cbc";
   constructor({aesKey = ''}) {
      this.aesKey = aesKey;
   }
   
   encryptWithKeyAndIV(dataToBeEncrypted: string) {
      const aesKey = Buffer.from(this.aesKey, 'hex');
      const ivKey = crypto.randomBytes(16);

      const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(aesKey), ivKey);
      let encrypted = cipher.update(dataToBeEncrypted);
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      return `${encrypted.toString('hex')}.${ivKey.toString('hex')}`;
   }

   decryptWithKeyAndIV(encryptedData: string) {
      const aesKey = Buffer.from(this.aesKey, 'hex');
      const [ data, ivKey ] = encryptedData.split('.');
      const encryptedText = Buffer.from(data, 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(aesKey), Buffer.from(ivKey, 'hex'));
      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      return decrypted.toString();
   }
};
