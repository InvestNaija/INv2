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
exports.AuthMiddleware = void 0;
const common_1 = require("@inv2/common");
const INv2_1 = require("../../database/sequelize/INv2");
const PasswordManager_1 = require("../_utils/PasswordManager");
const redis_wrapper_1 = require("../../redis.wrapper");
class AuthMiddleware {
    static checkLoginDetails(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const user = yield INv2_1.User.findOne({
                    where: { email: { [INv2_1.Op.iLike]: email } },
                    attributes: ["id", "email", "firstName", "password", "twoFactorAuth"],
                });
                if (!user)
                    throw new common_1.Exception({ code: 404, message: 'Wrong email or password' });
                const correctPassword = yield PasswordManager_1.PasswordManager.compare(user.password, password);
                if (!correctPassword) {
                    // const address = req.connection.remoteAddress;
                    // const limitRes = await (new RateLimiter).consumeLimit(address);
                    // if (limitRes < 2) {
                    //    new EmailService({ recipient: user.email, sender: 'info@investnaija.com', subject: 'Unsuccessful Login Attempt' })
                    //       .setCustomerDetails(user)
                    //       .setEmailType({ type: 'login_failed', meta: user })
                    //       .execute();
                    // }
                    throw new common_1.Exception({ code: 401, message: `Wrong email or password` });
                }
                req.body = Object.assign(Object.assign({}, req.body), user.dataValues);
                next();
            }
            catch (error) {
                if (error instanceof common_1.CustomError)
                    next(new common_1.Exception(error));
                else
                    next(error);
            }
        });
    }
    static check2FA(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.body;
                if (user && user['twoFactorAuth']) {
                    const { token } = req.body;
                    const otpService = new common_1.OtpService(redis_wrapper_1.redisWrapper.client);
                    if (!token) {
                        yield otpService.generateOTP({ user });
                        throw new common_1.Exception({ code: 419, message: '2FA token required', });
                    }
                    else {
                        const verified = yield otpService.verifyOTP({ user, token: user.token });
                        if (!verified || !verified.success) {
                            throw new common_1.Exception({ code: 404, message: verified.message || 'OTP Verification Failed' });
                        }
                    }
                }
                next();
            }
            catch (error) {
                if (error instanceof common_1.CustomError)
                    next(new common_1.Exception(error));
                else
                    next(error);
            }
        });
    }
}
exports.AuthMiddleware = AuthMiddleware;
