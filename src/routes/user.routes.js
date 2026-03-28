import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
  updateProfile, changePassword, getParticipatedEvents
} from '../controllers/user.controller.js';

const router = express.Router();
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.get('/participated-events', protect, getParticipatedEvents);

export default router;
