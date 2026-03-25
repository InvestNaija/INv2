import { injectable, inject } from 'inversify';
import { IAssetRepository } from '../../domain/sequelize/repositories/asset.repository';
import { Asset } from '../../domain/sequelize/models/asset.model';
import { TYPES } from '../types';
import { IResponse, Exception, handleError, INLogger } from '@inv2/common';
import { AssetCreatedPublisher } from '../../events/publishers/asset-created.publisher';
import { rabbitmqWrapper } from '../../rabbitmq.wrapper';

/**
 * Asset Service
 * Provides business logic for Managing investment assets (Admin operations).
 */
@injectable()
export class AssetService {
   constructor(@inject(TYPES.AssetRepository) private readonly assetRepository: IAssetRepository) {}

   /**
    * Creates a new investment asset and publishes an event.
    * @param assetData Partial asset data.
    */
   async createAsset(assetData: Partial<Asset>): Promise<IResponse> {
      try {
         const asset = await this.assetRepository.create(assetData);

         // Publish AssetCreated event to inform other microservices
         await new AssetCreatedPublisher(rabbitmqWrapper.connection).publish({
            id: asset.id,
            name: asset.name,
            assetCode: asset.assetCode,
            externalIdentifier: asset.externalIdentifier,
            price: asset.price,
            yield: asset.yield,
            currency: asset.currency,
         });

         INLogger.log.info(`Asset created and published: ${asset.assetCode}`);

         return {
            success: true,
            code: 201,
            message: 'Asset created and published successfully',
            data: asset,
         };
      } catch (error) {
         throw new Exception(handleError(error));
      }
   }

   /**
    * Retrieves an asset by its ID.
    * @param id Asset UUID.
    */
   async getAssetById(id: string): Promise<IResponse> {
      try {
         const asset = await this.assetRepository.findById(id);
         if (!asset) throw new Exception({ code: 404, message: 'Asset not found' });
         return {
            success: true,
            code: 200,
            message: 'Asset retrieved successfully',
            data: asset,
         };
      } catch (error) {
         throw new Exception(handleError(error));
      }
   }

   /**
    * Retrieves all available assets.
    */
   async getAllAssets(): Promise<IResponse> {
      try {
         const assets = await this.assetRepository.findAll();
         return {
            success: true,
            code: 200,
            message: 'Assets retrieved successfully',
            data: assets,
            count: assets.length,
         };
      } catch (error) {
         throw new Exception(handleError(error));
      }
   }

   /**
    * Updates an existing asset.
    * @param id Asset UUID.
    * @param assetData Updated asset data.
    */
   async updateAsset(id: string, assetData: Partial<Asset>): Promise<IResponse> {
      try {
         const [count, assets] = await this.assetRepository.update(id, assetData);
         if (count === 0) throw new Exception({ code: 404, message: 'Asset not found' });
         return {
            success: true,
            code: 200,
            message: 'Asset updated successfully',
            data: assets[0],
         };
      } catch (error) {
         throw new Exception(handleError(error));
      }
   }

   /**
    * Deletes an asset by ID.
    * @param id Asset UUID.
    */
   async deleteAsset(id: string): Promise<IResponse> {
      try {
         const count = await this.assetRepository.delete(id);
         if (count === 0) throw new Exception({ code: 404, message: 'Asset not found' });
         return {
            success: true,
            code: 200,
            message: 'Asset deleted successfully',
         };
      } catch (error) {
         throw new Exception(handleError(error));
      }
   }
}
