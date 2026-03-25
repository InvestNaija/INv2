
import { Container } from 'inversify';
// Services
import { AuthService, HolidayService, RoleService, TenantService, UserService } from './business/services';
import { TYPES } from './business/types';
import { IUserRepository } from './business/repositories';
import { UserRepository } from './business/repositories/sequelize/INv2';
import { HolidayController } from './api/controllers/holiday.controller';
import { GrpcServer } from './grpc/server';
import { GRPHolidayService } from './grpc/services/grpc.holiday.service';

const container = new Container({ defaultScope: 'Singleton'});

/** Define all containers and inject every service */
container.bind(AuthService).toSelf();
container.bind<UserService>(TYPES.UserService).to(UserService);
container.bind<RoleService>(TYPES.RoleService).to(RoleService);
container.bind<TenantService>(TYPES.TenantService).to(TenantService);
container.bind<HolidayService>(TYPES.HolidayService).to(HolidayService);
container.bind<HolidayController>(TYPES.HolidayController).to(HolidayController);
container.bind<GRPHolidayService>(TYPES.GRPHolidayService).to(GRPHolidayService);
container.bind<GrpcServer>(GrpcServer).toSelf();
container.bind<IUserRepository>(TYPES.IUserRepository).to(UserRepository);

export { container };