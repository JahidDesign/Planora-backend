import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma.js';
import {
  generateTokenPair,
  verifyRefreshToken,
  generateAccessToken,
} from '../utils/jwt.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// ================= REGISTER =================
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email: normalizedEmail, password: hashedPassword },
    });

    const { accessToken, refreshToken } = generateTokenPair(user);

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

    const { password: _, ...safeUser } = user;

    return res.status(201).json({
      message: 'Registered successfully',
      user: safeUser,
      accessToken,
    });

  } catch (err) {
    console.error('[register]', err);
    return res.status(500).json({
      error: 'An unexpected error occurred. Please try again.',
    });
  }
};

// ================= LOGIN =================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase();

    // No select — need password field for bcrypt.compare
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { accessToken, refreshToken } = generateTokenPair(user);

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

    const { password: _, ...safeUser } = user;

    return res.json({
      message: 'Login successful',
      user: safeUser,
      accessToken,
    });

  } catch (err) {
    console.error('[login]', err);
    return res.status(500).json({
      error: 'An unexpected error occurred. Please try again.',
    });
  }
};

// ================= REFRESH =================
export const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ error: 'No refresh token provided' });
  }

  try {
    const decoded = verifyRefreshToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const accessToken = generateAccessToken(user);

    return res.json({ accessToken });

  } catch (err) {
    console.error('[refreshToken]', err);
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
};

// ================= LOGOUT =================
export const logout = async (req, res) => {
  try {
    res.clearCookie('refreshToken', COOKIE_OPTIONS);
    return res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('[logout]', err);
    return res.status(500).json({
      error: 'An unexpected error occurred. Please try again.',
    });
  }
};

// ================= GET ME =================
export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        bio: true,
        notificationsEnabled: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user });

  } catch (err) {
    console.error('[getMe]', err);
    return res.status(500).json({
      error: 'An unexpected error occurred. Please try again.',
    });
  }
};