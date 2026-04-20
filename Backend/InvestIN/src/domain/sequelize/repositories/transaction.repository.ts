import { injectable } from 'inversify';
import { AssetTransaction } from '../models/transaction.model';
import { getDbCxn } from '../../index';

export interface IAssetTransactionRepository {
   create(data: Partial<AssetTransaction>): Promise<AssetTransaction>;
   findById(id: string): Promise<AssetTransaction | null>;
   update(id: string, data: Partial<AssetTransaction>): Promise<[number, AssetTransaction[]]>;
   findAndCountAll(options: any): Promise<{ rows: AssetTransaction[]; count: number }>;
}

@injectable()
export class AssetTransactionRepository implements IAssetTransactionRepository {
   private get model() {
      return getDbCxn().pgINv2.models.AssetTransaction as typeof AssetTransaction;
   }

   async create(data: Partial<AssetTransaction>): Promise<AssetTransaction> {
      return await this.model.create(data as any);
   }

   async findById(id: string): Promise<AssetTransaction | null> {
      return await this.model.findByPk(id);
   }

   async update(id: string, data: Partial<AssetTransaction>): Promise<[number, AssetTransaction[]]> {
      return await this.model.update(data, {
         where: { id },
         returning: true,
      });
   }

   async findAndCountAll(options: any): Promise<{ rows: AssetTransaction[]; count: number }> {
      return await this.model.findAndCountAll(options);
   }
}
