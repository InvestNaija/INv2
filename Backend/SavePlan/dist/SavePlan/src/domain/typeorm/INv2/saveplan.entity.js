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
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const typeorm_1 = require("typeorm");
const base_model_1 = require("../base-model");
let User = class User extends base_model_1.Model {
};
exports.User = User;
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "calculator", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 13, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 1000, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "summary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", }),
    __metadata("design:type", String)
], User.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'interest_rate', type: "decimal", precision: 10, scale: 2, }),
    __metadata("design:type", Number)
], User.prototype, "interestRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'min_duration', type: "decimal", precision: 10, scale: 2, }),
    __metadata("design:type", Number)
], User.prototype, "minDuration", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_duration', type: "decimal", precision: 10, scale: 2, }),
    __metadata("design:type", Number)
], User.prototype, "maxDuration", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'min_amount', type: "decimal", precision: 10, scale: 2, }),
    __metadata("design:type", Number)
], User.prototype, "minAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_amount', type: "decimal", precision: 10, scale: 2, }),
    __metadata("design:type", Number)
], User.prototype, "maxAmount", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)({ schema: "public", name: 'users' })
], User);
