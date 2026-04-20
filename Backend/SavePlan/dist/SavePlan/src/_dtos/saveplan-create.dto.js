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
exports.SaveplanCreateDto = void 0;
const class_validator_1 = require("class-validator");
class SaveplanCreateDto {
}
exports.SaveplanCreateDto = SaveplanCreateDto;
__decorate([
    (0, class_validator_1.IsUUID)(4),
    __metadata("design:type", String)
], SaveplanCreateDto.prototype, "productId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SaveplanCreateDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Number)
], SaveplanCreateDto.prototype, "initialAmt", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SaveplanCreateDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Boolean)
], SaveplanCreateDto.prototype, "custom", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SaveplanCreateDto.prototype, "frequency", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Object)
], SaveplanCreateDto.prototype, "duration", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SaveplanCreateDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SaveplanCreateDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SaveplanCreateDto.prototype, "customEndDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SaveplanCreateDto.prototype, "gateway", void 0);
