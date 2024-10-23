import express from 'express';
import { codeSend, verifyCode } from '../controllers/auth.controller';
import { verifyToken } from '../middleware/verifyToken';

const router = express.Router();

router.post('/codeSend', codeSend);
router.post('/verifyCode', verifyToken, verifyCode);

export default router;
