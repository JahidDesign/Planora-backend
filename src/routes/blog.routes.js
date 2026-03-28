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

import { protect, optionalAuth } from '../middlewares/auth.middleware.js';

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
   NOTE: router is mounted at /api/my-blogs in app.ts
   So:
     GET  /api/my-blogs         → getBlogs  (all public blogs)
     GET  /api/my-blogs/mine    → getMyBlogs (logged-in user's blogs)
     GET  /api/my-blogs/:slug   → getBlog   (single blog by slug)
     POST /api/my-blogs         → createBlog
     PUT  /api/my-blogs/:id     → updateBlog
     DEL  /api/my-blogs/:id     → deleteBlog
====================================================== */

// ✅ Static routes MUST come before /:slug param route
router.get('/', optionalAuth, getBlogs);
router.get('/mine', protect, getMyBlogs);

// ✅ Dynamic slug route comes last
router.get('/:slug', optionalAuth, getBlog);

router.post('/', protect, blogValidation, createBlog);
router.put('/:id', protect, updateBlog);
router.delete('/:id', protect, deleteBlog);

export default router;