import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  sendInvitation, getMyInvitations, acceptInvitation, declineInvitation
} from '../controllers/invitation.controller.js';

const router = express.Router();
router.post('/', authenticate, sendInvitation);
router.get('/my', authenticate, getMyInvitations);
router.patch('/:id/accept', authenticate, acceptInvitation);
router.patch('/:id/decline', authenticate, declineInvitation);

export default router;
