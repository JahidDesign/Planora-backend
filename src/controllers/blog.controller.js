import { validationResult } from 'express-validator';
import slugify from 'slugify';
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

const generateSlug = async (title, excludeId = null) => {
  let slug = slugify(title, { lower: true, strict: true });
  let unique = slug;
  let count = 1;
  while (true) {
    const existing = await prisma.blog.findFirst({
      where: {
        slug: unique,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
    if (!existing) break;
    unique = `${slug}-${count++}`;
  }
  return unique;
};

const BLOG_AUTHOR_SELECT = {
  id: true,
  name: true,
  avatar: true,
  bio: true,
};

/* ======================================================
   Get All Blogs (public)
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
        { author: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: BLOG_AUTHOR_SELECT },
          _count: { select: { likes: true, comments: true } },
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
   Get Single Blog by SLUG (public)
====================================================== */

export const getBlog = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const blog = await prisma.blog.findFirst({
      where: { slug, isDeleted: false },
      include: {
        author: { select: BLOG_AUTHOR_SELECT },
        comments: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
        },
        _count: { select: { likes: true } },
      },
    });

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    // increment view count (fire and forget)
    prisma.blog.update({
      where: { id: blog.id },
      data: { views: { increment: 1 } },
    }).catch(() => { });

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

    const {
      title,
      excerpt,
      content,
      category,
      imageUrl,   // frontend sends imageUrl
      tags,
      isFeatured,
      isPublished,
    } = req.body;

    const slug = await generateSlug(title);

    const blog = await prisma.blog.create({
      data: {
        title,
        slug,
        excerpt: excerpt || null,
        content,
        category: category || null,
        imageUrl: imageUrl || null,
        tags: tags || [],
        isFeatured: req.user.role === 'ADMIN' ? (isFeatured ?? false) : false,
        isPublished: isPublished ?? true,
        authorId: req.user.id,
      },
      include: {
        author: { select: BLOG_AUTHOR_SELECT },
      },
    });

    res.status(201).json({ message: 'Blog created', blog });
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

    const {
      title,
      excerpt,
      content,
      category,
      imageUrl,
      tags,
      isFeatured,
      isPublished,
    } = req.body;

    // regenerate slug if title changed
    const slug = title && title !== blog.title
      ? await generateSlug(title, id)
      : blog.slug;

    const updated = await prisma.blog.update({
      where: { id },
      data: {
        ...(title && { title }),
        slug,
        ...(excerpt !== undefined && { excerpt }),
        ...(content && { content }),
        ...(category !== undefined && { category }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(tags !== undefined && { tags }),
        ...(req.user.role === 'ADMIN' && isFeatured !== undefined && { isFeatured }),
        ...(isPublished !== undefined && { isPublished }),
      },
      include: {
        author: { select: BLOG_AUTHOR_SELECT },
      },
    });

    res.json({ message: 'Blog updated', blog: updated });
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
   Get My Blogs (authenticated user's own blogs)
   with search, category, featured, pagination
====================================================== */

export const getMyBlogs = async (req, res, next) => {
  try {
    const { search, category, featured, page, limit } = req.query;
    const { pageNum, limitNum, skip } = getPagination(page, limit);

    const where = {
      authorId: req.user.id,
      isDeleted: false,
    };

    if (category) where.category = category;
    if (featured === 'true') where.isFeatured = true;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: BLOG_AUTHOR_SELECT },
          _count: { select: { likes: true, comments: true } },
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