import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
  joinEvent, approveParticipant, rejectParticipant,
  banParticipant, leaveEvent
} from '../controllers/participant.controller.js';

const router = express.Router();
router.post('/join/:eventId', protect, joinEvent);
router.patch('/:participantId/approve', protect, approveParticipant);
router.patch('/:participantId/reject', protect, rejectParticipant);
router.patch('/:participantId/ban', protect, banParticipant);
router.delete('/leave/:eventId', protect, leaveEvent);

export default router;
