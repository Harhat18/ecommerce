import * as express from 'express';
import { verifyAdmin, verifyToken } from '../middleware/verifyToken';
import {
  deleteUser,
  getAdmin,
  getAllUsers,
  updateUser,
  getUserStat,
} from '../controllers/user.controller';

const router = express.Router();

router.put('/update/:id', verifyToken, updateUser);
router.delete('/delete/:id', verifyToken, deleteUser);
router.get('/getadmin/:id', verifyToken, getAdmin);
router.get('/', verifyAdmin, getAllUsers);
router.get('/stats', verifyAdmin, getUserStat);

export default router;
