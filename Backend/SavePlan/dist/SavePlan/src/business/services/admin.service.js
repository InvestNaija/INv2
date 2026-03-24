"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
exports.AdminService = void 0;
const common_1 = require("@inv2/common");
const INv2_1 = require("../../domain/sequelize/INv2");
const publishers_1 = require("../../events/publishers");
const rabbitmq_wrapper_1 = require("../../rabbitmq.wrapper");
const inversify_1 = require("inversify");
const types_1 = require("../types");
let AdminService = class AdminService {
    constructor(saveplanRepo) {
        this.saveplanRepo = saveplanRepo;
    }
    list(type) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const saveplans = yield this.saveplanRepo.findAndCountAll([
                    'id', 'title', 'summary', 'type', 'currency', 'calculator', 'description', 'interestRate', 'createdAt', 'updatedAt'
                ], Object.assign({}, (type && { type: (_b = (_a = common_1.DBEnums === null || common_1.DBEnums === void 0 ? void 0 : common_1.DBEnums.SaveplanType) === null || _a === void 0 ? void 0 : _a.find(g => (g.code == type || g.label == type || g.name == type))) === null || _b === void 0 ? void 0 : _b.code })));
                return { success: true, code: 201, message: `Saveplans retrieved successfully`, count: saveplans.count, data: saveplans.data };
            }
            catch (error) {
                throw new common_1.Exception((0, common_1.handleError)(error));
            }
        });
    }
    create(body) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const saveplan = yield this.saveplanRepo.create(body);
                yield new publishers_1.SaveplanCreatedPublisher(rabbitmq_wrapper_1.rabbitmqWrapper.connection).publish(Object.assign({}, saveplan));
                return { success: true, code: 201, message: `Saveplan created successfully`, data: saveplan };
            }
            catch (error) {
                throw new common_1.Exception((0, common_1.handleError)(error));
            }
        });
    }
    update(id, body, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const t = transaction !== null && transaction !== void 0 ? transaction : (yield ((_a = INv2_1.SavePlan.sequelize) === null || _a === void 0 ? void 0 : _a.transaction()));
            try {
                const saveplan = yield this.saveplanRepo.update(id, body, { transaction: t });
                yield new publishers_1.SaveplanUpdatedPublisher(rabbitmq_wrapper_1.rabbitmqWrapper.connection).publish(Object.assign({}, saveplan));
                if (!transaction)
                    yield t.commit();
                return { success: true, code: 201, message: `Saveplan updated successfully`, data: saveplan };
            }
            catch (error) {
                if (!transaction)
                    yield t.rollback();
                throw new common_1.Exception((0, common_1.handleError)(error));
            }
        });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.ISavePlanRepository)),
    __metadata("design:paramtypes", [Object])
], AdminService);
