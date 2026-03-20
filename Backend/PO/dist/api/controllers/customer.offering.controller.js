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
exports.CustomerOfferingController = void 0;
const inversify_express_utils_1 = require("inversify-express-utils");
const inversify_1 = require("inversify");
const common_1 = require("@inv2/common");
const offering_service_1 = require("../../business/services/offering.service");
const order_service_1 = require("../../business/services/order.service");
let CustomerOfferingController = class CustomerOfferingController {
    constructor(offeringSvc, orderSvc) {
        this.offeringSvc = offeringSvc;
        this.orderSvc = orderSvc;
    }
    listOfferings(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const offerings = yield this.offeringSvc.getAvailableOfferings();
                res.status(200).json({ success: true, data: offerings });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getOffering(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const offering = yield this.offeringSvc.getOfferingById(req.params.id);
                if (!offering)
                    throw new common_1.Exception({ code: 404, message: 'Offering not found' });
                res.status(200).json({ success: true, data: offering });
            }
            catch (error) {
                if (error instanceof common_1.CustomError)
                    next(new common_1.Exception(error));
                else
                    next(error);
            }
        });
    }
    buyOffering(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { id } = req.params;
                const { units, gateway } = req.body;
                const user = (_a = req.currentUser) === null || _a === void 0 ? void 0 : _a.user;
                if (!units || !gateway) {
                    throw new common_1.Exception({ code: 400, message: 'Units and gateway are required' });
                }
                const orderResult = yield this.orderSvc.createOrder(user.id, id, Number(units), gateway);
                res.status(200).json({ success: true, message: 'Order initiated', data: orderResult });
            }
            catch (error) {
                if (error instanceof common_1.CustomError)
                    next(new common_1.Exception(error));
                else
                    next(new common_1.Exception({ code: 500, message: error.message }));
            }
        });
    }
};
exports.CustomerOfferingController = CustomerOfferingController;
__decorate([
    (0, inversify_express_utils_1.httpGet)("/"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Function]),
    __metadata("design:returntype", Promise)
], CustomerOfferingController.prototype, "listOfferings", null);
__decorate([
    (0, inversify_express_utils_1.httpGet)("/:id"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Function]),
    __metadata("design:returntype", Promise)
], CustomerOfferingController.prototype, "getOffering", null);
__decorate([
    (0, inversify_express_utils_1.httpPost)("/:id/buy", common_1.Authentication.requireAuth),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Function]),
    __metadata("design:returntype", Promise)
], CustomerOfferingController.prototype, "buyOffering", null);
exports.CustomerOfferingController = CustomerOfferingController = __decorate([
    (0, inversify_express_utils_1.controller)("/offerings"),
    __param(0, (0, inversify_1.inject)(offering_service_1.OfferingService)),
    __param(1, (0, inversify_1.inject)(order_service_1.OrderService)),
    __metadata("design:paramtypes", [offering_service_1.OfferingService,
        order_service_1.OrderService])
], CustomerOfferingController);
