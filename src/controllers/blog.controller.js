import { validationResult } from 'express-validator';
import prisma from '../utils/prisma.js';

/* ======================================================
   Helpers
====================================================== */

const getPagination = (page, limit) => {
  const pageNum = Math.max(parseInt(page) || 1, 1);
  const limitNum = Math.min(parseInt(limit) || 10, 50);

  return {
    pageNum,
    limitNum,
    skip: (pageNum - 1) * limitNum,
  };
};

/* ======================================================
   Get Blogs
====================================================== */

export const getBlogs = async (req, res, next) => {
  try {
    const { search, category, featured, page, limit } = req.query;

    const { pageNum, limitNum, skip } = getPagination(page, limit);

    const where = {
      isDeleted: false,
      isPublished: true,
    };

    if (category) where.category = category;

    if (featured === 'true') where.isFeatured = true;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        {
          author: {
            name: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
          _count: {
            select: { likes: true, comments: true },
          },
        },
      }),
      prisma.blog.count({ where }),
    ]);

    res.json({
      blogs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   Single Blog
====================================================== */

export const getBlog = async (req, res, next) => {
  try {
    const { id } = req.params;

    const blog = await prisma.blog.findFirst({
      where: { id, isDeleted: false },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
        comments: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
        _count: {
          select: { likes: true },
        },
      },
    });

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    // increase view count
    await prisma.blog.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    res.json({ blog });
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   Create Blog
====================================================== */

export const createBlog = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, category, coverImage, isPublished } = req.body;

    const blog = await prisma.blog.create({
      data: {
        title,
        content,
        category,
        coverImage,
        isPublished: isPublished ?? true,
        authorId: req.user.id,
      },
    });

    res.status(201).json({
      message: 'Blog created',
      blog,
    });
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   Update Blog
====================================================== */

export const updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params;

    const blog = await prisma.blog.findFirst({
      where: { id, isDeleted: false },
    });

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    if (blog.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await prisma.blog.update({
      where: { id },
      data: req.body,
    });

    res.json({
      message: 'Blog updated',
      blog: updated,
    });
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   Delete Blog (Soft)
====================================================== */

export const deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params;

    const blog = await prisma.blog.findFirst({
      where: { id, isDeleted: false },
    });

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    if (blog.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.blog.update({
      where: { id },
      data: { isDeleted: true },
    });

    res.json({ message: 'Blog deleted' });
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   My Blogs
====================================================== */

export const getMyBlogs = async (req, res, next) => {
  try {
    const blogs = await prisma.blog.findMany({
      where: {
        authorId: req.user.id,
        isDeleted: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ blogs });
  } catch (err) {
    next(err);
  }
};