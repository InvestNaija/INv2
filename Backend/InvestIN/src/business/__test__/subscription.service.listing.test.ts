import { AssetSubscriptionService } from '../services/subscription.service';
import { IAssetRepository } from '../../domain/sequelize/repositories/asset.repository';
import { IAssetTransactionRepository } from '../../domain/sequelize/repositories/transaction.repository';
import { ZanibalService } from '../services/zanibal.service';
import { HolidayService } from '../services/holiday.service';
import moment from 'moment';

jest.mock('../../rabbitmq.wrapper', () => ({
   rabbitmqWrapper: { connection: {} }
}));

jest.mock('@inv2/common', () => {
   const original = jest.requireActual('@inv2/common');
   return {
      ...original,
      INLogger: {
         log: {
            info: jest.fn(),
            error: jest.fn()
         }
      }
   };
});

describe('AssetSubscriptionService.getTransactions', () => {
   let service: AssetSubscriptionService;
   let mockAssetRepository: jest.Mocked<IAssetRepository>;
   let mockTransactionRepository: jest.Mocked<IAssetTransactionRepository>;
   let mockZanibalService: jest.Mocked<ZanibalService>;
   let mockHolidayService: jest.Mocked<HolidayService>;

   beforeEach(() => {
      mockAssetRepository = {} as any;
      mockTransactionRepository = {
         findAndCountAll: jest.fn(),
      } as any;
      mockZanibalService = {} as any;
      mockHolidayService = {} as any;

      service = new AssetSubscriptionService(
         mockAssetRepository,
         mockTransactionRepository,
         mockZanibalService,
         mockHolidayService
      );
   });

   it('should filter transactions by date and type', async () => {
      const query = {
         startDate: '2023-01-01',
         endDate: '2023-01-31',
         q: 's'
      };

      const mockRows = [{ id: 'txn-1', amount: 100, currency: 'NGN' }];
      mockTransactionRepository.findAndCountAll.mockResolvedValue({
         rows: mockRows as any,
         count: 1
      });

      const result = await service.getTransactions(query);

      expect(result.success).toBe(true);
      expect(result.data.rows).toEqual(mockRows);
      expect(mockTransactionRepository.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
         where: expect.objectContaining({
            [Symbol.for('and')]: expect.arrayContaining([
               { transactionType: 'subscription' }
            ])
         })
      }));
   });

   it('should handle search queries', async () => {
      const query = {
         startDate: '2023-01-01',
         endDate: '2023-01-31',
         q: 's',
         search: 'REF123'
      };

      mockTransactionRepository.findAndCountAll.mockResolvedValue({
         rows: [],
         count: 0
      });

      await service.getTransactions(query);

      expect(mockTransactionRepository.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
         where: expect.objectContaining({
            [Symbol.for('and')]: expect.arrayContaining([
               expect.objectContaining({
                  [Symbol.for('or')]: expect.arrayContaining([
                     { reference: { [Symbol.for('iLike')]: '%REF123%' } }
                  ])
               })
            ])
         })
      }));
   });
});
