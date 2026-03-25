import prisma from '../utils/prisma.js';

// @desc    Send invitation
// @route   POST /api/invitations
// @access  Private (Event Owner)
export const sendInvitation = async (req, res) => {
  const { eventId, receiverEmail } = req.body;

  const event = await prisma.event.findUnique({ where: { id: eventId, isDeleted: false } });
  if (!event) return res.status(404).json({ error: 'Event not found.' });

  if (event.organizerId !== req.user.id) {
    return res.status(403).json({ error: 'Only the event organizer can send invitations.' });
  }

  const receiver = await prisma.user.findUnique({ where: { email: receiverEmail } });
  if (!receiver) return res.status(404).json({ error: 'User not found with that email.' });

  if (receiver.id === req.user.id) {
    return res.status(400).json({ error: 'Cannot invite yourself.' });
  }

  const existingInvitation = await prisma.invitation.findUnique({
    where: { receiverId_eventId: { receiverId: receiver.id, eventId } },
  });
  if (existingInvitation) {
    return res.status(409).json({ error: 'Invitation already sent to this user.' });
  }

  const invitation = await prisma.invitation.create({
    data: { senderId: req.user.id, receiverId: receiver.id, eventId },
    include: {
      receiver: { select: { name: true, email: true } },
      event: { select: { title: true } },
    },
  });

  res.status(201).json({ message: 'Invitation sent successfully.', invitation });
};

// @desc    Get my pending invitations
// @route   GET /api/invitations/my
// @access  Private
export const getMyInvitations = async (req, res) => {
  const invitations = await prisma.invitation.findMany({
    where: { receiverId: req.user.id, status: 'PENDING' },
    include: {
      sender: { select: { id: true, name: true, avatar: true } },
      event: {
        select: { id: true, title: true, date: true, fee: true, type: true, imageUrl: true, venue: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ invitations });
};

// @desc    Accept invitation
// @route   PATCH /api/invitations/:id/accept
// @access  Private
export const acceptInvitation = async (req, res) => {
  const { id } = req.params;

  const invitation = await prisma.invitation.findUnique({
    where: { id },
    include: { event: true },
  });

  if (!invitation) return res.status(404).json({ error: 'Invitation not found.' });
  if (invitation.receiverId !== req.user.id) return res.status(403).json({ error: 'Not authorized.' });
  if (invitation.status !== 'PENDING') {
    return res.status(400).json({ error: 'Invitation has already been responded to.' });
  }

  // Paid event: must pay first
  if (invitation.event.fee > 0) {
    return res.status(402).json({
      error: 'Payment required to accept this invitation.',
      requiresPayment: true,
      fee: invitation.event.fee,
      eventId: invitation.event.id,
    });
  }

  await prisma.$transaction([
    prisma.invitation.update({ where: { id }, data: { status: 'ACCEPTED' } }),
    prisma.participant.upsert({
      where: { userId_eventId: { userId: req.user.id, eventId: invitation.eventId } },
      update: { status: 'PENDING' },
      create: { userId: req.user.id, eventId: invitation.eventId, status: 'PENDING' },
    }),
  ]);

  res.json({ message: 'Invitation accepted. Awaiting host approval.' });
};

// @desc    Decline invitation
// @route   PATCH /api/invitations/:id/decline
// @access  Private
export const declineInvitation = async (req, res) => {
  const { id } = req.params;

  const invitation = await prisma.invitation.findUnique({ where: { id } });
  if (!invitation) return res.status(404).json({ error: 'Invitation not found.' });
  if (invitation.receiverId !== req.user.id) return res.status(403).json({ error: 'Not authorized.' });

  await prisma.invitation.update({ where: { id }, data: { status: 'DECLINED' } });

  res.json({ message: 'Invitation declined.' });
};
