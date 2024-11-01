import express from 'express';

import { verifyToken } from '../middleware/verifyToken';
import {
  deleteConfirmConnection,
  deleteConnection,
  getConfirmedConnections,
  getConnectionRequests,
  getSentConnection,
  respondToRequest,
  sendConnectionRequest,
  updateUserLocation,
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
router.get(
  '/getConfirmedConnections/:phoneNumber',
  verifyToken,
  getConfirmedConnections
);
router.delete(
  '/deleteConfirmedConnection',
  verifyToken,
  deleteConfirmConnection
);
router.post('/userLocation', verifyToken, updateUserLocation);

export default router;
