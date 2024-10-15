import * as express from 'express';
import { verifyAdmin, verifyToken } from '../middleware/verifyToken';
import { deleteUser, updateUser } from '../controllers/user.controller';

const router = express.Router();

router.get('/getusers', (req, res) => {
  res.send('user has been gotten');
});
router.put('/update/:id', verifyToken, updateUser);
router.delete('/delete/:id', verifyAdmin, deleteUser);
router.get('/getadmin/:id', (req, res) => {
  res.send('user has been gotten');
});
export default router;
