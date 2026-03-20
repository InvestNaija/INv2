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
exports.OfferingRepository = void 0;
const inversify_1 = require("inversify");
const sequelize_1 = require("sequelize");
const offering_model_1 = require("../../../../domain/sequelize/INv2/models/offering.model");
let OfferingRepository = class OfferingRepository {
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield offering_model_1.Offering.create(data);
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield offering_model_1.Offering.findByPk(id);
        });
    }
    findAllActive() {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            return yield offering_model_1.Offering.findAll({
                where: {
                    openingDate: { [sequelize_1.Op.lte]: now },
                    closingDate: { [sequelize_1.Op.gte]: now }
                }
            });
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield offering_model_1.Offering.update(data, { where: { id }, returning: true });
        });
    }
};
exports.OfferingRepository = OfferingRepository;
exports.OfferingRepository = OfferingRepository = __decorate([
    (0, inversify_1.injectable)()
], OfferingRepository);
