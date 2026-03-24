"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserCreatedListener = void 0;
const common_1 = require("@inv2/common");
const types_1 = require("../../business/types");
const inversify_config_1 = require("../../inversify.config");
// @injectable()
class UserCreatedListener extends common_1.Listener {
    constructor() {
        super(...arguments);
        this.userRepo = inversify_config_1.container.get(types_1.TYPES.IUserRepository);
        // @inject(TYPES.IUserRepository) private userRepo!: IUserRepository;
        this.subject = common_1.Subjects.UserCreated;
        this.queueName = 'auth-service';
    }
    onMessage(data, channel, msg) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('======> SavePlan received user created with id: ', data.user.id);
                yield this.userRepo.create({
                    id: data.user.id,
                    pId: data.user.pId,
                    details: data.user,
                    // version: data.user.version,
                    tenantRoles: [Object.assign(Object.assign({}, data.tenant), { roles: [data.role] })]
                });
                channel.ack(msg);
            }
            catch (err) {
                const error = err;
                common_1.INLogger.log.error(error.message);
                // if(error instanceof CustomError) throw new Exception(error);
                // throw new Exception({code: 500, message: error!.message, success: false});
            }
        });
    }
}
exports.UserCreatedListener = UserCreatedListener;
