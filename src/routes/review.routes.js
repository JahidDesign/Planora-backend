import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
  createReview, updateReview, deleteReview,
  getMyReviews, getEventReviews
} from '../controllers/review.controller.js';

const router = express.Router();
router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.get('/my', protect, getMyReviews);
router.get('/event/:eventId', getEventReviews);

export default router;
