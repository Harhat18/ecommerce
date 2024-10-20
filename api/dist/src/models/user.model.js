"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema } = mongoose_1.default;
const userModel = new Schema({
    phoneNumber: { type: String, required: true, unique: true },
    deviceId: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    isPro: { type: Boolean, default: false },
    isVerify: { type: Boolean, default: false },
    verificationCode: { type: String },
    verificationAttempts: { type: Number, default: 1 },
    lastVerificationAttempt: { type: Date },
    activeSessionToken: { type: String },
    socketId: { type: String },
}, {
    timestamps: true,
});
exports.User = mongoose_1.default.model('Users', userModel, 'users');
