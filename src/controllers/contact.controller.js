import prisma from '../utils/prisma.js';
import cloudinary from '../utils/cloudinary.js';
import streamifier from 'streamifier';

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'contacts',
        resource_type: 'image',
      },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export const submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    let photoUrl = null;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      photoUrl = result.secure_url;
    }

    const contact = await prisma.contact.create({
      data: {
        ...(name && { name: name.trim() }),
        ...(email && { email: email.trim().toLowerCase() }),
        message: message.trim(),
        ...(photoUrl && { photo: photoUrl }),
      },
    });

    res.status(201).json({
      message: 'Message sent successfully.',
      contact,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getContacts = async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json({ contacts });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await prisma.contact.findUnique({
      where: { id },
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact message not found.' });
    }

    if (contact.photo) {
      const publicId = contact.photo
        .split('/')
        .slice(-2)
        .join('/')
        .split('.')[0];

      await cloudinary.uploader.destroy(publicId);
    }

    await prisma.contact.delete({ where: { id } });

    res.json({ message: 'Contact message deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};