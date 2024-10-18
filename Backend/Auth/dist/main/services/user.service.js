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
const sequelize_1 = require("sequelize");
const user_created_1 = require("../../events/publishers/user-created");
const rabbitmq_wrapper_1 = require("../../rabbitmq.wrapper");
const redis_wrapper_1 = require("../../redis.wrapper");
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
                    throw new common_1.Exception({ code: 400, message: `Email/BVN already registered` });
                tur.user.isEnabled = false;
                tur.user.isLocked = true;
                // Generate refCode for user
                const refCode = ((_e = (_d = (_c = tur.user) === null || _c === void 0 ? void 0 : _c.firstName) === null || _d === void 0 ? void 0 : _d.charAt(0)) !== null && _e !== void 0 ? _e : '') + ((_h = (_g = (_f = tur.user) === null || _f === void 0 ? void 0 : _f.lastName) === null || _g === void 0 ? void 0 : _g.charAt(0)) !== null && _h !== void 0 ? _h : '');
                let refCodeExists = 0;
                tur.user.refCode = '';
                do {
                    tur.user.refCode = refCode.replace(/[^a-zA-Z]/g, '').toUpperCase() + common_1.Helper.generatePassword(2, { includeSpecialChars: false });
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
                const otpResp = yield (new common_1.OtpService(redis_wrapper_1.redisWrapper.client)).generateOTP({ user: { id: createdUser.id, email: createdUser.email, name: createdUser.firstName } });
                if (!otpResp || !otpResp.success)
                    throw new common_1.Exception({ code: 400, message: `Error occured while processing request` });
                if (!transaction)
                    yield t.commit();
                return { success: true, code: 201, message: `User created successfully`, data: createdUser };
            }
            catch (error) {
                const err = error;
                if (!transaction)
                    yield t.rollback();
                if (error instanceof common_1.CustomError)
                    throw new common_1.Exception(error);
                else if (error instanceof (sequelize_1.ValidationError || sequelize_1.SequelizeScopeError || sequelize_1.DatabaseError))
                    throw new common_1.Exception({ code: 500, message: error.errors[0].message });
                else
                    return new common_1.Exception({ code: 500, message: err.message, success: false });
            }
        });
    }
    signin(body, tenant) {
        return __awaiter(this, void 0, void 0, function* () {
            const chkUsr = yield this.loginByEmail(body, tenant);
            const user = UserService.reformat(chkUsr.data);
            return { success: true, code: 200, message: `User created successfully`, data: user };
        });
    }
    set2FA(currentUser, body) {
        return __awaiter(this, void 0, void 0, function* () {
            yield INv2_1.User.update({
                twoFactorAuth: body.enable2fa
            }, { where: { id: currentUser.user.id } });
            return { success: true, code: 200, message: `2FA ${body.enable2fa ? 'enabled' : 'disabled'}` };
        });
    }
    loginByEmail(body, tenant) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield INv2_1.User.findOne({
                attributes: ["id", "bvn", "firstName", "lastName", "firstLogin", "email", "password", "uuidToken", "isEnabled", "isLocked"],
                where: { email: { [INv2_1.Op.iLike]: body.email }, },
                include: [
                    {
                        model: INv2_1.TenantUserRole, where: Object.assign({}, ((tenant === null || tenant === void 0 ? void 0 : tenant.id) && { tenantId: tenant.id })), required: false,
                        include: [
                            { model: INv2_1.Tenant, attributes: ["id", "name"], },
                            { model: INv2_1.Role, attributes: ["name"], },
                        ]
                    }
                ],
            });
            if (!user)
                throw new common_1.Exception({ code: 404, message: 'Wrong email or password' });
            if (!user.isEnabled && user.isLocked)
                throw new common_1.Exception({ code: 423, message: 'Account inactive and locked. Please activate to continue' });
            // if (!user.isEnabled) throw new AppError('Account not active. Please activate to continue', __line, __path.basename(__filename), { status: 404, show: true });
            yield user.update({
                uuidToken: common_1.Helper.generateOTCode(32, true),
                firstLogin: false
            });
            return { success: true, code: 200, message: `User login successful`, data: user };
        });
    }
    static reformat(user) {
        const tenants = [];
        user.tenantUserRoles.forEach((item) => {
            const index = tenants.findIndex(t => (t.id === item.tenant.id));
            if (index < 0) {
                item.tenant.dataValues.Roles = [item.role];
                tenants.push(item.tenant);
            }
            else {
                tenants[index].dataValues.Roles.push(item.role);
            }
        });
        delete user.dataValues.tenantUserRoles;
        delete user.dataValues.password;
        delete user.dataValues.email;
        // user.dataValues.Tenant = tenants;
        return { user: user.dataValues, Tenant: tenants };
    }
}
exports.UserService = UserService;
