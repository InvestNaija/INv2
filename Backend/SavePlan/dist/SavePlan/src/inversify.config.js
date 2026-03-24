"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = void 0;
const inversify_1 = require("inversify");
// Services
// import { AuthService, RoleService, TenantService, UserService } from './business/services';
const types_1 = require("./business/types");
const services_1 = require("./business/services");
const INv2_1 = require("./business/repositories/sequelize/INv2");
const container = new inversify_1.Container({ defaultScope: 'Singleton' });
exports.container = container;
/** Define all containers and inject every service */
container.bind(services_1.AdminService).toSelf();
container.bind(services_1.GlService).toSelf();
container.bind(services_1.CustomerSaveplanService).toSelf();
// container.bind<UserService>(TYPES.UserService).to(UserService);
// container.bind<RoleService>(TYPES.RoleService).to(RoleService);
// container.bind<TenantService>(TYPES.TenantService).to(TenantService);
container.bind(types_1.TYPES.IUserRepository).to(INv2_1.UserRepository);
container.bind(types_1.TYPES.ISavePlanRepository).to(INv2_1.SavePlanRepository);
