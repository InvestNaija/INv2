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
exports.Tenant = void 0;
const typeorm_1 = require("typeorm");
const Model_1 = require("../Model");
let Tenant = class Tenant extends Model_1.Model {
};
exports.Tenant = Tenant;
__decorate([
    (0, typeorm_1.Column)({ name: "p_id", type: "uuid" }),
    __metadata("design:type", String)
], Tenant.prototype, "pId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, name: "tenant_type" }),
    __metadata("design:type", String)
], Tenant.prototype, "tenantType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Tenant.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], Tenant.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, unique: true }),
    __metadata("design:type", String)
], Tenant.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, }),
    __metadata("design:type", String)
], Tenant.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_enabled" }),
    __metadata("design:type", Boolean)
], Tenant.prototype, "isEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_locked" }),
    __metadata("design:type", Boolean)
], Tenant.prototype, "isLocked", void 0);
exports.Tenant = Tenant = __decorate([
    (0, typeorm_1.Entity)({ name: 'tenants' })
], Tenant);
