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
}
exports.AuthService = AuthService;
