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
exports.UserService = void 0;
const common_1 = require("@inv2/common");
const INv2_1 = require("../../database/sequelize/INv2");
const helper_1 = require("../_utils/helper");
const user_created_1 = require("../../events/publishers/user-created");
const rabbitmq_wrapper_1 = require("../../rabbitmq.wrapper");
class UserService {
    createUser(tur, sendOtp, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            const t = transaction !== null && transaction !== void 0 ? transaction : (yield ((_a = INv2_1.User.sequelize) === null || _a === void 0 ? void 0 : _a.transaction()));
            try {
                const emailExists = yield INv2_1.User.findOne({
                    attributes: ['id', 'email', 'bvn'],
                    where: { [INv2_1.Op.or]: Object.assign({ email: { [INv2_1.Op[((_b = INv2_1.User.sequelize) === null || _b === void 0 ? void 0 : _b.getDialect()) === 'postgres' ? 'iLike' : 'like']]: tur.user.email } }, (tur.user.bvn && { bvn: String(tur.user.bvn) })) },
                });
                if (emailExists)
                    throw new common_1.Exception({ code: 404, message: `Email/BVN already registered` });
                tur.user.isEnabled = false;
                tur.user.isLocked = true;
                // Generate refCode for user
                const refCode = ((_e = (_d = (_c = tur.user) === null || _c === void 0 ? void 0 : _c.firstName) === null || _d === void 0 ? void 0 : _d.charAt(0)) !== null && _e !== void 0 ? _e : '') + ((_h = (_g = (_f = tur.user) === null || _f === void 0 ? void 0 : _f.lastName) === null || _g === void 0 ? void 0 : _g.charAt(0)) !== null && _h !== void 0 ? _h : '');
                let refCodeExists = 0;
                tur.user.refCode = '';
                do {
                    tur.user.refCode = refCode.replace(/[^a-zA-Z]/g, '').toUpperCase() + helper_1.Helper.generatePassword(2, { includeSpecialChars: false });
                    refCodeExists = yield INv2_1.User.count({ where: { refCode: `${tur.user.refCode}` }, });
                } while (refCodeExists > 0);
                // Create user in users table
                const createdUser = yield INv2_1.User.create(tur.user, {
                    attributes: ['id', 'firstName', 'middleName', 'lastName', 'email'],
                    transaction: t, returning: true,
                });
                yield INv2_1.TenantUserRole.create({
                    tenantId: tur.tenant.id,
                    userId: createdUser.id,
                    roleId: tur.role.id
                }, { transaction: t });
                delete createdUser.dataValues.password;
                // Publish the newly created user to the queue
                yield new user_created_1.UserCreatedPublisher(rabbitmq_wrapper_1.rabbitmqWrapper.connection).publish({
                    tenant: tur.tenant,
                    user: createdUser.toJSON(),
                    role: tur.role
                });
                if (!transaction)
                    yield t.commit();
                return { success: true, code: 200, message: `User created successfully`, data: createdUser };
            }
            catch (error) {
                console.log(error);
                if (!transaction)
                    yield t.rollback();
                if (error instanceof common_1.CustomError)
                    throw new common_1.Exception(error);
                else if (error instanceof Error)
                    throw new common_1.Exception({ code: 500, message: error.message });
                else
                    return new common_1.Exception({ code: 500, message: `An error occured`, success: false });
            }
        });
    }
}
exports.UserService = UserService;
