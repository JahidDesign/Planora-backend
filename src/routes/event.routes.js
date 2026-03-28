import express from 'express';
import { body } from 'express-validator';
import {
  getEvents, getEvent, getFeaturedEvent, createEvent,
  updateEvent, deleteEvent, getMyEvents, getEventParticipants
} from '../controllers/event.controller.js';
import { protect, optionalAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

const eventValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 100 }),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('fee').optional().isFloat({ min: 0 }).withMessage('Fee must be a positive number'),
  body('type').optional().isIn(['PUBLIC', 'PRIVATE']).withMessage('Type must be PUBLIC or PRIVATE'),
];

router.get('/', optionalAuth, getEvents);
router.get('/featured', getFeaturedEvent);
router.get('/my-events', protect, getMyEvents);
router.get('/:id', optionalAuth, getEvent);
router.get('/:id/participants', protect, getEventParticipants);
router.post('/', protect, eventValidation, createEvent);
router.put('/:id', protect, eventValidation, updateEvent);
router.delete('/:id', protect, deleteEvent);

export default router;
