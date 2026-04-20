import { PasswordHistoryService } from '../password-history.service';
import { PasswordManager } from '../../../_utils/PasswordManager';

describe('PasswordHistoryService', () => {
   let service: PasswordHistoryService;
   let mockRepo: any;

   beforeEach(() => {
      mockRepo = {
         create: jest.fn(),
         findLastN: jest.fn(),
      };
      service = new PasswordHistoryService(mockRepo);
      process.env.PASSWORD_HISTORY_DEPTH = '3';
   });

   describe('recordPassword', () => {
      it('should call repository.create with correct data', async () => {
         const userId = 'user-1';
         const hash = 'hashed-pwd';
         await service.recordPassword(userId, hash);
         expect(mockRepo.create).toHaveBeenCalledWith({ userId, passwordHash: hash }, undefined);
      });
   });

   describe('isPasswordReused', () => {
      it('should return true if password matches current password', async () => {
         jest.spyOn(PasswordManager, 'compare').mockResolvedValue(true);
         
         const isReused = await service.isPasswordReused('user-1', 'new-pwd', 'current-hash');
         
         expect(isReused).toBe(true);
         expect(PasswordManager.compare).toHaveBeenCalledWith('current-hash', 'new-pwd');
      });

      it('should return true if password matches any of the historical passwords', async () => {
         // First call (check current) returns false
         // Second call (check history entry 1) returns true
         jest.spyOn(PasswordManager, 'compare')
            .mockResolvedValueOnce(false) // current
            .mockResolvedValueOnce(true); // history 1

         mockRepo.findLastN.mockResolvedValue([
            { passwordHash: 'hist-1' },
            { passwordHash: 'hist-2' }
         ]);

         const isReused = await service.isPasswordReused('user-1', 'new-pwd', 'current-hash');

         expect(isReused).toBe(true);
         expect(mockRepo.findLastN).toHaveBeenCalledWith('user-1', 3);
      });

      it('should return false if password matches nothing', async () => {
         jest.spyOn(PasswordManager, 'compare').mockResolvedValue(false);
         mockRepo.findLastN.mockResolvedValue([
            { passwordHash: 'hist-1' },
            { passwordHash: 'hist-2' }
         ]);

         const isReused = await service.isPasswordReused('user-1', 'new-pwd', 'current-hash');

         expect(isReused).toBe(false);
      });
   });
});
