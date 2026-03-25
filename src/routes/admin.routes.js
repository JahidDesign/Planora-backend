import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import {
  getStats, getAllUsers, deleteUser, updateUserRole,
  getAllEvents, setFeaturedEvent
} from '../controllers/admin.controller.js';

const router = express.Router();
router.use(authenticate, authorize('ADMIN'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/role', updateUserRole);
router.get('/events', getAllEvents);
router.patch('/events/:id/feature', setFeaturedEvent);
router.delete('/events/:id', async (req, res) => {
  const { prisma } = await import('../utils/prisma.js');
  await prisma.event.update({ where: { id: req.params.id }, data: { isDeleted: true } });
  res.json({ message: 'Event deleted by admin.' });
});

export default router;
