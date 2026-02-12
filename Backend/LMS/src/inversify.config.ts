
import { Container } from 'inversify';
// Services
// import { AuthService, RoleService, TenantService, UserService } from './business/services';
import { TYPES } from './business/types';
import { LmsService } from './business/services';
import { QuizService, QuestionService } from './business/services'
// import { ISavePlanRepository, IUserRepository } from './business/repositories';
// import { SavePlanRepository, UserRepository } from './business/repositories/sequelize/INv2';
import { IQuizRepository } from './business/repositories';
import { QuizRepository } from './business/repositories/sequelize/INv2';
import { IQuestionRepository } from './business/repositories';
import { QuestionRepository } from './business/repositories/sequelize/INv2';

const container = new Container({ defaultScope: 'Singleton' });

/** Define all containers and inject every service */
container.bind(LmsService).toSelf();
container.bind(QuizService).toSelf();
container.bind(QuestionService).toSelf();
container.bind<IQuizRepository>(TYPES.IQuizRepository).to(QuizRepository);
container.bind<IQuestionRepository>(TYPES.IQuestionRepository).to(QuestionRepository);
// container.bind<UserService>(TYPES.UserService).to(UserService);
// container.bind<RoleService>(TYPES.RoleService).to(RoleService);
// container.bind<TenantService>(TYPES.TenantService).to(TenantService);
// container.bind<IUserRepository>(TYPES.IUserRepository).to(UserRepository);
// container.bind<ISavePlanRepository>(TYPES.ISavePlanRepository).to(SavePlanRepository);

export { container };