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
const inversify_1 = require("inversify");
const user_entity_1 = require("../../../../domain/typeorm/INv2/user.entity");
const domain_1 = require("../../../../domain");
const common_1 = require("@inv2/common");
let UserRepository = class UserRepository {
    constructor() {
        var _a;
        this.repo = (_a = (0, domain_1.getDbCxn)('toINv2')) === null || _a === void 0 ? void 0 : _a.getRepository(user_entity_1.User);
    }
    // create<T>(createUserDto: CreateUserDto, options?: Partial<IQueryOptions>): Promise<T | null> {
    //    throw new Error("Method not implemented.");
    // }
    transaction() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const queryRunner = (_a = (0, domain_1.getDbCxn)().toINv2) === null || _a === void 0 ? void 0 : _a.createQueryRunner();
            if (!queryRunner) {
                throw new Error("Failed to create query runner");
            }
            yield queryRunner.startTransaction();
            return queryRunner;
        });
    }
    commit(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            if (queryRunner) {
                yield queryRunner.commitTransaction();
                yield queryRunner.release();
            }
            else {
                throw new Error("No active transaction to commit");
            }
        });
    }
    rollback(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            if (queryRunner) {
                yield queryRunner.rollbackTransaction();
                yield queryRunner.release();
            }
            else {
                throw new Error("No active transaction to rollback");
            }
        });
    }
    findByEmail(email, attributes, tenantId, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const t = (_a = options === null || options === void 0 ? void 0 : options.transaction) !== null && _a !== void 0 ? _a : yield this.transaction();
            const queryBuilder = this.repo.createQueryBuilder("user");
            queryBuilder.where("user.email = :email", { email });
            if (tenantId) {
                queryBuilder.andWhere("user.tenantId = :tenantId", { tenantId });
            }
            if (attributes && attributes.length > 0) {
                queryBuilder.select(attributes.map(attr => `user.${attr}`));
            }
            const user = yield queryBuilder.getOne();
            if (!(options === null || options === void 0 ? void 0 : options.transaction))
                yield this.commit(t);
            return user;
        });
    }
    findOne(attributes, where, includes) {
        return __awaiter(this, void 0, void 0, function* () {
            const queryBuilder = this.repo.createQueryBuilder("user");
            if (attributes && attributes.length > 0) {
                queryBuilder.select(attributes.map(attr => `user.${attr}`));
            }
            Object.keys(where).forEach((key, index) => {
                queryBuilder.andWhere(`user.${key} = :value${index}`, { [`value${index}`]: where[key] });
            });
            if (includes && includes.length > 0) {
                includes.forEach(include => {
                    queryBuilder.leftJoinAndSelect(`user.${include}`, include);
                });
            }
            const user = yield queryBuilder.getOne();
            return user;
        });
    }
    create(data, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const t = (_a = options === null || options === void 0 ? void 0 : options.transaction) !== null && _a !== void 0 ? _a : yield this.transaction();
            try {
                const user = this.repo.create({
                    // id: data.user!.id,
                    details: JSON.stringify(data.user),
                    // version: data.user.version,
                    tenantRoles: JSON.stringify([Object.assign(Object.assign({}, data.tenant), { roles: [data.role] })])
                });
                yield this.repo.save(user);
                if (!(options === null || options === void 0 ? void 0 : options.transaction))
                    yield this.commit(t);
                return user;
            }
            catch (err) {
                const error = err;
                if (error instanceof common_1.CustomError)
                    throw new common_1.Exception(error);
                throw new common_1.Exception({ code: 500, message: error.message, success: false });
            }
        });
    }
    update(id, attributes, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const t = (_a = options === null || options === void 0 ? void 0 : options.transaction) !== null && _a !== void 0 ? _a : yield this.transaction();
            try {
                yield this.repo.update(id, Object.assign({}, attributes));
                const updatedUser = yield this.repo.findOne({ where: { id } });
                if (!(options === null || options === void 0 ? void 0 : options.transaction))
                    yield this.commit(t);
                return updatedUser;
            }
            catch (err) {
                const error = err;
                if (error instanceof common_1.CustomError)
                    throw new common_1.Exception(error);
                throw new common_1.Exception({ code: 500, message: error.message, success: false });
            }
        });
    }
};
exports.UserRepository = UserRepository;
exports.UserRepository = UserRepository = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], UserRepository);
