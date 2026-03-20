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
exports.UserUpdatedListener = void 0;
const common_1 = require("@inv2/common");
const types_1 = require("../../business/types");
const inversify_config_1 = require("../../inversify.config");
class UserUpdatedListener extends common_1.Listener {
    constructor() {
        super(...arguments);
        this.userRepo = inversify_config_1.container.get(types_1.TYPES.IUserRepository);
        this.subject = common_1.Subjects.UserUpdated;
        this.queueName = 'user-updated';
    }
    onMessage(data, channel, msg) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!data.user.id || !data.user.version)
                    throw new common_1.Exception({ code: 400, message: `User Id and version are required for update` });
                console.log('======> SavePlan received user updated with id: ', data.user.id);
                // const user = await User.findOne({ where: {id: data.user!.id, version: data.user!.version-1}});
                // if(!user) throw new Exception({code: 400, message: `User with id: ${data.user!.id} and version: ${data.user!.version-1} not found`});
                yield this.userRepo.update(data.user.id, {
                    version: data.user.version,
                    details: Object.assign(Object.assign({}, (data.user)), data.user),
                    tenantRoles: Object.assign(Object.assign({}, (data.tenant)), data.tenant),
                });
                channel.ack(msg);
                console.log(`Message acknowledged`);
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
exports.UserUpdatedListener = UserUpdatedListener;
