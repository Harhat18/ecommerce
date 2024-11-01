import express from 'express';
import { verifyToken } from '../middleware/verifyToken';
import {
  getAllConnectedUsersLocations,
  updateUserLocation,
} from '../controllers/location.controller';

const router = express.Router();

router.post('/sendLocation', verifyToken, updateUserLocation);
router.get(
  '/getAllConnectedUsersLocations',
  verifyToken,
  getAllConnectedUsersLocations
);

export default router;
