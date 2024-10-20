"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAdmin = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).send('Access Denied');
        return;
    }
    try {
        const verified = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (typeof verified !== 'string') {
            req.user = verified;
            next();
        }
        else {
            res.status(400).send('Invalid Token');
        }
    }
    catch (error) {
        console.log(error);
        res.status(400).send('Invalid Token');
    }
};
exports.verifyToken = verifyToken;
const verifyAdmin = (req, res, next) => {
    (0, exports.verifyToken)(req, res, () => {
        var _a;
        if ((_a = req.user) === null || _a === void 0 ? void 0 : _a.isAdmin) {
            next();
        }
        else {
            res.status(403).send('User is not an Admin');
        }
    });
};
exports.verifyAdmin = verifyAdmin;
