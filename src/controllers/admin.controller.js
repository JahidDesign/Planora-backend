import prisma from '../utils/prisma.js';


export const getStats = async (req, res) => {
  const [totalUsers, totalEvents, totalParticipants, totalPayments] = await Promise.all([
    prisma.user.count(),
    prisma.event.count({ where: { isDeleted: false } }),
    prisma.participant.count({ where: { status: 'APPROVED' } }),
    prisma.payment.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true } }),
  ]);

  const recentEvents = await prisma.event.findMany({
    take: 5,
    where: { isDeleted: false },
    orderBy: { createdAt: 'desc' },
    include: { organizer: { select: { name: true } }, _count: { select: { participants: true } } },
  });

  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  res.json({
    stats: {
      totalUsers,
      totalEvents,
      totalParticipants,
      totalRevenue: totalPayments._sum.amount || 0,
    },
    recentEvents,
    recentUsers,
  });
};

export const getAllUsers = async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, role: true, avatar: true, createdAt: true,
        _count: { select: { eventsCreated: true, participations: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({ users, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
};


export const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (id === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete your own account.' });
  }

  await prisma.user.delete({ where: { id } });

  res.json({ message: 'User account deleted.' });
};

// @desc    Update user role
// @route   PATCH /api/admin/users/:id/role
// @access  Admin
export const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['USER', 'ADMIN'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role.' });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });

  res.json({ message: 'User role updated.', user: updated });
};

// @desc    Get all events (admin view)
// @route   GET /api/admin/events
// @access  Admin
export const getAllEvents = async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        organizer: { select: { id: true, name: true, email: true } },
        _count: { select: { participants: true } },
      },
    }),
    prisma.event.count({ where }),
  ]);

  res.json({ events, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
};

// @desc    Set featured event
// @route   PATCH /api/admin/events/:id/feature
// @access  Admin
export const setFeaturedEvent = async (req, res) => {
  const { id } = req.params;

  // Unfeature all
  await prisma.event.updateMany({ data: { isFeatured: false } });

  // Feature the selected
  const event = await prisma.event.update({
    where: { id },
    data: { isFeatured: true },
    select: { id: true, title: true, isFeatured: true },
  });

  res.json({ message: 'Featured event updated.', event });
};
