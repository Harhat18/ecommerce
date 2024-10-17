import express from 'express';
import {
  getUserOrder,
  getOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  getMonthlyIncome,
} from '../controllers/order.controller';
import { verifyAdmin, verifyToken } from '../middleware/verifyToken';

const router = express.Router();

router.post('/', verifyToken, createOrder);
router.put('/:id', verifyAdmin, updateOrder);
router.delete('/:id', verifyToken, deleteOrder);
router.get('/:id', verifyToken, getUserOrder);
router.get('/', verifyToken, getOrders);
router.get('/stats/income', verifyAdmin, getMonthlyIncome);

export default router;
