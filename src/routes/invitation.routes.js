import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
  sendInvitation, getMyInvitations, acceptInvitation, declineInvitation
} from '../controllers/invitation.controller.js';

const router = express.Router();
router.post('/', protect, sendInvitation);
router.get('/my', protect, getMyInvitations);
router.patch('/:id/accept', protect, acceptInvitation);
router.patch('/:id/decline', protect, declineInvitation);

export default router;
