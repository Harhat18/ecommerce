import express from 'express';

import { verifyToken } from '../middleware/verifyToken';
import {
  deleteConnection,
  getConnectionRequests,
  getSentConnection,
  getMyConnections,
  respondToRequest,
  sendConnectionRequest,
} from '../controllers/connection.controller';

const router = express.Router();

router.post('/sendRequest', verifyToken, sendConnectionRequest);
router.post('/respondRequest', verifyToken, respondToRequest);
router.delete('/deleteConnection', verifyToken, deleteConnection);
router.get('/connectionSend/:phoneNumber', verifyToken, getSentConnection);
router.get('/getMyConnections/:phoneNumber', verifyToken, getMyConnections);
router.get(
  '/connectionRequests/:phoneNumber',
  verifyToken,
  getConnectionRequests
);

export default router;
