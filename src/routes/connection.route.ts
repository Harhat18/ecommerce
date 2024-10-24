import express from 'express';

import { verifyToken } from '../middleware/verifyToken';
import {
  deleteConnection,
  getConnectionRequests,
  getSentConnection,
  getUserConnections,
  respondToRequest,
  sendConnectionRequest,
} from '../controllers/connection.controller';

const router = express.Router();

router.post('/sendRequest', verifyToken, sendConnectionRequest);
router.post('/respondRequest', verifyToken, respondToRequest);
router.delete('/deleteConnection', verifyToken, deleteConnection);
router.get('/connectionSend/:phoneNumber', verifyToken, getSentConnection);
router.get(
  '/connectionRequests/:phoneNumber',
  verifyToken,
  getConnectionRequests
);
router.post('/getUserConnections', verifyToken, getUserConnections);

export default router;
