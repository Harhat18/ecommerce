import { Server, Socket } from 'socket.io';

export function setupEvents(io: Server): void {
  io.on('connection', (socket: Socket) => {
    console.log('Bağlandın => SocketID', socket.id);

    socket.on('send-location', (data) => {
      io.emit('receive-locations', { id: socket.id, ...data });
      console.log('data', socket.id, data);
    });

    socket.on('disconnect', () => {
      console.log('Bir kullanıcı bağlantıyı kapattı');
    });
  });
}
