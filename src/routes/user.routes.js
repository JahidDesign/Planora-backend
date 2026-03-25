import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  updateProfile, changePassword, getParticipatedEvents
} from '../controllers/user.controller.js';

const router = express.Router();
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);
router.get('/participated-events', authenticate, getParticipatedEvents);

export default router;
