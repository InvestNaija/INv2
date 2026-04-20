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
exports.SavePlanPmtTxn = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const common_1 = require("@inv2/common");
const __1 = require("..");
let SavePlanPmtTxn = class SavePlanPmtTxn extends sequelize_typescript_1.Model {
    get status() {
        const rawValue = this.getDataValue('status');
        return common_1.DBEnums.OrderStatus.find(g => g.code === rawValue);
    }
    set status(value) {
        var _a, _b;
        const result = (_b = (_a = common_1.DBEnums === null || common_1.DBEnums === void 0 ? void 0 : common_1.DBEnums.OrderStatus) === null || _a === void 0 ? void 0 : _a.find(g => (g.code == value || g.label == value || g.name == value))) === null || _b === void 0 ? void 0 : _b.code;
        this.setDataValue('status', result);
    }
    get type() {
        const rawValue = this.getDataValue('type');
        return common_1.DBEnums.PmtType.find(g => g.code === rawValue);
    }
    set type(value) {
        var _a, _b;
        const result = (_b = (_a = common_1.DBEnums === null || common_1.DBEnums === void 0 ? void 0 : common_1.DBEnums.PmtType) === null || _a === void 0 ? void 0 : _a.find(g => (g.code == value || g.label == value || g.name == value))) === null || _b === void 0 ? void 0 : _b.code;
        this.setDataValue('type', result);
    }
};
exports.SavePlanPmtTxn = SavePlanPmtTxn;
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => __1.SavePlanUser),
    __metadata("design:type", __1.SavePlanUser)
], SavePlanPmtTxn.prototype, "saveplanUsers", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, }),
    __metadata("design:type", Date)
], SavePlanPmtTxn.prototype, "createdAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, }),
    __metadata("design:type", Date)
], SavePlanPmtTxn.prototype, "updatedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, }),
    __metadata("design:type", Date)
], SavePlanPmtTxn.prototype, "deletedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, }),
    __metadata("design:type", Number)
], SavePlanPmtTxn.prototype, "version", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        primaryKey: true,
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
    }),
    __metadata("design:type", String)
], SavePlanPmtTxn.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
    }),
    (0, sequelize_typescript_1.ForeignKey)(() => __1.SavePlanUser),
    __metadata("design:type", String)
], SavePlanPmtTxn.prototype, "saveplanUserId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(30), }),
    __metadata("design:type", String)
], SavePlanPmtTxn.prototype, "reference", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, }),
    __metadata("design:type", String)
], SavePlanPmtTxn.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), }),
    __metadata("design:type", Number)
], SavePlanPmtTxn.prototype, "amount", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.SMALLINT, }),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], SavePlanPmtTxn.prototype, "status", null);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.SMALLINT, }),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], SavePlanPmtTxn.prototype, "type", null);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATEONLY, }),
    __metadata("design:type", Date)
], SavePlanPmtTxn.prototype, "postDate", void 0);
exports.SavePlanPmtTxn = SavePlanPmtTxn = __decorate([
    (0, sequelize_typescript_1.Table)({
        timestamps: true,
        tableName: "saveplan_pmt_txns",
        underscored: true,
        paranoid: true,
    })
], SavePlanPmtTxn);
