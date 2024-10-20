import { Server } from 'socket.io';
import { User } from '../../models/user.model';

export function setupEvents(io: Server): void {
  io.on('connection', (socket) => {
    const phoneNumber = socket.handshake.query.phoneNumber;

    if (phoneNumber) {
      User.findOneAndUpdate(
        { phoneNumber },
        { socketId: socket.id },
        { new: true }
      )
        .then((user) => {
          if (user) {
            console.log(
              `${user.phoneNumber} kullanıcısı ${socket.id} ile bağlandı.`
            );
          } else {
            console.log('Kullanıcı bulunamadı.');
          }
        })
        .catch((error) => {
          console.error('SocketId kaydedilirken hata oluştu:', error);
        });
    } else {
      console.log('telefon numarası gönderilmedi.');
    }
    socket.on('disconnect', () => {
      console.log('Kullanıcı bağlantıyı kapattı');
    });
  });
}
