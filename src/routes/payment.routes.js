import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  createCheckoutSession, stripeWebhook,
  getMyPayments, verifyPayment
} from '../controllers/payment.controller.js';

const router = express.Router();
// Webhook must use raw body — handled in index.js before express.json()
router.post('/webhook', stripeWebhook);
router.post('/create-session', authenticate, createCheckoutSession);
router.get('/my', authenticate, getMyPayments);
router.get('/verify/:eventId', authenticate, verifyPayment);

export default router;
