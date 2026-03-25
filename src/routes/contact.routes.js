import { Router } from 'express';
import { submitContact, getContacts, deleteContact } from '../controllers/contact.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', submitContact);
router.get('/', authenticate, authorize('ADMIN'), getContacts);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteContact);

export default router;