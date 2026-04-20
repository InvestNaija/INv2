import { UserService } from '../user.service';
import { User } from '../../../domain/sequelize/INv2';
import { PasswordManager } from '../../../_utils/PasswordManager';
import { RSAEncryption } from '@inv2/common';

jest.mock('../../../domain/sequelize/INv2', () => ({
   User: {
      findByPk: jest.fn(),
      findOne: jest.fn(),
   },
}));

jest.mock('@inv2/common', () => {
   const originalModule = jest.requireActual('@inv2/common');
   return {
      ...originalModule,
      RSAEncryption: jest.fn().mockImplementation(() => ({
         decrypt: jest.fn((val) => val.replace('encrypted-', '')),
      })),
   };
});

describe('UserService', () => {
   let service: UserService;
   let mockUserRepo: any;
   let mockHistorySvc: any;

   beforeEach(() => {
      mockUserRepo = {
         transaction: jest.fn().mockResolvedValue({ commit: jest.fn(), rollback: jest.fn() }),
         commit: jest.fn(),
         rollback: jest.fn(),
      };
      mockHistorySvc = {
         isPasswordReused: jest.fn(),
         recordPassword: jest.fn(),
      };
      service = new UserService(mockUserRepo, mockHistorySvc);
      process.env.RSA_GENERAL_PRIVATE_KEY = 'test-key';
   });

   describe('changePassword', () => {
      const userId = 'user-1';
      const body = { oldPassword: 'encrypted-old', newPassword: 'encrypted-new' };

      it('should successfully change password', async () => {
         const mockUser = {
            id: userId,
            password: 'hashed-old',
            update: jest.fn().mockResolvedValue(true),
         };
         (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
         jest.spyOn(PasswordManager, 'compare').mockResolvedValue(true);
         mockHistorySvc.isPasswordReused.mockResolvedValue(false);

         const result = await service.changePassword(userId, body);

         expect(result.success).toBe(true);
         expect(mockUser.update).toHaveBeenCalledWith({ password: 'new' }, expect.any(Object));
         expect(mockHistorySvc.recordPassword).toHaveBeenCalled();
         expect(mockUserRepo.commit).toHaveBeenCalled();
      });

      it('should throw error if old password is incorrect', async () => {
         const mockUser = { id: userId, password: 'hashed-old' };
         (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
         jest.spyOn(PasswordManager, 'compare').mockResolvedValue(false);

         await expect(service.changePassword(userId, body)).rejects.toThrow('Incorrect old password');
         expect(mockUserRepo.rollback).toHaveBeenCalled();
      });

      it('should throw error if password is reused', async () => {
         const mockUser = { id: userId, password: 'hashed-old' };
         (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
         jest.spyOn(PasswordManager, 'compare').mockResolvedValue(true);
         mockHistorySvc.isPasswordReused.mockResolvedValue(true);

         await expect(service.changePassword(userId, body)).rejects.toThrow(/cannot reuse any of your last/);
      });
   });

   describe('resetPassword', () => {
      const email = 'test@example.com';
      const body = { password: 'encrypted-pwd', confirmPassword: 'encrypted-pwd' };

      it('should successfully reset password', async () => {
         const mockUser = {
            id: 'user-1',
            password: 'hashed-old',
            update: jest.fn().mockResolvedValue(true),
         };
         (User.findOne as jest.Mock).mockResolvedValue(mockUser);
         mockHistorySvc.isPasswordReused.mockResolvedValue(false);

         const result = await service.resetPassword(email, body);

         expect(result.success).toBe(true);
         expect(mockUser.update).toHaveBeenCalledWith({ password: 'pwd' }, expect.any(Object));
         expect(mockHistorySvc.recordPassword).toHaveBeenCalled();
      });

      it('should throw error if passwords do not match', async () => {
         const mismatchBody = { password: 'encrypted-pwd1', confirmPassword: 'encrypted-pwd2' };
         (User.findOne as jest.Mock).mockResolvedValue({ id: 'user-1' });

         await expect(service.resetPassword(email, mismatchBody)).rejects.toThrow('Passwords do not match');
      });
   });
});
