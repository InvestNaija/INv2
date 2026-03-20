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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
exports.OfferingService = void 0;
const inversify_1 = require("inversify");
const common_1 = require("@inv2/common");
const types_1 = require("../types");
const rabbitmq_wrapper_1 = require("../../rabbitmq.wrapper");
const offering_created_publisher_1 = require("../../events/publishers/offering-created.publisher");
const offering_updated_publisher_1 = require("../../events/publishers/offering-updated.publisher");
let OfferingService = class OfferingService {
    constructor(offeringRepo) {
        this.offeringRepo = offeringRepo;
    }
    createOffering(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const offering = yield this.offeringRepo.create(data);
            yield new offering_created_publisher_1.OfferingCreatedPublisher(rabbitmq_wrapper_1.rabbitmqWrapper.connection).publish({
                id: offering.id,
                name: offering.name,
                offerPrice: offering.offerPrice,
                currency: offering.currency
            });
            return offering;
        });
    }
    getAvailableOfferings() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.offeringRepo.findAllActive();
        });
    }
    getOfferingById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.offeringRepo.findById(id);
        });
    }
    updateOffering(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const offering = yield this.offeringRepo.findById(id);
            if (!offering)
                throw new common_1.Exception({ code: 404, message: 'Offering not found' });
            const [affectedCount, updatedOfferings] = yield this.offeringRepo.update(id, data);
            const updatedOffering = updatedOfferings[0];
            yield new offering_updated_publisher_1.OfferingUpdatedPublisher(rabbitmq_wrapper_1.rabbitmqWrapper.connection).publish({
                id: updatedOffering.id,
                name: updatedOffering.name,
                offerPrice: updatedOffering.offerPrice,
                currency: updatedOffering.currency
            });
            return updatedOffering;
        });
    }
};
exports.OfferingService = OfferingService;
exports.OfferingService = OfferingService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.IOfferingRepository)),
    __metadata("design:paramtypes", [Object])
], OfferingService);
