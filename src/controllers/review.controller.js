import prisma from '../utils/prisma.js';

// Review editable window: 48 hours after creation
const REVIEW_EDIT_WINDOW_HOURS = 48;

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res) => {
  const { eventId, rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
  }

  const event = await prisma.event.findUnique({ where: { id: eventId, isDeleted: false } });
  if (!event) return res.status(404).json({ error: 'Event not found.' });

  // Must be a past event
  if (event.date > new Date()) {
    return res.status(400).json({ error: 'You can only review events that have passed.' });
  }

  // Must be a participant
  const participant = await prisma.participant.findUnique({
    where: { userId_eventId: { userId: req.user.id, eventId } },
  });

  if (!participant || participant.status !== 'APPROVED') {
    return res.status(403).json({ error: 'You must have attended this event to leave a review.' });
  }

  const existing = await prisma.review.findUnique({
    where: { userId_eventId: { userId: req.user.id, eventId } },
  });

  if (existing) {
    return res.status(409).json({ error: 'You have already reviewed this event.' });
  }

  const editableUntil = new Date();
  editableUntil.setHours(editableUntil.getHours() + REVIEW_EDIT_WINDOW_HOURS);

  const review = await prisma.review.create({
    data: { userId: req.user.id, eventId, rating: parseInt(rating), comment, editableUntil },
    include: { user: { select: { id: true, name: true, avatar: true } } },
  });

  res.status(201).json({ message: 'Review submitted successfully.', review });
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) return res.status(404).json({ error: 'Review not found.' });

  if (review.userId !== req.user.id) {
    return res.status(403).json({ error: 'Not authorized to edit this review.' });
  }

  if (new Date() > review.editableUntil) {
    return res.status(403).json({ error: 'Review edit window has expired (48 hours).' });
  }

  const updated = await prisma.review.update({
    where: { id },
    data: {
      ...(rating && { rating: parseInt(rating) }),
      ...(comment && { comment }),
    },
    include: { user: { select: { id: true, name: true, avatar: true } } },
  });

  res.json({ message: 'Review updated.', review: updated });
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res) => {
  const { id } = req.params;

  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) return res.status(404).json({ error: 'Review not found.' });

  if (review.userId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Not authorized.' });
  }

  if (review.userId === req.user.id && new Date() > review.editableUntil) {
    return res.status(403).json({ error: 'Review delete window has expired (48 hours).' });
  }

  await prisma.review.delete({ where: { id } });

  res.json({ message: 'Review deleted.' });
};

// @desc    Get my reviews
// @route   GET /api/reviews/my
// @access  Private
export const getMyReviews = async (req, res) => {
  const reviews = await prisma.review.findMany({
    where: { userId: req.user.id },
    include: { event: { select: { id: true, title: true, date: true, imageUrl: true } } },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ reviews });
};

// @desc    Get event reviews
// @route   GET /api/reviews/event/:eventId
// @access  Public
export const getEventReviews = async (req, res) => {
  const { eventId } = req.params;

  const reviews = await prisma.review.findMany({
    where: { eventId },
    include: { user: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const averageRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null;

  res.json({ reviews, averageRating });
};
