
import prisma from '../utils/prisma.js';

export const submitContact = async (req, res) => {
  const { name, email, message, photo } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  const contact = await prisma.contact.create({
    data: {
      ...(name && { name: name.trim() }),
      ...(email && { email: email.trim().toLowerCase() }),
      message: message.trim(),
      ...(photo !== undefined && { photo }),
    },
  });

  res.status(201).json({ message: 'Message sent successfully.', contact });
};

export const getContacts = async (req, res) => {
  const contacts = await prisma.contact.findMany({
    orderBy: { createdAt: 'desc' },
  });

  res.json({ contacts });
};

export const deleteContact = async (req, res) => {
  const { id } = req.params;

  const contact = await prisma.contact.findUnique({ where: { id } });

  if (!contact) {
    return res.status(404).json({ error: 'Contact message not found.' });
  }

  await prisma.contact.delete({ where: { id } });

  res.json({ message: 'Contact message deleted successfully.' });
};
