import { AuthService } from '../auth.service';
import { User } from '../../../domain/sequelize/INv2';
import { OtpService } from '@inv2/common';

jest.mock('../../../domain/sequelize/INv2', () => ({
   User: {
      findOne: jest.fn(),
   },
}));

jest.mock('@inv2/common', () => {
   const originalModule = jest.requireActual('@inv2/common');
   return {
      ...originalModule,
      OtpService: jest.fn().mockImplementation(() => ({
         generateOTP: jest.fn().mockResolvedValue({ success: true, message: 'OTP_SENT' }),
         verifyOTP: jest.fn().mockResolvedValue({ success: true }),
      })),
   };
});

describe('AuthService', () => {
   let service: AuthService;
   let mockUserSvc: any;
   let mockRoleSvc: any;
   let mockTenantSvc: any;

   beforeEach(() => {
      mockUserSvc = {
         resetPassword: jest.fn().mockResolvedValue({ success: true, code: 200 }),
         changePassword: jest.fn().mockResolvedValue({ success: true, code: 200 }),
      };
      mockRoleSvc = {};
      mockTenantSvc = {};
      service = new AuthService(mockUserSvc, mockRoleSvc, mockTenantSvc);
   });

   describe('forgotPassword', () => {
      it('should trigger OTP generation if user exists', async () => {
         const email = 'test@example.com';
         (User.findOne as jest.Mock).mockResolvedValue({ id: 'u1', email, firstName: 'Test' });

         const result = await service.forgotPassword(email);

         expect(result.success).toBe(true);
         expect(OtpService).toHaveBeenCalled();
      });

      it('should throw error if user not found', async () => {
         (User.findOne as jest.Mock).mockResolvedValue(null);
         await expect(service.forgotPassword('none@ex.com')).rejects.toThrow('User not found');
      });
   });

   describe('resetPassword', () => {
      it('should verify OTP and call userSvc.resetPassword', async () => {
         const body = { email: 'test@ex.com', otp: '1234', password: 'new', confirmPassword: 'new' };
         (User.findOne as jest.Mock).mockResolvedValue({ id: 'u1', email: body.email, firstName: 'Test' });

         const result = await service.resetPassword(body);

         expect(result.success).toBe(true);
         expect(mockUserSvc.resetPassword).toHaveBeenCalledWith(body.email, { 
            password: body.password, 
            confirmPassword: body.confirmPassword 
         });
      });

      it('should throw error if OTP verification fails', async () => {
         const body = { email: 'test@ex.com', otp: '1234', password: 'new', confirmPassword: 'new' };
         (User.findOne as jest.Mock).mockResolvedValue({ id: 'u1', email: body.email });
         
         // Mock verifyOTP failure
         (OtpService as jest.Mock).mockImplementationOnce(() => ({
            verifyOTP: jest.fn().mockResolvedValue({ success: false, message: 'Invalid OTP' }),
         }));

         await expect(service.resetPassword(body)).rejects.toThrow('Invalid OTP');
      });
   });
});
