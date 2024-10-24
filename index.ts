import express from 'express';
import routes from './src/routes/routes';

import { Server } from 'socket.io';
import { dbConnect } from './src/dbConnect/dbConnection';

import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import http from 'http';
import morgan from 'morgan';
import dotenv from 'dotenv';

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

app.use('/', routes);

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  dbConnect();
});

export default app;
