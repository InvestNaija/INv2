"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaveplanUpdatedPublisher = void 0;
const common_1 = require("@inv2/common");
class SaveplanUpdatedPublisher extends common_1.Publisher {
    constructor() {
        super(...arguments);
        this.subject = common_1.Subjects.SaveplanUpdated;
    }
}
exports.SaveplanUpdatedPublisher = SaveplanUpdatedPublisher;
