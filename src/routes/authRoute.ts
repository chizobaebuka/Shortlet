import express from 'express';
import { getAllUsers, loginUser, logoutUser, signupUser } from '../controllers/authCtrl';

const router = express.Router();

router.post('/create', signupUser)
router.post('/login', loginUser)
router.get('/', getAllUsers)
router.post('/logout', logoutUser)

export default router;