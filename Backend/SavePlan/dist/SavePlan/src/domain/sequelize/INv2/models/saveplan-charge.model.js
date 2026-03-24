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
exports.SavePlanCharge = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const DBEnums_1 = require("../../../DBEnums");
const __1 = require("..");
let SavePlanCharge = class SavePlanCharge extends sequelize_typescript_1.Model {
    get frequency() {
        const rawValue = this.getDataValue('frequency');
        return DBEnums_1.DBEnums.ChargeTypeFrequency.find(g => g.code === rawValue);
    }
    set frequency(value) {
        var _a, _b;
        const result = (_b = (_a = DBEnums_1.DBEnums.ChargeTypeFrequency) === null || _a === void 0 ? void 0 : _a.find(g => (g.code == value || g.label == value || g.name == value))) === null || _b === void 0 ? void 0 : _b.code;
        this.setDataValue('frequency', result);
    }
    get chargedOn() {
        const rawValue = this.getDataValue('chargedOn');
        return DBEnums_1.DBEnums.ChargeOn.find(g => g.code === rawValue);
    }
    set chargedOn(value) {
        var _a, _b;
        const result = (_b = (_a = DBEnums_1.DBEnums.ChargeOn) === null || _a === void 0 ? void 0 : _a.find(g => (g.code == value || g.label == value || g.name == value))) === null || _b === void 0 ? void 0 : _b.code;
        this.setDataValue('chargedOn', result);
    }
};
exports.SavePlanCharge = SavePlanCharge;
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => __1.SavePlan),
    __metadata("design:type", __1.SavePlan)
], SavePlanCharge.prototype, "saveplan", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, }),
    __metadata("design:type", Date)
], SavePlanCharge.prototype, "createdAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, }),
    __metadata("design:type", Date)
], SavePlanCharge.prototype, "updatedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, }),
    __metadata("design:type", Date)
], SavePlanCharge.prototype, "deletedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, }),
    __metadata("design:type", Number)
], SavePlanCharge.prototype, "version", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        primaryKey: true,
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
    }),
    __metadata("design:type", String)
], SavePlanCharge.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
    }),
    (0, sequelize_typescript_1.ForeignKey)(() => __1.SavePlan),
    __metadata("design:type", String)
], SavePlanCharge.prototype, "saveplanId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, }),
    __metadata("design:type", String)
], SavePlanCharge.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, }),
    __metadata("design:type", String)
], SavePlanCharge.prototype, "glEntityId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), }),
    __metadata("design:type", Number)
], SavePlanCharge.prototype, "rate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), }),
    __metadata("design:type", Number)
], SavePlanCharge.prototype, "startDuration", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), }),
    __metadata("design:type", Number)
], SavePlanCharge.prototype, "endDuration", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, }),
    __metadata("design:type", Number)
], SavePlanCharge.prototype, "order", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.SMALLINT, }),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], SavePlanCharge.prototype, "frequency", null);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.SMALLINT, }),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], SavePlanCharge.prototype, "chargedOn", null);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.BOOLEAN, }),
    __metadata("design:type", Boolean)
], SavePlanCharge.prototype, "isActive", void 0);
exports.SavePlanCharge = SavePlanCharge = __decorate([
    (0, sequelize_typescript_1.Table)({
        timestamps: true,
        tableName: "saveplan_charges",
        underscored: true,
        paranoid: true,
    })
], SavePlanCharge);
