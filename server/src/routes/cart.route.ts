import express from 'express';
import {
  getUserCartItem,
  getCartItems,
  createCart,
  updateCart,
  deleteCart,
} from '../controllers/cart.controller';
import { verifyToken } from '../middleware/verifyToken';

const router = express.Router();

router.post('/', verifyToken, createCart);
router.put('/:id', verifyToken, updateCart);
router.delete('/:id', verifyToken, deleteCart);
router.get('/:id', verifyToken, getUserCartItem);
router.get('/', verifyToken, getCartItems);

export default router;
