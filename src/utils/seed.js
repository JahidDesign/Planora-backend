import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log(' Seeding database...');

  // Create admin
  const adminPassword = await bcrypt.hash('jahid@1234', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'jahid@planora.dev' },
    update: {},
    create: {
      name: 'Planora Admin',
      email: 'jahid@planora.dev',
      password: adminPassword,
      role: 'ADMIN',
      bio: 'Platform administrator',
    },
  });

  // Create sample users
  const userPassword = await bcrypt.hash('User@1234', 12);
  const user1 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: { name: 'Alice Johnson', email: 'alice@example.com', password: userPassword },
  });
  const user2 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: { name: 'Bob Smith', email: 'bob@example.com', password: userPassword },
  });

  // Create sample events
  const events = [
    {
      title: 'Next.js Summit 2025',
      description: 'A premier conference for Next.js developers exploring the latest in React Server Components, App Router, and edge computing. Join industry leaders and innovative engineers for two days of deep technical sessions, live coding demos, and networking.',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      venue: 'San Francisco Convention Center, CA',
      type: 'PUBLIC',
      fee: 0,
      category: 'Technology',
      isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    },
    {
      title: 'AI & Machine Learning Workshop',
      description: 'Hands-on workshop covering the fundamentals of AI/ML with practical Python exercises. Learn to build and deploy your first ML model.',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      venue: 'Tech Hub, Austin TX',
      type: 'PUBLIC',
      fee: 49.99,
      category: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800',
    },
    {
      title: 'Startup Founders Mastermind',
      description: 'Exclusive private gathering of early-stage founders sharing growth strategies, fundraising stories, and lessons learned.',
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      venue: 'WeWork HQ, New York',
      type: 'PRIVATE',
      fee: 0,
      category: 'Business',
      imageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800',
    },
    {
      title: 'Design Systems Conference',
      description: 'Learn how leading companies build and maintain scalable design systems. Featuring speakers from Airbnb, Figma, and Shopify.',
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      venue: 'Design Center, Chicago',
      type: 'PUBLIC',
      fee: 79,
      category: 'Design',
      imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
    },
    {
      title: 'Web3 Builders Retreat',
      description: 'A weekend retreat for blockchain developers and Web3 enthusiasts. Build, learn, and connect with the decentralized community.',
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      venue: 'Miami Beach, FL',
      type: 'PRIVATE',
      fee: 199,
      category: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800',
    },
    {
      title: 'Open Source Hackathon',
      description: '48-hour hackathon building tools for the open source community. Cash prizes and job opportunities await top teams.',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      venue: 'Google Campus, Mountain View',
      type: 'PUBLIC',
      fee: 0,
      category: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
    },
    {
      title: 'Product Management Bootcamp',
      description: 'Intensive 3-day bootcamp for aspiring and experienced PMs. Cover strategy, roadmapping, and stakeholder management.',
      date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
      venue: 'Seattle Convention Center',
      type: 'PUBLIC',
      fee: 149,
      category: 'Business',
      imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
    },
    {
      title: 'DevOps & Cloud Native Summit',
      description: 'Deep dives into Kubernetes, Terraform, CI/CD pipelines, and the future of cloud infrastructure.',
      date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      venue: 'AWS HQ, Seattle',
      type: 'PUBLIC',
      fee: 0,
      category: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
    },
    {
      title: 'Cybersecurity Symposium',
      description: 'Leading experts in cybersecurity share the latest threats, tools, and defense strategies.',
      date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
      venue: 'Pentagon City, Arlington VA',
      type: 'PUBLIC',
      fee: 99,
      category: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800',
    },
  ];

  for (const eventData of events) {
    await prisma.event.upsert({
      where: { id: eventData.title.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: { ...eventData, organizerId: user1.id },
    }).catch(() => {
      return prisma.event.create({ data: { ...eventData, organizerId: user1.id } });
    });
  }

  console.log('✅ Seed complete!');
  console.log('👤 Admin: admin@planora.dev / Admin@1234');
  console.log('👤 User:  alice@example.com / User@1234');
  console.log('👤 User:  bob@example.com / User@1234');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
