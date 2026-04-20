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
exports.UserRepository = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
// import { CreateUserDto } from "src/dtos/create-user.dto";
const INv2_1 = require("../../../../domain/sequelize/INv2");
const domain_1 = require("../../../../domain");
const inversify_1 = require("inversify");
const common_1 = require("@inv2/common");
let UserRepository = class UserRepository {
    get userRepo() { var _a; return (_a = (0, domain_1.getDbCxn)()) === null || _a === void 0 ? void 0 : _a.getRepository(INv2_1.User); }
    // create<T>(createUserDto: CreateUserDto): Promise<T> {
    //    console.log(createUserDto);
    //    throw new Error("Method not implemented.");
    // }
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
            const user = yield this.userRepo.findOne({
                attributes,
                where,
                include: includes || [],
            });
            return user;
        });
    }
    findByEmail(email, attributes, tenantId, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const t = (_a = options.transaction) !== null && _a !== void 0 ? _a : yield this.transaction();
            const user = yield this.userRepo.findOne({
                attributes,
                where: { email: { [INv2_1.Op[((_b = INv2_1.User.sequelize) === null || _b === void 0 ? void 0 : _b.getDialect()) === 'postgres' ? 'iLike' : 'like']]: email }, },
                transaction: t,
            });
            if (!options.transaction)
                yield this.commit(t);
            if (!user)
                return {};
            return user;
        });
    }
    update(id, attributes, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const t = (_a = options === null || options === void 0 ? void 0 : options.transaction) !== null && _a !== void 0 ? _a : yield this.transaction();
            const user = yield this.userRepo.findByPk(id);
            if (!user)
                throw new common_1.Exception({ code: 404, message: `Couldn't find user` });
            // await this.repo.update({...attributes}, {where: {id}, transaction: t});
            yield user.update(Object.assign({}, attributes), { transaction: t });
            if (!(options === null || options === void 0 ? void 0 : options.transaction))
                yield this.commit(t);
            return user;
        });
    }
    create(createUserDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = this.userRepo.create({
                id: createUserDto.user.id,
                pId: createUserDto.user.pId,
                details: createUserDto,
                tenantRoles: createUserDto.tenant,
            });
            // await this.repo.save(user);
            return user;
        });
    }
};
exports.UserRepository = UserRepository;
exports.UserRepository = UserRepository = __decorate([
    (0, inversify_1.injectable)()
], UserRepository);
