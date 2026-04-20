import { injectable } from 'inversify';
import { Asset } from '../models/asset.model';
import { getDbCxn } from '../../index';
import { Repository } from 'sequelize-typescript';

/**
 * Asset Repository Interface
 * Defines the contract for asset data access operations.
 */
export interface IAssetRepository {
   /** Creates a new asset record */
   create(asset: Partial<Asset>): Promise<Asset>;
   /** Finds an asset by its internal ID */
   findById(id: string): Promise<Asset | null>;
   /** Finds an asset by its unique asset code */
   findByAssetCode(assetCode: string): Promise<Asset | null>;
   /** Retrieves all asset records */
   findAll(): Promise<Asset[]>;
   /** Updates an existing asset record */
   update(id: string, asset: Partial<Asset>): Promise<[number, Asset[]]>;
   /** Deletes an asset record by ID */
   delete(id: string): Promise<number>;
}

/**
 * Asset Repository Implementation
 * Handles database interactions for the Asset entity using Sequelize.
 * Uses getDbCxn() to retrieve the repository instance for the Asset model.
 */
@injectable()
export class AssetRepository implements IAssetRepository {
   /** Retrieves the Sequelize repository for the Asset model */
   private get repo(): Repository<Asset> {
      return getDbCxn()?.getRepository(Asset);
   }

   async create(asset: Partial<Asset>): Promise<Asset> {
      return this.repo.create(asset as any);
   }

   async findById(id: string): Promise<Asset | null> {
      return this.repo.findByPk(id);
   }

   async findByAssetCode(assetCode: string): Promise<Asset | null> {
      return this.repo.findOne({ where: { assetCode } });
   }

   async findAll(): Promise<Asset[]> {
      return this.repo.findAll();
   }

   async update(id: string, asset: Partial<Asset>): Promise<[number, Asset[]]> {
      const [count, rows] = await this.repo.update(asset, { where: { id }, returning: true });
      return [count, rows as Asset[]];
   }

   async delete(id: string): Promise<number> {
      return this.repo.destroy({ where: { id } });
   }
}
