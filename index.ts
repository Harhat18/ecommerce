import express from 'express';
import routes from './src/routes/routes';

import { Server } from 'socket.io';
import { dbConnect } from './src/dbConnect/dbConnection';

import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import http from 'http';
import morgan from 'morgan';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
// });

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
// app.use(limiter);

const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  console.log('Yeni bir kullanıcı bağlandı');

  socket.on('register', (phoneNumber: string) => {
    socket.join(phoneNumber);
  });

  socket.on('disconnect', () => {
    console.log('Kullanıcı bağlantısı kesildi');
  });
});

app.use('/', routes);

type Client = {
  phoneNumber: string;
  res: express.Response;
};

export let clients: Client[] = [];

app.get('/events/:phoneNumber', (req, res) => {
  const phoneNumber = req.params.phoneNumber as string;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  clients.push({ phoneNumber, res });
  req.on('close', () => {
    clients = clients.filter((client) => client.res !== res);
    res.end();
  });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  dbConnect();
});

export default app;
