"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyCode = exports.codeSend = void 0;
const user_model_1 = require("../models/user.model");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const server_1 = require("../../server");
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
const codeSend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phoneNumber, deviceId, socketId } = req.body;
        let user = yield user_model_1.User.findOne({ phoneNumber });
        if (!user) {
            const newUser = new user_model_1.User({ phoneNumber, deviceId, socketId });
            const verificationCode = generateVerificationCode();
            newUser.verificationCode = verificationCode;
            newUser.lastVerificationAttempt = new Date();
            yield newUser.save();
            const token = jsonwebtoken_1.default.sign({ userId: newUser._id, isAdmin: newUser.isAdmin }, process.env.JWT_SECRET);
            console.log(`Yeni kullanici kodu: ${verificationCode}`);
            res.status(201).json({ message: 'Kod gönderildi', user: newUser, token });
            return;
        }
        if (user.deviceId !== deviceId) {
            user.isVerify = false;
            res.status(403).json({ message: "Cihaz ID'si uyuşmuyor." });
            return;
        }
        const currentTime = new Date();
        const timeSinceLastAttempt = user.lastVerificationAttempt
            ? currentTime.getTime() - user.lastVerificationAttempt.getTime()
            : 0;
        if (user.verificationAttempts >= 3 && timeSinceLastAttempt < 60000) {
            const timeRemaining = 60000 - timeSinceLastAttempt;
            const minutesRemaining = Math.floor(timeRemaining / 60000);
            const secondsRemaining = Math.floor((timeRemaining % 60000) / 1000);
            res.status(429).json({
                message: 'Günlük istek limitine ulaşıldı.',
                timeRemaining: `Kalan Süre ${minutesRemaining}:${secondsRemaining}`,
            });
            return;
        }
        if (timeSinceLastAttempt >= 60000) {
            user.verificationAttempts = 0;
        }
        const verificationCode = generateVerificationCode();
        user.verificationCode = verificationCode;
        user.verificationAttempts += 1;
        user.lastVerificationAttempt = new Date();
        yield user.save();
        const token = jsonwebtoken_1.default.sign({ userId: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET);
        console.log(`Kullanici kodu: ${verificationCode}`);
        res.status(200).json({ message: 'Kod gönderildi', user, token });
    }
    catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error });
    }
});
exports.codeSend = codeSend;
const verifyCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phoneNumber, code, deviceId, socketId } = req.body;
        const user = yield user_model_1.User.findOne({ phoneNumber });
        if (!user || user.verificationCode !== code) {
            res.status(400).json({ message: 'Geçersiz kod' });
            return;
        }
        if (user && user.deviceId !== deviceId) {
            if (user.socketId) {
                server_1.io.to(user.socketId).emit('logout', {
                    message: 'Başka bir cihazdan giriş yapıldı',
                });
            }
            user.socketId = socketId;
            user.deviceId = deviceId;
            yield user.save();
        }
        else if (!user) {
            const newUser = new user_model_1.User({ phoneNumber, deviceId, socketId });
            yield newUser.save();
        }
        user.verificationCode = null;
        user.isVerify = true;
        res.status(200).json({ message: 'Kullanıcı kayıt edildi', user });
    }
    catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error });
    }
});
exports.verifyCode = verifyCode;
