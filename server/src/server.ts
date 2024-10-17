import express from 'express';
import { dbConnect } from './dbConnect/dbConnection';
import routes from './routes/routes';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { setupEvents } from './utils/socketConfig/setupEvents';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/', routes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

setupEvents(io);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  dbConnect();
});
