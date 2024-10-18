"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_routes_1 = require("./auth.routes");
const BaseRoutes = (app) => {
    const routes = () => {
        app.use(`/api/v2/auth`, auth_routes_1.authRoutes.routes());
    };
    routes();
};
exports.default = BaseRoutes;
