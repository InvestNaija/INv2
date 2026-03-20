"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfferingUpdatedPublisher = void 0;
const common_1 = require("@inv2/common");
class OfferingUpdatedPublisher extends common_1.Publisher {
    constructor() {
        super(...arguments);
        this.subject = common_1.Subjects.OfferingUpdated;
    }
}
exports.OfferingUpdatedPublisher = OfferingUpdatedPublisher;
