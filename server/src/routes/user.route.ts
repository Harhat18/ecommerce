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

router.get('/getusers', (req, res) => {
  res.send('user has been gotten');
});
router.put('/update/:id', verifyToken, updateUser);
router.delete('/delete/:id', verifyAdmin, deleteUser);
router.get('/getadmin/:id', verifyAdmin, getAdmin);
router.get('/', verifyToken, getAllUsers);
router.get('/stats', verifyAdmin, getUserStat);

export default router;
