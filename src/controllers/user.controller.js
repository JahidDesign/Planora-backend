import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma.js';

// @desc    Update profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  const { name, bio, avatar, notificationsEnabled } = req.body;

  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...(name && { name }),
      ...(bio !== undefined && { bio }),
      ...(avatar !== undefined && { avatar }),
      ...(notificationsEnabled !== undefined && { notificationsEnabled }),
    },
    select: { id: true, name: true, email: true, role: true, avatar: true, bio: true, notificationsEnabled: true },
  });

  res.json({ message: 'Profile updated successfully.', user: updated });
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters.' });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    return res.status(401).json({ error: 'Current password is incorrect.' });
  }

  const hashed = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: req.user.id },
    data: { password: hashed },
  });

  res.json({ message: 'Password changed successfully.' });
};

// @desc    Get user's participated events
// @route   GET /api/users/participated-events
// @access  Private
export const getParticipatedEvents = async (req, res) => {
  const participants = await prisma.participant.findMany({
    where: { userId: req.user.id },
    include: {
      event: {
        include: {
          organizer: { select: { name: true } },
          _count: { select: { participants: true } },
        },
      },
    },
    orderBy: { joinedAt: 'desc' },
  });

  res.json({ participants });
};
