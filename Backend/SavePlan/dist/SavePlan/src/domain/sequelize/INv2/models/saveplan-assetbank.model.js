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
exports.SavePlanAssetBank = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const common_1 = require("@inv2/common");
const __1 = require("..");
let SavePlanAssetBank = class SavePlanAssetBank extends sequelize_typescript_1.Model {
    get txnType() {
        const rawValue = this.getDataValue('txnType');
        return common_1.DBEnums.PmtType.find(g => g.code === rawValue);
    }
    set txnType(value) {
        var _a, _b;
        const result = (_b = (_a = common_1.DBEnums.PmtType) === null || _a === void 0 ? void 0 : _a.find(g => (g.code == value || g.label == value || g.name == value))) === null || _b === void 0 ? void 0 : _b.code;
        this.setDataValue('txnType', result);
    }
};
exports.SavePlanAssetBank = SavePlanAssetBank;
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => __1.SavePlan),
    __metadata("design:type", __1.SavePlan)
], SavePlanAssetBank.prototype, "saveplan", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => __1.SavePlanGLEntity),
    __metadata("design:type", __1.SavePlanGLEntity)
], SavePlanAssetBank.prototype, "glEntity", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, }),
    __metadata("design:type", Date)
], SavePlanAssetBank.prototype, "createdAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, }),
    __metadata("design:type", Date)
], SavePlanAssetBank.prototype, "updatedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, }),
    __metadata("design:type", Date)
], SavePlanAssetBank.prototype, "deletedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, }),
    __metadata("design:type", Number)
], SavePlanAssetBank.prototype, "version", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        primaryKey: true,
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
    }),
    __metadata("design:type", String)
], SavePlanAssetBank.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID }),
    __metadata("design:type", String)
], SavePlanAssetBank.prototype, "pId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
    }),
    (0, sequelize_typescript_1.ForeignKey)(() => __1.SavePlan),
    __metadata("design:type", String)
], SavePlanAssetBank.prototype, "saveplanId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
    }),
    (0, sequelize_typescript_1.ForeignKey)(() => __1.SavePlanGLEntity),
    __metadata("design:type", String)
], SavePlanAssetBank.prototype, "glEntityId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, }),
    __metadata("design:type", String)
], SavePlanAssetBank.prototype, "bankName", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, }),
    __metadata("design:type", String)
], SavePlanAssetBank.prototype, "nameOnAccount", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(20), }),
    __metadata("design:type", String)
], SavePlanAssetBank.prototype, "accountNumber", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(10), }),
    __metadata("design:type", String)
], SavePlanAssetBank.prototype, "bankCode", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, }),
    __metadata("design:type", String)
], SavePlanAssetBank.prototype, "businessName", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, }),
    __metadata("design:type", String)
], SavePlanAssetBank.prototype, "email", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.SMALLINT, }),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], SavePlanAssetBank.prototype, "txnType", null);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.SMALLINT, }),
    __metadata("design:type", String)
], SavePlanAssetBank.prototype, "split", void 0);
exports.SavePlanAssetBank = SavePlanAssetBank = __decorate([
    (0, sequelize_typescript_1.Table)({
        timestamps: true,
        tableName: "saveplan_asset_banks",
        underscored: true,
        paranoid: true,
    })
], SavePlanAssetBank);
