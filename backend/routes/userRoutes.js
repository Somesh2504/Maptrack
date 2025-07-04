import express from 'express';
import { registerUser, loginUser, getAllUsersExceptCurrent, shareLocation, stopSharingLocation } from '../controllers/userController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/all', getAllUsersExceptCurrent);
router.put('/share-location', shareLocation);
router.put('/stop-sharing-location', stopSharingLocation);

export default router;