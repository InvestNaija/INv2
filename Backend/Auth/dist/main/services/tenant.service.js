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
exports.TenantService = void 0;
const sequelize_1 = require("sequelize");
const INv2_1 = require("../../database/sequelize/INv2");
class TenantService {
    getTenants(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const criteria = {
                where: { [sequelize_1.Op.or]: [
                        ...[params.id && { "id": params.id }],
                        ...[params.name && { "name": params.name }],
                        ...[params.code && { "code": params.code }]
                    ] },
                includes: []
            };
            const data = (yield INv2_1.Tenant.findAll(criteria)) || [];
            return { success: true, code: 200, show: true, message: `Tenant(s) fetched successfully`, data };
        });
    }
}
exports.TenantService = TenantService;
