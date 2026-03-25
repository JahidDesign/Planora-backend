import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  joinEvent, approveParticipant, rejectParticipant,
  banParticipant, leaveEvent
} from '../controllers/participant.controller.js';

const router = express.Router();
router.post('/join/:eventId', authenticate, joinEvent);
router.patch('/:participantId/approve', authenticate, approveParticipant);
router.patch('/:participantId/reject', authenticate, rejectParticipant);
router.patch('/:participantId/ban', authenticate, banParticipant);
router.delete('/leave/:eventId', authenticate, leaveEvent);

export default router;
