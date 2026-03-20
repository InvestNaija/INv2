"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfferingCreatedPublisher = void 0;
const common_1 = require("@inv2/common");
class OfferingCreatedPublisher extends common_1.Publisher {
    constructor() {
        super(...arguments);
        this.subject = common_1.Subjects.OfferingCreated;
    }
}
exports.OfferingCreatedPublisher = OfferingCreatedPublisher;
