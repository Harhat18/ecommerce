import * as express from 'express';
import userRoutes from './user.route';
import authRoutes from './auth.route';
import connectionRoutes from './connection.route';

const router = express.Router();

const base = '/api/v1';

router.use(`${base}/users`, userRoutes);
router.use(`${base}/auth`, authRoutes);
router.use(`${base}/connections`, connectionRoutes);

export const connections: { [key: string]: any } = {};
console.log(connections);

router.use(`${base}/sse/:phoneNumber`, (req, res) => {
  const phoneNumber = req.params.phoneNumber;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  connections[phoneNumber] = res;

  req.on('close', () => {
    delete connections[phoneNumber];
  });
});
export default router;
