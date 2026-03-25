import prisma from '../utils/prisma.js';

// @desc    Join event (free public → instantly approved)
// @route   POST /api/participants/join/:eventId
// @access  Private
export const joinEvent = async (req, res) => {
  const { eventId } = req.params;

  const event = await prisma.event.findUnique({ where: { id: eventId, isDeleted: false } });
  if (!event) return res.status(404).json({ error: 'Event not found.' });

  if (event.organizerId === req.user.id) {
    return res.status(400).json({ error: 'You cannot join your own event.' });
  }

  if (event.date < new Date()) {
    return res.status(400).json({ error: 'This event has already passed.' });
  }

  const existing = await prisma.participant.findUnique({
    where: { userId_eventId: { userId: req.user.id, eventId } },
  });

  if (existing) {
    if (existing.status === 'BANNED') {
      return res.status(403).json({ error: 'You have been banned from this event.' });
    }
    return res.status(409).json({ error: 'You have already joined or requested to join this event.' });
  }

  // Check capacity
  if (event.capacity) {
    const approvedCount = await prisma.participant.count({
      where: { eventId, status: 'APPROVED' },
    });
    if (approvedCount >= event.capacity) {
      return res.status(400).json({ error: 'Event is at full capacity.' });
    }
  }

  // Paid events must go through payment first
  if (event.fee > 0) {
    return res.status(402).json({ 
      error: 'Payment required to join this event.',
      requiresPayment: true,
      fee: event.fee,
    });
  }

  // Free public → auto-approve
  // Free private → pending approval
  const status = event.type === 'PUBLIC' ? 'APPROVED' : 'PENDING';

  const participant = await prisma.participant.create({
    data: { userId: req.user.id, eventId, status },
    include: { user: { select: { id: true, name: true, avatar: true } } },
  });

  res.status(201).json({
    message: status === 'APPROVED' ? 'Successfully joined the event!' : 'Join request submitted. Awaiting approval.',
    participant,
  });
};

// @desc    Approve participant
// @route   PATCH /api/participants/:participantId/approve
// @access  Private (Event Owner or Admin)
export const approveParticipant = async (req, res) => {
  const { participantId } = req.params;

  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
    include: { event: true },
  });

  if (!participant) return res.status(404).json({ error: 'Participant not found.' });

  if (participant.event.organizerId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Not authorized.' });
  }

  const updated = await prisma.participant.update({
    where: { id: participantId },
    data: { status: 'APPROVED' },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  res.json({ message: 'Participant approved.', participant: updated });
};

// @desc    Reject participant
// @route   PATCH /api/participants/:participantId/reject
// @access  Private (Event Owner or Admin)
export const rejectParticipant = async (req, res) => {
  const { participantId } = req.params;

  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
    include: { event: true },
  });

  if (!participant) return res.status(404).json({ error: 'Participant not found.' });

  if (participant.event.organizerId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Not authorized.' });
  }

  const updated = await prisma.participant.update({
    where: { id: participantId },
    data: { status: 'REJECTED' },
  });

  res.json({ message: 'Participant rejected.', participant: updated });
};

// @desc    Ban participant
// @route   PATCH /api/participants/:participantId/ban
// @access  Private (Event Owner or Admin)
export const banParticipant = async (req, res) => {
  const { participantId } = req.params;

  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
    include: { event: true },
  });

  if (!participant) return res.status(404).json({ error: 'Participant not found.' });

  if (participant.event.organizerId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Not authorized.' });
  }

  const updated = await prisma.participant.update({
    where: { id: participantId },
    data: { status: 'BANNED' },
  });

  res.json({ message: 'Participant banned from this event.', participant: updated });
};

// @desc    Leave event
// @route   DELETE /api/participants/leave/:eventId
// @access  Private
export const leaveEvent = async (req, res) => {
  const { eventId } = req.params;

  const participant = await prisma.participant.findUnique({
    where: { userId_eventId: { userId: req.user.id, eventId } },
  });

  if (!participant) return res.status(404).json({ error: 'You are not a participant of this event.' });

  await prisma.participant.delete({
    where: { userId_eventId: { userId: req.user.id, eventId } },
  });

  res.json({ message: 'Left the event successfully.' });
};
