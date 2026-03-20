"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = void 0;
require("reflect-metadata");
const inversify_1 = require("inversify");
const types_1 = require("./business/types");
// Services bound to themselves
const offering_service_1 = require("./business/services/offering.service");
const order_service_1 = require("./business/services/order.service");
const offering_repository_1 = require("./business/repositories/sequelize/INv2/offering.repository");
const order_repository_1 = require("./business/repositories/sequelize/INv2/order.repository");
const container = new inversify_1.Container({ defaultScope: 'Singleton' });
exports.container = container;
/** Define all containers and inject every service */
container.bind(offering_service_1.OfferingService).toSelf();
container.bind(order_service_1.OrderService).toSelf();
container.bind(types_1.TYPES.IOfferingRepository).to(offering_repository_1.OfferingRepository);
container.bind(types_1.TYPES.IOrderRepository).to(order_repository_1.OrderRepository);
