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
exports.AuthService = void 0;
const common_1 = require("@inv2/common");
const _1 = require(".");
class AuthService {
    signup(body) {
        return __awaiter(this, void 0, void 0, function* () {
            const roleService = new _1.RoleService;
            const { data: roles } = yield roleService.getRoles({ roleName: 'CUSTOMER' });
            const tenantService = new _1.TenantService;
            const { data: tenants } = yield tenantService.getTenants({ code: 'CHDS' });
            const userService = new _1.UserService;
            const user = yield userService.createUser({ user: body, tenant: tenants[0], role: roles[0] });
            return user;
        });
    }
    signin(body, tenant) {
        return __awaiter(this, void 0, void 0, function* () {
            const userService = new _1.UserService;
            const { data: signin } = yield userService.signin(body, tenant);
            let response = { code: 200, message: `User login successful`, extra: {}, data: {} };
            if (signin.Tenant.length > 1) {
                signin.Tenant.forEach((tenant) => {
                    delete tenant.dataValues.Roles;
                });
                response = Object.assign(Object.assign({}, response), { extra: { multiTenant: true }, data: signin });
            }
            else {
                const token = common_1.JWTService.createJWTToken(JSON.parse(JSON.stringify(signin)), process.env.ACCESS_TOKEN_SECRET, process.env.ACCESS_TOKEN_TIME);
                if (!token.success)
                    throw new common_1.Exception({ code: token.code || 500, message: token.message || `Error creating access token` });
                response = Object.assign(Object.assign({}, response), { extra: { multiTenant: false, token: token.data }, data: signin });
            }
            return response;
        });
    }
    set2FA(currentUser, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const userService = new _1.UserService;
            const set2FA = yield userService.set2FA(currentUser, body);
            return set2FA;
        });
    }
}
exports.AuthService = AuthService;
