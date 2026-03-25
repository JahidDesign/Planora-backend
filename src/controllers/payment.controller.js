import Stripe from 'stripe';
import prisma from '../utils/prisma.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @desc    Create Stripe checkout session for event join
// @route   POST /api/payments/create-session
// @access  Private
export const createCheckoutSession = async (req, res) => {
  const { eventId, invitationId } = req.body;

  const event = await prisma.event.findUnique({ where: { id: eventId, isDeleted: false } });
  if (!event) return res.status(404).json({ error: 'Event not found.' });

  if (event.fee <= 0) {
    return res.status(400).json({ error: 'This event is free.' });
  }

  if (event.date < new Date()) {
    return res.status(400).json({ error: 'This event has already passed.' });
  }

  // Check if already paid
  const existingPayment = await prisma.payment.findFirst({
    where: { userId: req.user.id, eventId, status: 'COMPLETED' },
  });
  if (existingPayment) {
    return res.status(409).json({ error: 'You have already paid for this event.' });
  }

  // Create pending payment record
  const payment = await prisma.payment.create({
    data: {
      userId: req.user.id,
      eventId,
      amount: event.fee,
      status: 'PENDING',
    },
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Planora — ${event.title}`,
            description: `Registration fee for ${event.title}`,
          },
          unit_amount: Math.round(event.fee * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      paymentId: payment.id,
      userId: req.user.id,
      eventId,
      invitationId: invitationId || '',
    },
    success_url: `${process.env.CLIENT_URL}/events/${eventId}?payment=success`,
    cancel_url: `${process.env.CLIENT_URL}/events/${eventId}?payment=cancelled`,
  });

  await prisma.payment.update({
    where: { id: payment.id },
    data: { stripeSessionId: session.id },
  });

  res.json({ sessionId: session.id, url: session.url });
};

// @desc    Stripe webhook handler
// @route   POST /api/payments/webhook
// @access  Public (Stripe)
export const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { paymentId, userId, eventId, invitationId } = session.metadata;

    await prisma.$transaction(async (tx) => {
      // Update payment
      await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: 'COMPLETED',
          stripePaymentId: session.payment_intent,
          stripeSessionId: session.id,
        },
      });

      // Create participant with PENDING status (awaiting host approval)
      await tx.participant.upsert({
        where: { userId_eventId: { userId, eventId } },
        update: { status: 'PENDING' },
        create: { userId, eventId, status: 'PENDING' },
      });

      // Update invitation if applicable
      if (invitationId) {
        await tx.invitation.update({
          where: { id: invitationId },
          data: { status: 'ACCEPTED' },
        });
      }
    });
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object;
    const { paymentId } = session.metadata;

    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'FAILED' },
    });
  }

  res.json({ received: true });
};

// @desc    Get payment history
// @route   GET /api/payments/my
// @access  Private
export const getMyPayments = async (req, res) => {
  const payments = await prisma.payment.findMany({
    where: { userId: req.user.id },
    include: {
      event: { select: { id: true, title: true, date: true, imageUrl: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ payments });
};

// @desc    Verify payment status
// @route   GET /api/payments/verify/:eventId
// @access  Private
export const verifyPayment = async (req, res) => {
  const { eventId } = req.params;

  const payment = await prisma.payment.findFirst({
    where: { userId: req.user.id, eventId, status: 'COMPLETED' },
  });

  res.json({ paid: !!payment, payment });
};
