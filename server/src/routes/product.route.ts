import express from 'express';
import { verifyAdmin, verifyToken } from '../middleware/verifyToken';
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from '../controllers/product.controller';
import { parser } from '../utils/cloudinary/cloudinary';

const router = express.Router();

router.post('/', verifyAdmin, parser.single('image'), createProduct);
router.put('/:id', verifyAdmin, parser.single('image'), updateProduct);
router.delete('/:id', verifyAdmin, deleteProduct);
router.get('/:id', getProduct);
router.get('/', getProducts);

export default router;
