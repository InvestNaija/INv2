import { Container } from 'inversify';
import { TYPES } from './business/types';
import { AssetRepository, IAssetRepository } from './domain/sequelize/repositories/asset.repository';
import {
   AssetTransactionRepository,
   IAssetTransactionRepository,
} from './domain/sequelize/repositories/transaction.repository';
import { AssetService } from './business/services/asset.service';
import { AssetSubscriptionService } from './business/services/subscription.service';
import { ZanibalService } from './business/services/zanibal.service';
import { HolidayRepository, IHolidayRepository } from './domain/sequelize/repositories/holiday.repository';
import { HolidayService } from './business/services/holiday.service';
import { GrpcClient } from './grpc/client';

const container = new Container({ defaultScope: 'Singleton' });

/** Define all containers and inject every service */
container.bind<IAssetRepository>(TYPES.AssetRepository).to(AssetRepository);
container.bind<IAssetTransactionRepository>(TYPES.AssetTransactionRepository).to(AssetTransactionRepository);
container.bind(AssetService).toSelf();
container.bind(AssetSubscriptionService).toSelf();
container.bind(ZanibalService).toSelf();
container.bind<IHolidayRepository>(TYPES.HolidayRepository).to(HolidayRepository);
container.bind(TYPES.HolidayService).to(HolidayService);

/** gRPC Client Binding */
container.bind(GrpcClient).toSelf();

export { container };
