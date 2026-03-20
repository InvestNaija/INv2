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
exports.OrderService = void 0;
const inversify_1 = require("inversify");
const types_1 = require("../types");
const client_1 = require("../../grpc/client");
const common_1 = require("@inv2/common");
let OrderService = class OrderService {
    constructor(orderRepo, offeringRepo) {
        this.orderRepo = orderRepo;
        this.offeringRepo = offeringRepo;
    }
    createOrder(userId, offeringId, units, gateway) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const offering = yield this.offeringRepo.findById(offeringId);
            if (!offering)
                throw new common_1.Exception({ code: 404, message: 'Offering not found' });
            const now = new Date();
            if (now < offering.openingDate || now > offering.closingDate) {
                throw new common_1.Exception({ code: 400, message: 'Offering is currently not active for purchase' });
            }
            if (units < offering.minimumUnitsToPurchase) {
                throw new common_1.Exception({ code: 400, message: `Minimum units to purchase is ${offering.minimumUnitsToPurchase}` });
            }
            const totalAmount = units * offering.offerPrice;
            const order = yield this.orderRepo.create({
                userId,
                offeringId,
                units,
                totalAmount,
                status: 'PENDING'
            });
            // Call Finance gRPC
            try {
                const client = yield client_1.GrpcClient.start();
                const paymentResponse = yield client_1.GrpcClient.initializePayment(client, {
                    amount: totalAmount,
                    currency: offering.currency,
                    description: `Purchase of ${units} units of ${offering.name}`,
                    user_id: userId,
                    module: 'PO',
                    module_id: order.id,
                    gateway: gateway
                });
                if (paymentResponse.success && ((_a = paymentResponse.data) === null || _a === void 0 ? void 0 : _a.authorizationUrl)) {
                    yield this.orderRepo.updateStatus(order.id, 'PENDING', paymentResponse.data.authorizationUrl);
                    return {
                        orderId: order.id,
                        authorizationUrl: paymentResponse.data.authorizationUrl
                    };
                }
                else {
                    yield this.orderRepo.updateStatus(order.id, 'FAILED');
                    throw new common_1.Exception({ code: 500, message: 'Payment gateway initialization failed' });
                }
            }
            catch (error) {
                yield this.orderRepo.updateStatus(order.id, 'FAILED');
                throw new common_1.Exception({ code: 500, message: `Finance service error: ${error.message}` });
            }
        });
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.IOrderRepository)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.IOfferingRepository)),
    __metadata("design:paramtypes", [Object, Object])
], OrderService);
