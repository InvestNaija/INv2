import { AssetSubscriptionService } from '../services/subscription.service';
import { IAssetRepository } from '../../domain/sequelize/repositories/asset.repository';
import { IAssetTransactionRepository } from '../../domain/sequelize/repositories/transaction.repository';
import { ZanibalService } from '../services/zanibal.service';
import { HolidayService } from '../services/holiday.service';

jest.mock('../../redis.wrapper', () => ({
   redisWrapper: { client: {} }
}));

jest.mock('@inv2/common', () => {
   const actualCommon = jest.requireActual('@inv2/common');
   return {
      ...actualCommon,
      RedisService: jest.fn().mockImplementation(() => ({})),
   };
});

jest.mock('../../grpc/client', () => ({
   GrpcClient: {
      start: jest.fn().mockResolvedValue({}),
      initializePayment: jest.fn().mockResolvedValue({
         success: true,
         data: { authorizationUrl: 'http://auth.url', id: 'tx-123' }
      })
   }
}));

describe('AssetSubscriptionService', () => {
   let subscriptionService: AssetSubscriptionService;
   let mockAssetRepository: jest.Mocked<IAssetRepository>;
   let mockTransactionRepository: jest.Mocked<IAssetTransactionRepository>;
   let mockZanibalService: jest.Mocked<ZanibalService>;
   let mockHolidayService: jest.Mocked<HolidayService>;

   beforeEach(() => {
      mockAssetRepository = {
         create: jest.fn(),
         findById: jest.fn(),
         findByAssetCode: jest.fn(),
         findAll: jest.fn(),
         update: jest.fn(),
         delete: jest.fn(),
      } as any;

      mockTransactionRepository = {
         create: jest.fn(),
         findById: jest.fn(),
         update: jest.fn(),
         delete: jest.fn(),
         findAll: jest.fn(),
      } as any;

      mockZanibalService = {
         createFundTransaction: jest.fn(),
         postFundTransaction: jest.fn(),
      } as any;

      mockHolidayService = {
         isHoliday: jest.fn(),
         getNextBusinessDay: jest.fn().mockResolvedValue('2026-03-26'),
         getPreviousBusinessDay: jest.fn(),
      } as any;

      subscriptionService = new AssetSubscriptionService(
         mockAssetRepository,
         mockTransactionRepository,
         mockZanibalService,
         mockHolidayService
      );
   });

   afterEach(() => {
      jest.clearAllMocks();
   });

   it('should create a subscription and set postdate to next business day', async () => {
      const mockUser = {
         user: { id: 'user-123', email: 'test@example.com' },
         role: { id: 'role-1' },
         tenant: { id: 'tenant-1' }
      } as any;

      const mockData = {
         assetCode: 'F1',
         transAmount: 1000,
         portfolioId: 'PF1',
         currency: 'NGN'
      };

      const mockAsset = {
         id: 'asset-123',
         currency: 'NGN',
         name: 'Test Fund',
         externalIdentifier: 'F1'
      };

      const mockTransaction = {
         id: 'transaction-123',
      };

      mockAssetRepository.findByAssetCode.mockResolvedValue(mockAsset as any);
      mockTransactionRepository.create.mockResolvedValue(mockTransaction as any);

      const response = await subscriptionService.createSubscription(mockUser, mockData);

      expect(response.success).toBe(true);
      expect(response.code).toBe(201);
      expect(response.data.transactionId).toBe('transaction-123');
      expect(response.data.authorizationUrl).toBe('http://auth.url');

      // Assert that HolidayService was called correctly
      expect(mockHolidayService.getNextBusinessDay).toHaveBeenCalled();
      
      // Assert transaction create was called with correct data including postdate
      expect(mockTransactionRepository.create).toHaveBeenCalledWith(expect.objectContaining({
         customerId: 'user-123',
         assetId: 'asset-123',
         transactionType: 'subscription',
         amount: 1000,
         postdate: '2026-03-26', // Based on the mock resolved value above
      }));
   });
});
