"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
exports.SavePlanRepository = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
// import { CreateUserDto } from "src/dtos/create-user.dto";
const inversify_1 = require("inversify");
const common_1 = require("@inv2/common");
const INv2_1 = require("../../../../domain/sequelize/INv2");
const domain_1 = require("../../../../domain");
let SavePlanRepository = class SavePlanRepository {
    get repo() { var _a; return (_a = (0, domain_1.getDbCxn)()) === null || _a === void 0 ? void 0 : _a.getRepository(INv2_1.SavePlan); }
    transaction() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            return yield ((_a = (0, domain_1.getDbCxn)()) === null || _a === void 0 ? void 0 : _a.transaction());
        });
    }
    commit(t) {
        return __awaiter(this, void 0, void 0, function* () {
            yield t.commit();
        });
    }
    rollback(t) {
        return __awaiter(this, void 0, void 0, function* () {
            yield t.rollback();
        });
    }
    findOne(attributes, where, includes) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.repo.findOne({
                attributes,
                where,
                include: includes || [],
            });
            return user;
        });
    }
    findAll(attributes, where, includes) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield this.repo.findAll({
                attributes,
                where,
                include: includes || [],
            });
            return users;
        });
    }
    findAndCountAll(attributes, where, includes) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield this.repo.findAndCountAll({
                attributes,
                where,
                include: includes || [],
            });
            return { data: users.rows, count: users.count };
        });
    }
    update(id, attributes, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const t = (_a = options === null || options === void 0 ? void 0 : options.transaction) !== null && _a !== void 0 ? _a : yield this.transaction();
            const user = yield this.repo.findByPk(id);
            if (!user)
                throw new common_1.Exception({ code: 404, message: `Couldn't find saveplan` });
            yield this.repo.update(Object.assign({}, attributes), { where: { id }, transaction: t });
            yield user.update(Object.assign({}, attributes), { transaction: t });
            if (!(options === null || options === void 0 ? void 0 : options.transaction))
                yield this.commit(t);
            return user;
        });
    }
    create(createUserDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const saveplan = yield this.repo.create(createUserDto);
            return saveplan;
        });
    }
};
exports.SavePlanRepository = SavePlanRepository;
exports.SavePlanRepository = SavePlanRepository = __decorate([
    (0, inversify_1.injectable)()
], SavePlanRepository);
