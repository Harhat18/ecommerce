"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupEvents = setupEvents;
const user_model_1 = require("../../models/user.model");
function setupEvents(io) {
    io.on('connection', (socket) => {
        const phoneNumber = socket.handshake.query.phoneNumber;
        if (phoneNumber) {
            user_model_1.User.findOneAndUpdate({ phoneNumber }, { socketId: socket.id }, { new: true })
                .then((user) => {
                if (user) {
                    console.log(`${user.phoneNumber} kullanıcısı ${socket.id} ile bağlandı.`);
                }
                else {
                    console.log('Kullanıcı bulunamadı.');
                }
            })
                .catch((error) => {
                console.error('SocketId kaydedilirken hata oluştu:', error);
            });
        }
        else {
            console.log('deviceId gönderilmedi.');
        }
        socket.on('disconnect', () => {
            console.log('Kullanıcı bağlantıyı kapattı');
        });
    });
}
