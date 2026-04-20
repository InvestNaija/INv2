import { Subjects } from './subjects';

export interface AssetCreatedEvent {
   subject: Subjects.InvestINAssetCreated;
   data: {
      id: string;
      assetCode: string;
      name: string;
      currency?: string;
      [key: string]: any;
   };
}
