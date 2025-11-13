
import { Container } from 'inversify';
// Services
import { PaymentService } from './business/services';
import { TYPES } from './business/types';
// import { IUserRepository } from './business/repositories';
// import { UserRepository } from './business/repositories/sequelize/INv2';
import { IPaymentFactory } from './business/services/gateways/ipayment.factory';
import { PaymentFactory } from './business/services/gateways/payment.factory';
import { TransactionService } from './business/services/transaction.service';
import { ITxnRepository, IUserRepository } from './business/repositories';
import { TxnRepository } from './business/repositories/sequelize/INv2';
import { UserRepository } from './business/repositories/sequelize/INv2/user.repository';
import { GPCPaymentService } from './grpc/services/grpc.payment.service';
import { GrpcServer } from './grpc/server';

const container = new Container({ defaultScope: 'Singleton'});

/** Define all containers and inject every service */

container.bind<IUserRepository>(TYPES.IUserRepository).to(UserRepository);
container.bind<TransactionService>(TYPES.TransactionService).to(TransactionService);
container.bind<IPaymentFactory>(TYPES.PaymentFactory).to(PaymentFactory);
container.bind<ITxnRepository>(TYPES.ITxnRepository).to(TxnRepository);
container.bind<PaymentService>(TYPES.PaymentService).to(PaymentService);
container.bind<GrpcServer>(TYPES.GrpcServer).to(GrpcServer);
container.bind<GPCPaymentService>(TYPES.GPCPaymentService).to(GPCPaymentService);
// at the end of inversify.config.ts

export { container };