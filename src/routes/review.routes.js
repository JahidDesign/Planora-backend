import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  createReview, updateReview, deleteReview,
  getMyReviews, getEventReviews
} from '../controllers/review.controller.js';

const router = express.Router();
router.post('/', authenticate, createReview);
router.put('/:id', authenticate, updateReview);
router.delete('/:id', authenticate, deleteReview);
router.get('/my', authenticate, getMyReviews);
router.get('/event/:eventId', getEventReviews);

export default router;
