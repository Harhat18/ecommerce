import express from 'express';
import { stripe } from '../controllers/payment.controller';

const router = express.Router();

router.post('/', stripe);

export default router;
