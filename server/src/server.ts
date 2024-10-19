import express from 'express';
import routes from './routes/routes';

import { Server } from 'socket.io';
import { dbConnect } from './dbConnect/dbConnection';
import { setupEvents } from './utils/socketConfig/setupEvents';

import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import http from 'http';
import morgan from 'morgan';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(helmet());
app.use(limiter);

const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: '*',
  },
});
setupEvents(io);

app.use('/', routes);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  dbConnect();
});
