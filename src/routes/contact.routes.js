import express from 'express';
import { body } from 'express-validator';
import { submitContact, getContacts, deleteContact } from '../controllers/contact.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';

const router = express.Router();

router.post('/', [
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ min: 5 }).withMessage('Message must be at least 5 characters')
    .isLength({ max: 2000 }).withMessage('Message must be under 2000 characters'),
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Name must be under 100 characters'),
  body('email')
    .optional()
    .isEmail().withMessage('Enter a valid email address')
    .normalizeEmail(),
  body('photo')
    .optional()
    .isString(),
], validate, submitContact);

// Admin only
router.get('/', protect, authorize('ADMIN'), getContacts);
router.delete('/:id', protect, authorize('ADMIN'), deleteContact);

export default router;