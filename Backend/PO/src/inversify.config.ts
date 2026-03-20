import "reflect-metadata";
import { Container } from 'inversify';
import { TYPES } from './business/types';

// Services bound to themselves
import { OfferingService } from './business/services/offering.service';
import { OrderService } from './business/services/order.service';

// Repositories bound to Symbols
import { IOfferingRepository } from './business/repositories/ioffering.repository';
import { OfferingRepository } from './business/repositories/sequelize/INv2/offering.repository';
import { IOrderRepository } from './business/repositories/iorder.repository';
import { OrderRepository } from './business/repositories/sequelize/INv2/order.repository';

const container = new Container({ defaultScope: 'Singleton'});

/** Define all containers and inject every service */
container.bind(OfferingService).toSelf();
container.bind(OrderService).toSelf();

container.bind<IOfferingRepository>(TYPES.IOfferingRepository).to(OfferingRepository);
container.bind<IOrderRepository>(TYPES.IOrderRepository).to(OrderRepository);

export { container };
