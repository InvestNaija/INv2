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
exports.GlService = void 0;
const common_1 = require("@inv2/common");
const INv2_1 = require("../../domain/sequelize/INv2");
const inversify_1 = require("inversify");
const types_1 = require("../types");
let GlService = class GlService {
    constructor(saveplanRepo) {
        this.saveplanRepo = saveplanRepo;
    }
    create(saveplanId, body) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const saveplan = yield INv2_1.SavePlanGLEntity.create(Object.assign(Object.assign({}, body), { saveplanId }));
                return { success: true, code: 201, message: `GL created successfully`, data: saveplan };
            }
            catch (error) {
                throw new common_1.Exception((0, common_1.handleError)(error));
            }
        });
    }
    findAll(saveplanId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { rows, count } = yield INv2_1.SavePlanGLEntity.findAndCountAll({ where: { saveplanId } });
                return { success: true, code: 201, message: `GLs fetched successfully`, data: rows, count };
            }
            catch (error) {
                throw new common_1.Exception((0, common_1.handleError)(error));
            }
        });
    }
    findOne(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { rows, count } = yield INv2_1.SavePlanGLEntity.findOne({ where: { saveplanId } });
                return { success: true, code: 201, message: `GLs fetched successfully`, data: rows, count };
            }
            catch (error) {
                throw new common_1.Exception((0, common_1.handleError)(error));
            }
        });
    }
    update(id, body, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const t = transaction !== null && transaction !== void 0 ? transaction : (yield ((_a = INv2_1.SavePlanGLEntity.sequelize) === null || _a === void 0 ? void 0 : _a.transaction()));
            try {
                const gl = yield INv2_1.SavePlanGLEntity.findByPk(id, { transaction: t });
                if (!gl)
                    throw new common_1.Exception({ code: 400, message: `Plan not found` });
                gl.update(Object.assign({}, body), { transaction: t });
                if (!transaction)
                    yield t.commit();
                return { success: true, code: 201, message: `GL updated successfully`, data: gl };
            }
            catch (error) {
                if (!transaction)
                    yield t.rollback();
                throw new common_1.Exception((0, common_1.handleError)(error));
            }
        });
    }
};
exports.GlService = GlService;
exports.GlService = GlService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.ISavePlanRepository)),
    __metadata("design:paramtypes", [Object])
], GlService);
