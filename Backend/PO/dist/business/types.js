"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TYPES = void 0;
// Following SavePlan, we only define keys for Repositories and external clients here. Services bind to themselves.
exports.TYPES = {
    IOfferingRepository: Symbol.for("IOfferingRepository"),
    IOrderRepository: Symbol.for("IOrderRepository")
};
