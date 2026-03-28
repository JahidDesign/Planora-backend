import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
  createCheckoutSession, stripeWebhook,
  getMyPayments, verifyPayment
} from '../controllers/payment.controller.js';

const router = express.Router();
// Webhook must use raw body — handled in index.js before express.json()
router.post('/webhook', stripeWebhook);
router.post('/create-session', protect, createCheckoutSession);
router.get('/my', protect, getMyPayments);
router.get('/verify/:eventId', protect, verifyPayment);

export default router; 
