"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
class Notification {
    constructor(type, options) {
        this.type = type;
        this.options = options;
        this.from = [];
        this.to = [];
        this.attachments = [];
        this.template = 'default.html';
        this.subject = '';
    }
}
exports.Notification = Notification;
