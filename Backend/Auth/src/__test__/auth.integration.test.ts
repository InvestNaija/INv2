import request from 'supertest';
import { app } from '../app';
import { getDbCxn } from '../domain';
import { User, PasswordHistory } from '../domain/sequelize/INv2';
import { RSAEncryption, JWTService } from '@inv2/common';
import { PasswordManager } from '../_utils/PasswordManager';

describe('Auth Password Management Integration', () => {
   let rsa: RSAEncryption;
   let sequelize: any;
   
   const testEmail = 'tester@investnaija.com';
   const testPassword = 'Password123!';
   
   beforeAll(async () => {
      // Use the keys from environment or defaults for testing
      process.env.RSA_GENERAL_PRIVATE_KEY = process.env.RSA_GENERAL_PRIVATE_KEY || 'test-private-key';
      process.env.RSA_GENERAL_PUBLIC_KEY = process.env.RSA_GENERAL_PUBLIC_KEY || 'test-public-key';
      process.env.ACCESS_TOKEN_SECRET = 'test-secret';
      process.env.ACCESS_TOKEN_TIME = '1h';

      rsa = new RSAEncryption({ privateKey: process.env.RSA_GENERAL_PRIVATE_KEY! });
      sequelize = getDbCxn();
   });

   beforeEach(async () => {
      // Use raw queries or the connection-bound models for cleanup
      await sequelize.getQueryInterface().bulkDelete('users', {});
      await sequelize.getQueryInterface().bulkDelete('password_histories', {});
      
      const hashedPassword = await PasswordManager.toHash(testPassword);
      // Use the model which should be bound now
      await User.create({
         id: 'user-integration-1',
         firstName: 'Test',
         lastName: 'User',
         email: testEmail,
         password: hashedPassword,
         isEnabled: true,
         isLocked: false,
      });
   });

   describe('POST /auth/user/forgot-password', () => {
      it('should return 200 and send OTP', async () => {
         const response = await request(app)
            .post('/api/v2/auth/user/forgot-password')
            .send({ email: testEmail });

         expect(response.status).toBe(200);
         expect(response.body.message).toContain('OTP sent successfully');
      });

      it('should return 404 for non-existent email', async () => {
         const response = await request(app)
            .post('/api/v2/auth/user/forgot-password')
            .send({ email: 'wrong@test.com' });

         expect(response.status).toBe(404);
      });
   });

   describe('POST /auth/user/change-password', () => {
      it('should change password successfully with valid token and RSA payload', async () => {
         // 1. Create a token for the user
         const userPayload = {
            user: { id: 'user-integration-1', email: testEmail },
            Tenant: [{ id: 't1', Roles: [{ name: 'CUSTOMER' }] }]
         };
         const tokenResult = JWTService.createJWTToken(userPayload, process.env.ACCESS_TOKEN_SECRET!, '1h');
         const token = tokenResult.data;

         // 2. Prepare RSA encrypted payload
         // Since we mocked RSA in the service unit tests, but here we run real app,
         // the service will try to decrypt using RSAEncryption.
         // In many local dev envs, the key might be invalid.
         // I will mock RSAEncryption.prototype.decrypt to simplify the integration test
         // while still verifying the flow.
         jest.spyOn(RSAEncryption.prototype, 'decrypt').mockImplementation((val: string) => val);

         const newPassword = 'NewPassword123!';
         const response = await request(app)
            .post('/api/v2/auth/user/change-password')
            .set('Authorization', `Bearer ${token}`)
            .send({
               oldPassword: testPassword,
               newPassword: newPassword
            });

         expect(response.status).toBe(200);
         
         // 3. Verify database state
         const user = await User.findOne({ where: { email: testEmail } });
         const matches = await PasswordManager.compare(user!.password, newPassword);
         expect(matches).toBe(true);

         // 4. Verify history recording
         const history = await PasswordHistory.count({ where: { userId: 'user-integration-1' } });
         expect(history).toBe(1);
      });

      it('should reject if new password is same as old', async () => {
         const userPayload = { user: { id: 'user-integration-1' }, Tenant: [{ id: 't1', Roles: [{ name: 'CUSTOMER' }] }] };
         const token = JWTService.createJWTToken(userPayload, process.env.ACCESS_TOKEN_SECRET!, '1h').data;
         
         jest.spyOn(RSAEncryption.prototype, 'decrypt').mockImplementation((val: string) => val);

         const response = await request(app)
            .post('/api/v2/auth/user/change-password')
            .set('Authorization', `Bearer ${token}`)
            .send({
               oldPassword: testPassword,
               newPassword: testPassword
            });

         expect(response.status).toBe(400);
         expect(response.body.message).toContain('reuse');
      });
   });
});
