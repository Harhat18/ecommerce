import * as express from 'express';
import userRoutes from './user.route';
const router = express.Router();

const base = '/api/v1';

router.use(`${base}/users`, userRoutes);

export default router;

//https:localhost:4000/api/v1/users/get-users
