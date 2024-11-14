import * as express from 'express';
import { verifyAdmin, verifyToken } from '../middleware/verifyToken';
import {
  deleteUser,
  getAdmin,
  getAllUsers,
  updateUser,
  getUserStat,
  createUserPhoto,
  deleteUserPhoto,
} from '../controllers/user.controller';
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.put('/update/:id', verifyToken, updateUser);
router.delete('/delete/:id', verifyToken, deleteUser);
router.get('/getadmin/:id', verifyToken, getAdmin);
router.get('/', verifyAdmin, getAllUsers);
router.get('/stats', verifyAdmin, getUserStat);
router.post(
  '/createUserPhoto',
  verifyToken,
  upload.single('image'),
  createUserPhoto
);
router.delete('/deleteUserPhoto', verifyToken, deleteUserPhoto);

export default router;
