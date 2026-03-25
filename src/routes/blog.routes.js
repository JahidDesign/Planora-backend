import express from 'express';
import { body } from 'express-validator';

import {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  getMyBlogs,
} from '../controllers/blog.controller.js';

import { authenticate, optionalAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

/* ======================================================
   Blog Validation
====================================================== */

const blogValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 150 })
    .withMessage('Title must be under 150 characters'),

  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required'),

  body('category')
    .optional()
    .isString()
    .withMessage('Category must be string'),

  body('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be boolean'),
];

/* ======================================================
   Routes
====================================================== */

router.get('/', optionalAuth, getBlogs);

router.get('/my-blogs', authenticate, getMyBlogs);

router.get('/:id', optionalAuth, getBlog);

router.post('/', authenticate, blogValidation, createBlog);

router.put('/:id', authenticate, blogValidation, updateBlog);

router.delete('/:id', authenticate, deleteBlog);

export default router;