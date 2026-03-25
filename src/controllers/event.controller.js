import { validationResult } from 'express-validator';
import prisma from '../utils/prisma.js';

// @desc    Get all public events (with filters & search)
// @route   GET /api/events
// @access  Public
export const getEvents = async (req, res) => {
  const {
    search,
    type,
    fee, // 'free' | 'paid'
    category,
    page = 1,
    limit = 12,
    upcoming = false,
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    isDeleted: false,
    ...(upcoming === 'true' && { date: { gte: new Date() } }),
  };

  // Type filter
  if (type === 'PUBLIC') where.type = 'PUBLIC';
  else if (type === 'PRIVATE') where.type = 'PRIVATE';

  // Fee filter
  if (fee === 'free') where.fee = 0;
  else if (fee === 'paid') where.fee = { gt: 0 };

  // Category filter
  if (category) where.category = category;

  // Search
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { organizer: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  // Non-admins can only see public events unless authenticated
  if (!req.user || req.user.role !== 'ADMIN') {
    if (!req.user) {
      where.type = 'PUBLIC';
    }
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { date: 'asc' },
      include: {
        organizer: { select: { id: true, name: true, avatar: true } },
        _count: { select: { participants: true, reviews: true } },
        reviews: { select: { rating: true } },
      },
    }),
    prisma.event.count({ where }),
  ]);

  const eventsWithRating = events.map((event) => ({
    ...event,
    averageRating: event.reviews.length
      ? event.reviews.reduce((sum, r) => sum + r.rating, 0) / event.reviews.length
      : null,
  }));

  res.json({
    events: eventsWithRating,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
};

// @desc    Get featured event
// @route   GET /api/events/featured
// @access  Public
export const getFeaturedEvent = async (req, res) => {
  const event = await prisma.event.findFirst({
    where: { isFeatured: true, isDeleted: false, date: { gte: new Date() } },
    include: {
      organizer: { select: { id: true, name: true, avatar: true } },
      _count: { select: { participants: true } },
    },
  });

  res.json({ event });
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public/Private
export const getEvent = async (req, res) => {
  const { id } = req.params;

  const event = await prisma.event.findUnique({
    where: { id, isDeleted: false },
    include: {
      organizer: { select: { id: true, name: true, avatar: true, email: true } },
      participants: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
        where: { status: 'APPROVED' },
      },
      reviews: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
      },
      _count: { select: { participants: true } },
    },
  });

  if (!event) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  // Check access for private events
  if (event.type === 'PRIVATE' && (!req.user || req.user.role !== 'ADMIN')) {
    if (!req.user) {
      return res.status(403).json({ error: 'This is a private event. Please login to view.' });
    }
    // Check if user is organizer or approved participant
    const isOrganizer = event.organizerId === req.user.id;
    const isParticipant = event.participants.some((p) => p.userId === req.user.id);
    if (!isOrganizer && !isParticipant) {
      return res.status(403).json({ error: 'Access denied. This is a private event.' });
    }
  }

  const averageRating = event.reviews.length
    ? event.reviews.reduce((sum, r) => sum + r.rating, 0) / event.reviews.length
    : null;

  // Get user's participation status if logged in
  let userParticipation = null;
  if (req.user) {
    userParticipation = await prisma.participant.findUnique({
      where: { userId_eventId: { userId: req.user.id, eventId: id } },
    });
  }

  res.json({ event: { ...event, averageRating }, userParticipation });
};

// @desc    Create event
// @route   POST /api/events
// @access  Private
export const createEvent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, date, endDate, venue, eventLink, type, fee, capacity, imageUrl, category } = req.body;

  const event = await prisma.event.create({
    data: {
      title,
      description,
      date: new Date(date),
      endDate: endDate ? new Date(endDate) : null,
      venue,
      eventLink,
      type: type || 'PUBLIC',
      fee: parseFloat(fee) || 0,
      capacity: capacity ? parseInt(capacity) : null,
      imageUrl,
      category,
      organizerId: req.user.id,
    },
    include: {
      organizer: { select: { id: true, name: true, avatar: true } },
    },
  });

  res.status(201).json({ message: 'Event created successfully.', event });
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Owner or Admin)
export const updateEvent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;

  const event = await prisma.event.findUnique({ where: { id, isDeleted: false } });
  if (!event) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  if (event.organizerId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Not authorized to update this event.' });
  }

  const { title, description, date, endDate, venue, eventLink, type, fee, capacity, imageUrl, category, isFeatured } = req.body;

  const updatedEvent = await prisma.event.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(description && { description }),
      ...(date && { date: new Date(date) }),
      ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      ...(venue !== undefined && { venue }),
      ...(eventLink !== undefined && { eventLink }),
      ...(type && { type }),
      ...(fee !== undefined && { fee: parseFloat(fee) }),
      ...(capacity !== undefined && { capacity: capacity ? parseInt(capacity) : null }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(category !== undefined && { category }),
      ...(isFeatured !== undefined && req.user.role === 'ADMIN' && { isFeatured }),
    },
    include: {
      organizer: { select: { id: true, name: true, avatar: true } },
    },
  });

  res.json({ message: 'Event updated successfully.', event: updatedEvent });
};

// @desc    Delete event (soft delete)
// @route   DELETE /api/events/:id
// @access  Private (Owner or Admin)
export const deleteEvent = async (req, res) => {
  const { id } = req.params;

  const event = await prisma.event.findUnique({ where: { id, isDeleted: false } });
  if (!event) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  if (event.organizerId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Not authorized to delete this event.' });
  }

  await prisma.event.update({ where: { id }, data: { isDeleted: true } });

  res.json({ message: 'Event deleted successfully.' });
};

// @desc    Get my events (organizer)
// @route   GET /api/events/my-events
// @access  Private
export const getMyEvents = async (req, res) => {
  const events = await prisma.event.findMany({
    where: { organizerId: req.user.id, isDeleted: false },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { participants: true, reviews: true } },
      participants: {
        where: { status: 'PENDING' },
        select: { id: true, status: true, user: { select: { name: true } } },
      },
    },
  });

  res.json({ events });
};

// @desc    Get event participants (owner/admin)
// @route   GET /api/events/:id/participants
// @access  Private
export const getEventParticipants = async (req, res) => {
  const { id } = req.params;

  const event = await prisma.event.findUnique({ where: { id, isDeleted: false } });
  if (!event) return res.status(404).json({ error: 'Event not found.' });

  if (event.organizerId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Not authorized.' });
  }

  const participants = await prisma.participant.findMany({
    where: { eventId: id },
    include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
    orderBy: { joinedAt: 'desc' },
  });

  res.json({ participants });
};
