import * as express from 'express';
import userRoutes from './user.route';
import authRoutes from './auth.route';
import connectionRoutes from './connection.route';
import locationRoutes from './location.route';

const router = express.Router();

const base = '/api/v1';

router.use(`${base}/users`, userRoutes);
router.use(`${base}/auth`, authRoutes);
router.use(`${base}/connections`, connectionRoutes);
router.use(`${base}/locations`, locationRoutes);

export default router;
