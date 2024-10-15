import * as express from 'express';
import userRoutes from './user.route';
import authRoutes from './auth.route';
const router = express.Router();

const base = '/api/v1';

router.use(`${base}/users`, userRoutes);
router.use(`${base}/auth`, authRoutes);

export default router;

//https:localhost:4000/api/v1/users/get-users
