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
exports.SavePlanUserLien = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const __1 = require("..");
let SavePlanUserLien = class SavePlanUserLien extends sequelize_typescript_1.Model {
};
exports.SavePlanUserLien = SavePlanUserLien;
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => __1.SavePlanUser),
    __metadata("design:type", __1.SavePlanUser)
], SavePlanUserLien.prototype, "savePlanUser", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, }),
    __metadata("design:type", Date)
], SavePlanUserLien.prototype, "createdAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, }),
    __metadata("design:type", Date)
], SavePlanUserLien.prototype, "updatedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, }),
    __metadata("design:type", Date)
], SavePlanUserLien.prototype, "deletedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, }),
    __metadata("design:type", Number)
], SavePlanUserLien.prototype, "version", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        primaryKey: true,
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
    }),
    __metadata("design:type", String)
], SavePlanUserLien.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
    }),
    (0, sequelize_typescript_1.ForeignKey)(() => __1.SavePlanUser),
    __metadata("design:type", String)
], SavePlanUserLien.prototype, "savePlanUserId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), }),
    __metadata("design:type", Number)
], SavePlanUserLien.prototype, "amount", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(500), }),
    __metadata("design:type", String)
], SavePlanUserLien.prototype, "narration", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.BOOLEAN, }),
    __metadata("design:type", Boolean)
], SavePlanUserLien.prototype, "isCleared", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), }),
    __metadata("design:type", Number)
], SavePlanUserLien.prototype, "balance", void 0);
exports.SavePlanUserLien = SavePlanUserLien = __decorate([
    (0, sequelize_typescript_1.Table)({
        timestamps: true,
        tableName: "saveplan_user_liens",
        underscored: true,
        paranoid: true,
    })
], SavePlanUserLien);
