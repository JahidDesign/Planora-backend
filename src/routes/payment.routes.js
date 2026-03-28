import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
  createCheckoutSession,
  createSubscriptionSession,
  stripeWebhook,
  getMyPayments,
  verifyPayment,
} from '../controllers/payment.controller.js';

const router = express.Router();

// Webhook — raw body, must be BEFORE express.json() (handled in app.ts)
router.post('/webhook', stripeWebhook);

// Event payment
router.post('/create-session', protect, createCheckoutSession);


router.post('/create-subscription-session', protect, createSubscriptionSession);

router.get('/my', protect, getMyPayments);
router.get('/verify/:eventId', protect, verifyPayment);

export default router;