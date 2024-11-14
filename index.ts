import express from 'express';
import routes from './src/routes/routes';
import { Server } from 'socket.io';
import { dbConnect } from './src/dbConnect/dbConnection';
import helmet from 'helmet';
import cors from 'cors';
import http from 'http';
import morgan from 'morgan';
import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

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
app.use('/', routes);
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  const { phoneNumber } = socket.handshake.query;
  if (typeof phoneNumber !== 'string') return;
  socket.join(phoneNumber);

  console.log('New client connected:', phoneNumber);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', phoneNumber);
  });
});

type Client = {
  phoneNumber: string;
  res: express.Response;
};

export let clients: Client[] = [];

clients.forEach((client) => {
  console.log(client.phoneNumber);
});

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

const ONE_SIGNAL_APP_ID = '59c983d2-3c27-4451-9e5d-b5bc649dcf88';
const ONE_SIGNAL_API_KEY = 'ZDRlMjBhZmQtOTA2My00NzljLWI2M2EtZmM0MGU1ZWQ5YWE1';

app.post('/sendTargetedNotification', async (req, res) => {
  const { title, message } = req.body;

  const notificationData = {
    app_id: ONE_SIGNAL_APP_ID,
    included_segments: ['All'],
    headings: { en: title },
    contents: { en: message },
    large_icon:
      'https://cdn.pixabay.com/photo/2014/11/30/14/11/cat-551554_1280.jpg',
    big_picture:
      'https://cdn.pixabay.com/photo/2014/11/30/14/11/cat-551554_1280.jpg',
  };

  try {
    const response = await axios.post(
      'https://onesignal.com/api/v1/notifications',
      notificationData,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${ONE_SIGNAL_API_KEY}`,
        },
      }
    );

    // Log and send success response
    console.log('Notification sent successfully:', response.data);
    res.status(200).send(`Notification sent successfully: ${response.data}`);
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).send('Error sending notification');
  }
});

app.get('/', async (req, res) => {
  res.status(200).send(`buradayım`);
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  dbConnect();
});

export default app;
