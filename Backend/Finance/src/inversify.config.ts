
import { Container } from 'inversify';
// Services
import { AuthService, RoleService, TenantService, UserService } from './business/services';
import { TYPES } from './business/types';
import { IUserRepository } from './business/repositories';
import { UserRepository } from './business/repositories/sequelize/INv2';

const container = new Container({ defaultScope: 'Singleton'});

/** Define all containers and inject every service */
container.bind(AuthService).toSelf();
container.bind<UserService>(TYPES.UserService).to(UserService);
container.bind<RoleService>(TYPES.RoleService).to(RoleService);
container.bind<TenantService>(TYPES.TenantService).to(TenantService);
container.bind<IUserRepository>(TYPES.IUserRepository).to(UserRepository);

export { container };