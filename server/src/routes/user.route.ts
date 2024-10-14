import * as express from 'express';

const router = express.Router();

router.get('/get-users', (req, res) => {
  res.send('user has been gotten');
});
export default router;
