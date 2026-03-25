import { AssetService } from '../services/asset.service';
import { IAssetRepository } from '../../domain/sequelize/repositories/asset.repository';

jest.mock('../../rabbitmq.wrapper', () => ({
   rabbitmqWrapper: { connection: {} }
}));

jest.mock('../../events/publishers/asset-created.publisher', () => ({
   AssetCreatedPublisher: jest.fn().mockImplementation(() => ({
      publish: jest.fn().mockResolvedValue(true)
   }))
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

describe('AssetService', () => {
   let assetService: AssetService;
   let mockAssetRepository: jest.Mocked<IAssetRepository>;

   beforeEach(() => {
      mockAssetRepository = {
         create: jest.fn(),
         findById: jest.fn(),
         findByAssetCode: jest.fn(),
         findAll: jest.fn(),
         update: jest.fn(),
         delete: jest.fn(),
      } as any;
      assetService = new AssetService(mockAssetRepository);
   });

   it('should create an asset', async () => {
      const assetData = { name: 'Test Fund', assetCode: 'TF001' };
      const createdAsset = { id: 'asset-123', ...assetData, externalIdentifier: 'EXT1', price: 10, yield: 0, currency: 'NGN' };
      mockAssetRepository.create.mockResolvedValue(createdAsset as any);

      const result = await assetService.createAsset(assetData);
      expect(result.data).toEqual(createdAsset);
      expect(mockAssetRepository.create).toHaveBeenCalledWith(assetData);
   });
});
