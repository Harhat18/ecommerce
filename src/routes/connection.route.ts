import express from 'express';

import { verifyToken } from '../middleware/verifyToken';
import {
  deleteConnection,
  respondToRequest,
  sendConnectionRequest,
} from '../controllers/connection.controller';

const router = express.Router();

router.post('/sendRequest', verifyToken, sendConnectionRequest);
router.post('/respondRequest', verifyToken, respondToRequest);
router.post('/deleteConnection', verifyToken, deleteConnection);

export default router;
