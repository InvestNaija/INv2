
import { Container } from 'inversify';
//Middleware
import { AuthMiddleware } from './api/middlewares/auth.middleware';
// Services
import { AuthService, HolidayService, PasswordHistoryService, RoleService, TenantService, UserService } from './business/services';
import { TYPES } from './business/types';
import { IUserRepository } from './business/repositories';
import { UserRepository } from './business/repositories/sequelize/INv2';
import { PasswordHistoryRepository } from './business/repositories/sequelize/INv2/password-history.repository';
import { IPasswordHistoryRepository } from './business/repositories/IPasswordHistoryRepository';
import { HolidayController } from './api/controllers/holiday.controller';
import { AuthController } from './api/controllers/auth.controller';
import { GrpcServer } from './grpc/server';
import { GRPHolidayService } from './grpc/services/grpc.holiday.service';

const container = new Container({ defaultScope: 'Singleton'});

/** Define all containers and inject every service */
container.bind<HolidayController>(TYPES.HolidayController).to(HolidayController);
container.bind<AuthController>(TYPES.AuthController).to(AuthController);
container.bind<HolidayController>(HolidayController).toSelf();
container.bind<AuthController>(AuthController).toSelf();

container.bind(AuthService).toSelf();
container.bind<AuthMiddleware>(TYPES.AuthMiddleware).to(AuthMiddleware);
container.bind<UserService>(TYPES.UserService).to(UserService);
container.bind<RoleService>(TYPES.RoleService).to(RoleService);
container.bind<TenantService>(TYPES.TenantService).to(TenantService);
container.bind<HolidayService>(TYPES.HolidayService).to(HolidayService);
container.bind<GRPHolidayService>(TYPES.GRPHolidayService).to(GRPHolidayService);
container.bind<GrpcServer>(TYPES.GrpcServer).to(GrpcServer);
container.bind<IUserRepository>(TYPES.IUserRepository).to(UserRepository);
container.bind<PasswordHistoryService>(TYPES.PasswordHistoryService).to(PasswordHistoryService);
container.bind<IPasswordHistoryRepository>(TYPES.IPasswordHistoryRepository).to(PasswordHistoryRepository);

export { container };