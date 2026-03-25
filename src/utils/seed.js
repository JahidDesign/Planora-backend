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

  const blogs = [
    {
      title: 'Getting Started with Next.js App Router',
      slug: 'getting-started-nextjs-app-router',
      content: 'Learn how the new App Router improves routing and layouts.',
      category: 'Technology',
      coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
      isFeatured: true,
    },
    {
      title: 'Understanding Prisma ORM Deeply',
      slug: 'understanding-prisma-orm-deeply',
      content: 'Prisma simplifies database workflows and migrations.',
      category: 'Technology',
      coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
    },
    {
      title: 'Startup Growth Strategies in 2025',
      slug: 'startup-growth-strategies-2025',
      content: 'Modern startup scaling tactics and growth loops.',
      category: 'Business',
      coverImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800',
    },
    {
      title: 'Designing Premium UI with TailwindCSS',
      slug: 'designing-premium-ui-tailwindcss',
      content: 'Build beautiful interfaces using Tailwind utility system.',
      category: 'Design',
      coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
    },
    {
      title: 'Why Server Actions Are Game Changing',
      slug: 'why-server-actions-are-game-changing',
      content: 'Server Actions simplify fullstack React apps.',
      category: 'Technology',
      coverImage: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=800',
    },
    {
      title: 'Building Scalable SaaS Architecture',
      slug: 'building-scalable-saas-architecture',
      content: 'Learn patterns to scale SaaS backend systems.',
      category: 'Business',
      coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    },
    {
      title: 'Modern Authentication Best Practices',
      slug: 'modern-authentication-best-practices',
      content: 'JWT, OAuth and session strategies explained.',
      category: 'Technology',
      coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
    },
    {
      title: 'Improving UX With Microinteractions',
      slug: 'improving-ux-with-microinteractions',
      content: 'Subtle UI animations can drastically improve engagement.',
      category: 'Design',
      coverImage: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=800',
    },
    {
      title: 'Database Indexing Explained Simply',
      slug: 'database-indexing-explained-simply',
      content: 'Speed up queries with proper indexing strategies.',
      category: 'Technology',
      coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800',
    },
    {
      title: 'Remote Team Productivity Guide',
      slug: 'remote-team-productivity-guide',
      content: 'How distributed teams collaborate effectively.',
      category: 'Business',
      coverImage: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800',
    },
    {
      title: 'Mastering React Performance Optimization',
      slug: 'mastering-react-performance-optimization',
      content: 'Memoization, suspense and rendering strategies.',
      category: 'Technology',
      coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    },
    {
      title: 'Design Tokens for Design Systems',
      slug: 'design-tokens-for-design-systems',
      content: 'Create scalable visual language using tokens.',
      category: 'Design',
      coverImage: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800',
    },
    {
      title: 'AI Tools Every Developer Should Try',
      slug: 'ai-tools-every-developer-should-try',
      content: 'Boost coding productivity using AI assistants.',
      category: 'Technology',
      coverImage: 'https://images.unsplash.com/photo-1677442135136-760c813dce6c?w=800',
    },
    {
      title: 'Product Market Fit Checklist',
      slug: 'product-market-fit-checklist',
      content: 'Validate your startup idea effectively.',
      category: 'Business',
      coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    },
    {
      title: 'Dark Mode UI Design Principles',
      slug: 'dark-mode-ui-design-principles',
      content: 'How to design accessible dark themes.',
      category: 'Design',
      coverImage: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800',
    },
    {
      title: 'GraphQL vs REST in 2025',
      slug: 'graphql-vs-rest-2025',
      content: 'Choosing the right API architecture.',
      category: 'Technology',
      coverImage: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800',
    },
    {
      title: 'Startup Fundraising Guide',
      slug: 'startup-fundraising-guide',
      content: 'Understand VC rounds and valuation.',
      category: 'Business',
      coverImage: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800',
    },
    {
      title: 'Typography Rules for Web Designers',
      slug: 'typography-rules-for-web-designers',
      content: 'Improve readability and hierarchy.',
      category: 'Design',
      coverImage: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800',
    },
    {
      title: 'Web Performance Optimization Checklist',
      slug: 'web-performance-optimization-checklist',
      content: 'Reduce load time and improve Core Web Vitals.',
      category: 'Technology',
      coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
    },
    {
      title: 'Building Personal Brand as Developer',
      slug: 'building-personal-brand-as-developer',
      content: 'Leverage content and open source.',
      category: 'Business',
      coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
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

  for (const blog of blogs) {
    await prisma.blog.upsert({
      where: { slug: blog.slug },
      update: {},
      create: {
        ...blog,
        authorId: admin.id,
      },
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
