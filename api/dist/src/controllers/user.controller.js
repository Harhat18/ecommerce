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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserStat = exports.getAllUsers = exports.getAdmin = exports.deleteUser = exports.updateUser = void 0;
const user_model_1 = require("../models/user.model");
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedUser = yield user_model_1.User.findByIdAndUpdate(req.params.id, {
            $set: req.body,
        }, { new: true });
        if (!updatedUser) {
            res.status(404).send({ message: 'User not found' });
            return;
        }
        res.status(200).send({
            message: 'User has been updated successfully',
            data: updatedUser,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ message: 'User update failed', error });
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield user_model_1.User.findByIdAndDelete(req.params.id);
        res.status(200).send({ message: 'User has been deleted successfully' });
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ message: 'User delete failed', error });
    }
});
exports.deleteUser = deleteUser;
const getAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admin = yield user_model_1.User.findById(req.params.id);
        if (!admin) {
            res.status(404).send({ message: 'User cant be found' });
            return;
        }
        res
            .status(200)
            .send({ message: 'User has been found successfully', admin });
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ message: 'User query failed', error });
    }
});
exports.getAdmin = getAdmin;
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query.latest;
    try {
        const users = query
            ? yield user_model_1.User.find().sort({ _id: -1 }).limit(3)
            : yield user_model_1.User.find();
        res
            .status(200)
            .send({ message: 'User has been found successfully', data: users });
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ message: 'User query failed', error });
    }
});
exports.getAllUsers = getAllUsers;
const getUserStat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const date = new Date();
        const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));
        const userStats = yield user_model_1.User.aggregate([
            { $match: { createdAt: { $gte: lastYear } } },
            {
                $project: {
                    month: { $month: '$createdAt' },
                },
            },
            {
                $group: {
                    _id: '$month',
                    total: { $sum: 1 },
                },
            },
        ]);
        res
            .status(200)
            .send({ message: 'User Data Retrieved successfully', userStats });
    }
    catch (error) {
        console.log(error);
        res.status(500).send({
            message: 'An error occurred aquiring User Stat',
            error: error.message,
        });
    }
});
exports.getUserStat = getUserStat;
