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
exports.CommonService = void 0;
const common_1 = require("@inv2/common");
const INv2_1 = require("../../domain/sequelize/INv2");
class CommonService {
    list(type) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            // try {
            const saveplans = yield INv2_1.SavePlan.findAndCountAll({
                attributes: ["id", "title", "slug", "type", "calculator", "currency", "interestRate", "minDuration", "maxDuration"],
                where: Object.assign({}, (type && { type: (_b = (_a = common_1.DBEnums === null || common_1.DBEnums === void 0 ? void 0 : common_1.DBEnums.SaveplanType) === null || _a === void 0 ? void 0 : _a.find(g => (g.code == type || g.label == type || g.name == type))) === null || _b === void 0 ? void 0 : _b.code }))
            });
            common_1.INLogger.log.info(`Server running on port`);
            return { success: true, code: 201, message: `User created successfully`, count: saveplans.count, data: saveplans.rows };
            // } catch (error) {
            //    throw new Exception(handleError(error));
            // }
        });
    }
    create(type) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            // try {
            const saveplans = yield INv2_1.SavePlan.findAndCountAll({
                attributes: ["id", "title", "slug", "type", "calculator", "currency", "interestRate", "minDuration", "maxDuration"],
                where: Object.assign({}, (type && { type: (_b = (_a = common_1.DBEnums === null || common_1.DBEnums === void 0 ? void 0 : common_1.DBEnums.SaveplanType) === null || _a === void 0 ? void 0 : _a.find(g => (g.code == type || g.label == type || g.name == type))) === null || _b === void 0 ? void 0 : _b.code }))
            });
            common_1.INLogger.log.info(`Server running on port`);
            return { success: true, code: 201, message: `User created successfully`, count: saveplans.count, data: saveplans.rows };
            // } catch (error) {
            //    throw new Exception(handleError(error));
            // }
        });
    }
    subscribeIntoPlan(type) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
}
exports.CommonService = CommonService;
