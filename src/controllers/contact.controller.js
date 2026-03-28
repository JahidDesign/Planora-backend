import prisma from '../utils/prisma.js';

// ================= SUBMIT CONTACT =================
export const submitContact = async (req, res) => {
  try {
    const { name, email, message, photo } = req.body;

    const contact = await prisma.contact.create({
      data: {
        name: name || null,
        email: email || null,
        message: message.trim(),
        photo: photo || null,
      },
    });

    return res.status(201).json({
      message: 'Message sent successfully',
      contact: { id: contact.id },
    });

  } catch (err) {
    console.error('[submitContact]', err);
    return res.status(500).json({
      error: 'An unexpected error occurred. Please try again.',
    });
  }
};

// ================= GET ALL CONTACTS (Admin) =================
export const getContacts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.contact.count(),
    ]);

    return res.json({
      contacts,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });

  } catch (err) {
    console.error('[getContacts]', err);
    return res.status(500).json({
      error: 'An unexpected error occurred. Please try again.',
    });
  }
};

// ================= DELETE CONTACT (Admin) =================
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await prisma.contact.findUnique({ where: { id } });
    if (!contact) {
      return res.status(404).json({ error: 'Contact message not found' });
    }

    await prisma.contact.delete({ where: { id } });

    return res.json({ message: 'Contact message deleted' });

  } catch (err) {
    console.error('[deleteContact]', err);
    return res.status(500).json({
      error: 'An unexpected error occurred. Please try again.',
    });
  }
};