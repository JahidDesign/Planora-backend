import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function uniqueSlug(baseSlug) {
  let slug = baseSlug;
  let count = 1;
  while (await prisma.blog.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${count++}`;
  }
  return slug;
}

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Reset tables (safe to re-run) ───────────────────────────────────────────
  console.log('🧹 Clearing existing data...');
  await prisma.blog.deleteMany();
  await prisma.event.deleteMany();
  // Users are upserted below, so no need to delete them

  // ─── Users ───────────────────────────────────────────────────────────────────
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

  const userPassword = await bcrypt.hash('User@1234', 12);
  const user1 = await prisma.user.upsert({
    where: { email: 'nilima@example.com' },
    update: {},
    create: { name: 'Nilima Jarin', email: 'nilima@example.com', password: userPassword },
  });
  const user2 = await prisma.user.upsert({
    where: { email: 'raj@example.com' },
    update: {},
    create: { name: 'Raj Adam', email: 'raj@example.com', password: userPassword },
  });
  const user3 = await prisma.user.upsert({
    where: { email: 'smith@example.com' },
    update: {},
    create: { name: 'Smith Williams', email: 'smith@example.com', password: userPassword },
  });
  const user4 = await prisma.user.upsert({
    where: { email: 'david@example.com' },
    update: {},
    create: { name: 'David Chen', email: 'david@example.com', password: userPassword },
  });

  // ─── 45 Events ───────────────────────────────────────────────────────────────
  const events = [
    // ── Technology (18) ──────────────────────────────────────────────────────
    {
      title: 'Next.js Summit 2025',
      description:
        'A premier conference for Next.js developers exploring the latest in React Server Components, App Router, and edge computing. Join industry leaders and innovative engineers for two days of deep technical sessions, live coding demos, and networking.',
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
      description:
        'Hands-on workshop covering the fundamentals of AI/ML with practical Python exercises. Learn to build and deploy your first ML model with real datasets.',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      venue: 'Tech Hub, Austin TX',
      type: 'PUBLIC',
      fee: 49.99,
      category: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800',
    },
    {
      title: 'Open Source Hackathon',
      description:
        '48-hour hackathon building tools for the open source community. Cash prizes and job opportunities await top teams. All skill levels welcome.',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      venue: 'Google Campus, Mountain View',
      type: 'PUBLIC',
      fee: 0,
      category: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
    },
    {
      title: 'DevOps & Cloud Native Summit',
      description:
        'Deep dives into Kubernetes, Terraform, CI/CD pipelines, and the future of cloud infrastructure. Featuring live cluster demos and hands-on labs.',
      date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      venue: 'AWS HQ, Seattle',
      type: 'PUBLIC',
      fee: 0,
      category: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
    },
    {
      title: 'Cybersecurity Symposium',
      description:
        'Leading experts in cybersecurity share the latest threats, tools, and defense strategies. Sessions on zero-trust, ransomware defense, and red-teaming.',
      date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
      venue: 'Pentagon City, Arlington VA',
      type: 'PUBLIC',
      fee: 99,
      category: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800',
    },
    {
      title: 'Web3 Builders Retreat',
      description:
        'A weekend retreat for blockchain developers and Web3 enthusiasts. Build, learn, and connect with the decentralized community over immersive sessions.',
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      venue: 'Miami Beach, FL',
      type: 'PRIVATE',
      fee: 199,
      category: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800',
    },
    {
      title: 'React Native Mobile Summit',
      description:
        'Everything you need to know about building cross-platform mobile apps with React Native and Expo. Performance, navigation, and native module deep dives.',
      date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      venue: 'Los Angeles Convention Center, CA',
      type: 'PUBLIC',
      fee: 59,
      category: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
    },
    {
      title: 'GraphQL & API Design Conference',
      description:
        'Best practices for building scalable APIs with GraphQL, REST, and gRPC. Real-world case studies from companies running millions of API calls per day.',
      date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      venue: 'Chicago Marriott Downtown',
      type: 'PUBLIC',
      fee: 75,
      category: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
    },
    {
      title: 'Data Engineering Summit',
      description:
        'From data lakes to lakehouse architectures — learn how top data teams build reliable pipelines using dbt, Spark, Airflow, and Snowflake.',
      date: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
      venue: 'Denver Convention Center, CO',
      type: 'PUBLIC',
      fee: 89,
      category: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    },
    {
      title: 'TypeScript Deep Dive Workshop',
      description:
        'An advanced workshop for developers who want to master TypeScript generics, conditional types, decorators, and the latest compiler features.',
      date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      venue: 'Virtual (Online)',
      type: 'PUBLIC',
      fee: 29,
      category: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
    },
    {
      title: 'Serverless & Edge Computing Forum',
      description:
        'Explore the serverless paradigm with Cloudflare Workers, Vercel Edge Functions, and AWS Lambda. Build globally distributed apps with minimal ops overhead.',
      date: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000),
      venue: 'Austin Convention Center, TX',
      type: 'PUBLIC',
      fee: 0,
      category: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800',
    },
    {
      title: 'LLM Engineering Bootcamp',
      description:
        'Practical training on building production-grade applications with large language models. RAG pipelines, prompt engineering, fine-tuning, and evaluation frameworks.',
      date: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
      venue: 'NVIDIA HQ, Santa Clara CA',
      type: 'PRIVATE',
      fee: 299,
      category: 'Technology',
      isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800',
    },
    {
      title: 'Game Developers Conference Indie Day',
      description:
        'A dedicated day within GDC for indie game developers to showcase their work, attend workshops on Unity and Unreal, and pitch to publishers.',
      date: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
      venue: 'Moscone Center, San Francisco',
      type: 'PUBLIC',
      fee: 120,
      category: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800',
    },
    {
      title: 'IoT & Embedded Systems Expo',
      description:
        'Discover the latest in IoT hardware, firmware development, MQTT protocols, and real-time operating systems. Live hardware hacking sessions included.',
      date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      venue: 'Boston Convention Center, MA',
      type: 'PUBLIC',
      fee: 55,
      category: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    },
    {
      title: 'PostgreSQL & Database Performance Lab',
      description:
        'Hands-on lab sessions on query optimization, indexing strategies, partitioning, and pg_vector for AI workloads. Bring your slow queries!',
      date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
      venue: 'Microsoft Campus, Redmond WA',
      type: 'PUBLIC',
      fee: 40,
      category: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800',
    },
    {
      title: 'Frontend Performance Summit',
      description:
        'Core Web Vitals, bundle optimization, lazy loading, and everything you need to make your web app blazing fast. Lighthouse audits done live on stage.',
      date: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000),
      venue: 'Hyatt Regency, San Francisco',
      type: 'PUBLIC',
      fee: 65,
      category: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
    },
    {
      title: 'Rust Systems Programming Workshop',
      description:
        'Learn Rust from ownership and borrowing to async programming and WebAssembly. Ideal for engineers coming from C++ or Go backgrounds.',
      date: new Date(Date.now() + 38 * 24 * 60 * 60 * 1000),
      venue: 'Mozilla HQ, San Francisco',
      type: 'PUBLIC',
      fee: 45,
      category: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
    },
    {
      title: 'Docker & Container Orchestration Masterclass',
      description:
        'From Dockerfile best practices to production Kubernetes deployments. Security scanning, multi-stage builds, Helm charts, and service meshes covered.',
      date: new Date(Date.now() + 55 * 24 * 60 * 60 * 1000),
      venue: 'San Jose Convention Center, CA',
      type: 'PUBLIC',
      fee: 79,
      category: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800',
    },

    // ── Business (10) ────────────────────────────────────────────────────────
    {
      title: 'Startup Founders Mastermind',
      description:
        'Exclusive private gathering of early-stage founders sharing growth strategies, fundraising stories, and hard-won lessons in a candid, off-the-record format.',
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      venue: 'WeWork HQ, New York',
      type: 'PRIVATE',
      fee: 0,
      category: 'Business',
      imageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800',
    },
    {
      title: 'Product Management Bootcamp',
      description:
        'Intensive 3-day bootcamp for aspiring and experienced PMs. Cover strategy, roadmapping, prioritization frameworks, and stakeholder management.',
      date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
      venue: 'Seattle Convention Center',
      type: 'PUBLIC',
      fee: 149,
      category: 'Business',
      imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
    },
    {
      title: 'SaaS Growth Summit',
      description:
        'How the fastest-growing SaaS companies acquire, activate, and retain customers. Talks on PLG, pricing, churn reduction, and expansion revenue.',
      date: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000),
      venue: 'Grand Hyatt, New York',
      type: 'PUBLIC',
      fee: 199,
      category: 'Business',
      isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800',
    },
    {
      title: 'Venture Capital & Fundraising Forum',
      description:
        'Connect with top VCs and angel investors. Workshops on pitch decks, term sheets, cap table management, and building investor relationships.',
      date: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000),
      venue: 'Salesforce Tower, San Francisco',
      type: 'PRIVATE',
      fee: 250,
      category: 'Business',
      imageUrl: 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=800',
    },
    {
      title: 'Digital Marketing Masterclass',
      description:
        'Comprehensive coverage of SEO, paid ads, email marketing, and social media strategy. Includes hands-on Google Ads and Meta Ads campaign workshops.',
      date: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
      venue: 'Marriott Marquis, Atlanta GA',
      type: 'PUBLIC',
      fee: 89,
      category: 'Business',
      imageUrl: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800',
    },
    {
      title: 'Remote Work Leadership Summit',
      description:
        'Build high-performance distributed teams. Topics include async communication, remote hiring, culture building, and tools for virtual collaboration.',
      date: new Date(Date.now() + 48 * 24 * 60 * 60 * 1000),
      venue: 'Virtual (Online)',
      type: 'PUBLIC',
      fee: 0,
      category: 'Business',
      imageUrl: 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=800',
    },
    {
      title: 'E-Commerce Accelerator Workshop',
      description:
        'Learn to build and scale a profitable online store. Shopify, inventory management, fulfillment, Facebook ads, and influencer marketing strategies.',
      date: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
      venue: 'Phoenix Convention Center, AZ',
      type: 'PUBLIC',
      fee: 69,
      category: 'Business',
      imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800',
    },
    {
      title: 'HR Tech & Future of Work Conference',
      description:
        'Exploring how AI, automation, and changing employee expectations are reshaping HR practices, recruitment, and workplace culture.',
      date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      venue: 'Omni Hotel, Dallas TX',
      type: 'PUBLIC',
      fee: 110,
      category: 'Business',
      imageUrl: 'https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?w=800',
    },
    {
      title: 'Finance & FinTech Innovation Forum',
      description:
        'Where traditional finance meets cutting-edge technology. Open banking APIs, embedded finance, crypto regulation, and robo-advisory deep dives.',
      date: new Date(Date.now() + 53 * 24 * 60 * 60 * 1000),
      venue: 'NYSE, New York',
      type: 'PUBLIC',
      fee: 175,
      category: 'Business',
      imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    },
    {
      title: 'B2B Sales Excellence Summit',
      description:
        'Top enterprise sales leaders share playbooks for prospecting, discovery, negotiation, and closing complex multi-stakeholder deals.',
      date: new Date(Date.now() + 36 * 24 * 60 * 60 * 1000),
      venue: 'Westin Peachtree, Atlanta',
      type: 'PUBLIC',
      fee: 130,
      category: 'Business',
      imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800',
    },

    // ── Design (7) ───────────────────────────────────────────────────────────
    {
      title: 'Design Systems Conference',
      description:
        'Learn how leading companies build and maintain scalable design systems. Featuring speakers from Airbnb, Figma, and Shopify with live component library demos.',
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      venue: 'Design Center, Chicago',
      type: 'PUBLIC',
      fee: 79,
      category: 'Design',
      imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
    },
    {
      title: 'UX Research & Usability Testing Workshop',
      description:
        'Master user interviews, usability tests, card sorting, and synthesis techniques. Learn to turn research insights into actionable design decisions.',
      date: new Date(Date.now() + 19 * 24 * 60 * 60 * 1000),
      venue: 'IDEO Studio, Palo Alto CA',
      type: 'PUBLIC',
      fee: 95,
      category: 'Design',
      imageUrl: 'https://images.unsplash.com/photo-1587440871875-191322ee64b0?w=800',
    },
    {
      title: 'Brand Identity & Visual Design Retreat',
      description:
        'A three-day creative retreat focusing on typography, color theory, logo design, and building cohesive brand identities. Portfolio review sessions included.',
      date: new Date(Date.now() + 44 * 24 * 60 * 60 * 1000),
      venue: 'Santa Barbara, CA',
      type: 'PRIVATE',
      fee: 349,
      category: 'Design',
      imageUrl: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800',
    },
    {
      title: 'Motion Design & Animation Symposium',
      description:
        'From After Effects to Lottie animations in your app — explore motion principles, micro-interactions, and storytelling through animation.',
      date: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000),
      venue: 'Adobe HQ, San Jose CA',
      type: 'PUBLIC',
      fee: 60,
      category: 'Design',
      imageUrl: 'https://images.unsplash.com/photo-1574717025058-2f8737d2e2b7?w=800',
    },
    {
      title: 'Figma Community Meetup',
      description:
        'Monthly Figma user meetup with live design challenges, plugin showcases, and Q&A with Figma power users. Free drinks and snacks provided.',
      date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      venue: 'Figma Office, San Francisco',
      type: 'PUBLIC',
      fee: 0,
      category: 'Design',
      imageUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800',
    },
    {
      title: '3D & Generative Art Workshop',
      description:
        'Blend creativity and code with Blender, Three.js, and generative art tools. Create stunning visuals through procedural design and creative coding.',
      date: new Date(Date.now() + 57 * 24 * 60 * 60 * 1000),
      venue: 'Art Institute, Chicago',
      type: 'PUBLIC',
      fee: 85,
      category: 'Design',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    },
    {
      title: 'Accessibility-First Design Forum',
      description:
        'Design and build products that work for everyone. WCAG guidelines, screen reader testing, color contrast, and inclusive design principles.',
      date: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
      venue: 'Virtual (Online)',
      type: 'PUBLIC',
      fee: 0,
      category: 'Design',
      imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800',
    },

    // ── Health & Wellness (5) ─────────────────────────────────────────────────
    {
      title: 'Tech Wellness & Burnout Prevention Summit',
      description:
        'Mental health for engineers, designers, and PMs. Evidence-based strategies for managing stress, preventing burnout, and building sustainable careers in tech.',
      date: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000),
      venue: 'Four Seasons, Boston',
      type: 'PUBLIC',
      fee: 49,
      category: 'Health',
      imageUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800',
    },
    {
      title: 'Mindfulness & Productivity Retreat',
      description:
        'A weekend off-grid retreat combining meditation, deep-work sessions, and workshops on intentional productivity. Limited to 30 participants.',
      date: new Date(Date.now() + 62 * 24 * 60 * 60 * 1000),
      venue: 'Esalen Institute, Big Sur CA',
      type: 'PRIVATE',
      fee: 599,
      category: 'Health',
      imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
    },
    {
      title: 'Women in Tech Wellness Day',
      description:
        'A free event for women in the tech industry featuring workshops on work-life integration, imposter syndrome, and building peer support networks.',
      date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      venue: 'Twitter HQ, San Francisco',
      type: 'PUBLIC',
      fee: 0,
      category: 'Health',
      imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
    },
    {
      title: 'Ergonomics & Home Office Setup Workshop',
      description:
        'Physiotherapists and productivity coaches guide you through setting up an ergonomic, efficient, and energizing home workspace.',
      date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      venue: 'Virtual (Online)',
      type: 'PUBLIC',
      fee: 19,
      category: 'Health',
      imageUrl: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800',
    },
    {
      title: 'Sleep Science for Peak Performance',
      description:
        'Sleep researchers and performance coaches reveal the science of sleep and practical strategies for optimizing your rest and cognitive performance.',
      date: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000),
      venue: 'Stanford Medical Center, Palo Alto',
      type: 'PUBLIC',
      fee: 35,
      category: 'Health',
      imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800',
    },

    // ── Education (5) ────────────────────────────────────────────────────────
    {
      title: 'EdTech Innovation Conference',
      description:
        'Bringing together educators, technologists, and policymakers to explore AI tutors, adaptive learning platforms, and the future of online education.',
      date: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000),
      venue: 'Harvard Faculty Club, Cambridge MA',
      type: 'PUBLIC',
      fee: 85,
      category: 'Education',
      imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800',
    },
    {
      title: 'Coding Bootcamp Info Day',
      description:
        'Free information day for people considering a career change into software development. Meet instructors, hear alumni stories, and get scholarship info.',
      date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      venue: 'General Assembly, New York',
      type: 'PUBLIC',
      fee: 0,
      category: 'Education',
      imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800',
    },
    {
      title: 'Public Speaking & Technical Presentation Workshop',
      description:
        'Become a confident speaker at conferences and meetups. Crafting narratives, handling Q&A, slide design, and dealing with stage fright — all covered.',
      date: new Date(Date.now() + 26 * 24 * 60 * 60 * 1000),
      venue: 'Toastmasters HQ, Englewood CO',
      type: 'PUBLIC',
      fee: 39,
      category: 'Education',
      imageUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800',
    },
    {
      title: 'Open Education Resources Summit',
      description:
        'A community-driven summit celebrating freely available learning materials. Sessions on Creative Commons licensing, OER creation, and accessibility.',
      date: new Date(Date.now() + 52 * 24 * 60 * 60 * 1000),
      venue: 'MIT Media Lab, Cambridge MA',
      type: 'PUBLIC',
      fee: 0,
      category: 'Education',
      imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
    },
    {
      title: 'Learn to Code Kids Camp',
      description:
        'A fun one-day camp for kids aged 8–14 introducing Scratch, Python basics, and simple game creation. Parents welcome to observe the final showcase.',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      venue: 'Code.org Partner School, Seattle',
      type: 'PUBLIC',
      fee: 25,
      category: 'Education',
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
    },
  ];

  console.log('📅 Creating events...');
  for (const eventData of events) {
    const organizerId = Math.random() > 0.5 ? user1.id : user2.id;
    await prisma.event.create({
      data: { ...eventData, organizerId },
    });
  }
  console.log(`✅ Created ${events.length} events`);

  // ─── 50 Blog Posts ───────────────────────────────────────────────────────────
  const blogs = [
    // ── Technology (18) ──────────────────────────────────────────────────────
    {
      title: 'The Complete Guide to React Server Components',
      excerpt:
        'React Server Components are changing how we think about rendering. This guide covers everything from the basics to advanced patterns.',
      content: `React Server Components (RSC) represent one of the most significant shifts in React's history. Unlike traditional client components, RSCs run exclusively on the server and have zero JavaScript footprint on the client. This means you can write components that directly access databases, read files, or call private APIs without exposing any of that logic to the browser.\n\nThe key insight behind RSCs is the separation of concerns between data fetching and interactivity. Server components handle the data layer while client components handle user interactions. This hybrid model allows you to ship dramatically less JavaScript to the browser while still having rich, interactive UIs.\n\nIn the Next.js App Router, all components are server components by default. You opt into client-side rendering by adding the "use client" directive at the top of a file. This inversion of the default is powerful because it encourages developers to think carefully about which parts of their UI genuinely need client-side JavaScript.\n\nOne common gotcha is that server components cannot use hooks like useState or useEffect. If you need interactivity, you must extract that piece into a client component. However, you can still pass server-rendered data as props to client components, giving you the best of both worlds.\n\nStreaming is another superpower of RSCs. Using React's Suspense boundaries, you can stream parts of the page as they become ready rather than waiting for all data to load before showing anything. This dramatically improves perceived performance for data-heavy pages.`,
      category: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
      isFeatured: true,
      tags: ['React', 'Next.js', 'Server Components', 'Web Dev'],
    },
    {
      title: "TypeScript 5.x: What's New and Why It Matters",
      excerpt:
        'A deep dive into the latest TypeScript features including const type parameters, decorators, and variadic tuple improvements.',
      content: `TypeScript 5.0 was a landmark release that brought fundamental improvements to the language. The headline feature is the new decorator standard — after years of experimental decorators, TypeScript now supports the TC39 Stage 3 decorators proposal, which means your decorator code will be standards-compliant and portable.\n\nConst type parameters are another game-changer. Previously, if you passed a literal value to a generic function, TypeScript would widen the type. Now you can use const on type parameters to preserve literal types, making utility functions much more type-safe without requiring users to add "as const" everywhere.\n\nThe moduleSuffixes option is a huge win for React Native developers who need to import platform-specific files. And the new --verbatimModuleSyntax flag helps you write import statements that will work correctly across different module systems without the TypeScript compiler silently transforming them.\n\nPerformance improvements are also significant. The TypeScript team rewrote many of the compiler's core data structures and reduced memory usage by up to 50% for large projects. Type checking and language server operations are noticeably faster.\n\nLooking ahead, TypeScript's roadmap includes improvements to type inference for complex generics, better support for the upcoming ECMAScript features, and continued work on language server performance. The future of TypeScript has never looked brighter.`,
      category: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
      tags: ['TypeScript', 'JavaScript', 'Web Dev'],
    },
    {
      title: 'Building a Real-Time App with WebSockets and Next.js',
      excerpt:
        'Step-by-step tutorial for adding real-time functionality to your Next.js app using WebSockets, Socket.io, and Pusher.',
      content: `Real-time features like live notifications, collaborative editing, and chat have become expectations rather than nice-to-haves. In this post we'll explore three approaches to adding real-time functionality to your Next.js app.\n\nThe simplest approach is Server-Sent Events (SSE), which is a one-way connection from server to client. SSE works great for notifications, live feeds, and progress updates. You can implement SSE in Next.js Route Handlers by returning a ReadableStream with the appropriate content-type headers.\n\nFor bidirectional communication, you need WebSockets. The challenge with WebSockets and serverless deployments is that WebSocket connections are long-lived, which doesn't fit the request-response model. Solutions like Pusher, Ably, and Liveblocks abstract this away by handling the WebSocket infrastructure for you.\n\nSocket.io is a popular option if you're running your own Node.js server. It provides a WebSocket abstraction with automatic fallback to polling for older browsers, rooms for grouping connections, and built-in reconnection logic.\n\nFor production apps, you'll also need to think about horizontal scaling. When you have multiple server instances, a WebSocket connection on one instance needs to communicate with users connected to other instances. Redis pub/sub is the standard solution here — all server instances subscribe to Redis channels and broadcast messages to their locally connected clients.`,
      category: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
      tags: ['WebSockets', 'Next.js', 'Real-Time', 'Node.js'],
    },
    {
      title: 'Docker in Production: Lessons from the Trenches',
      excerpt:
        'Hard-won lessons from running containerized applications in production, including security, performance, and debugging tips.',
      content: `After years of running Docker in production, there are patterns and anti-patterns that consistently make or break containerized deployments. Here are the most important lessons.\n\nAlways use multi-stage builds. A naive Dockerfile that builds your application in the same image you deploy will be bloated with build tools, development dependencies, and source code. Multi-stage builds let you compile in one image and copy only the final artifact into a minimal runtime image. This can reduce image sizes from gigabytes to megabytes.\n\nNever run processes as root inside containers. Even though containers provide isolation, running as root gives an attacker more capabilities if they escape the container. Create a non-root user in your Dockerfile and switch to it before the CMD or ENTRYPOINT.\n\nHealth checks are non-negotiable in production. Docker and orchestrators like Kubernetes use health checks to know when a container is ready to serve traffic and when it needs to be restarted. Implement both liveness and readiness probes.\n\nFor logging, write to stdout and stderr rather than files. Container orchestrators capture stdout/stderr and forward it to your logging infrastructure automatically. Writing to files inside a container creates problems with log rotation and makes logs harder to access.\n\nResource limits should always be set. An unconstrained container can starve other containers on the same host. Set both CPU and memory limits in your compose files or Kubernetes manifests.`,
      category: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800',
      tags: ['Docker', 'DevOps', 'Production', 'Containers'],
    },
    {
      title: "Understanding LLMs: A Developer's Primer",
      excerpt:
        'Cut through the hype and understand how large language models actually work, from tokenization to transformer architecture.',
      content: `Large language models have transformed software development, but few developers deeply understand how they work. This primer aims to change that.\n\nAt their core, LLMs are next-token predictors. They take a sequence of tokens as input and output a probability distribution over the vocabulary for what token should come next. A "token" isn't exactly a word — it's a chunk of text that the tokenizer has learned to use as a unit. Common words are single tokens while rare words might be split into multiple tokens.\n\nThe transformer architecture, introduced in the "Attention Is All You Need" paper, is the backbone of modern LLMs. The key innovation is the attention mechanism, which allows each token in the sequence to "attend to" every other token and weight its influence on the next prediction. This is fundamentally different from RNNs, which could only see the recent context.\n\nScale is the surprising secret sauce. Researchers discovered that making models bigger and training them on more data produces dramatic, unpredictable capability jumps. This scaling law isn't fully understood theoretically but holds remarkably well empirically.\n\nThe base model produced by this process can complete text but doesn't follow instructions well. Instruction tuning using supervised fine-tuning on human demonstrations, combined with RLHF (Reinforcement Learning from Human Feedback), is what transforms a raw model into a useful assistant like ChatGPT or Claude.\n\nFor developers, the practical implication is that LLMs are probabilistic. The same input can produce different outputs, and outputs can be confidently wrong. Building robust LLM-powered applications requires validation, fallbacks, and careful evaluation.`,
      category: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800',
      isFeatured: true,
      tags: ['AI', 'LLM', 'Machine Learning', 'NLP'],
    },
    {
      title: 'Mastering Git: Beyond the Basics',
      excerpt:
        'Interactive rebase, bisect, reflog, worktrees — the power Git features that separate junior from senior developers.',
      content: `Most developers use a handful of Git commands daily and rarely venture beyond commit, push, pull, and merge. But Git's advanced features can save hours and prevent disasters.\n\nInteractive rebase (git rebase -i) is one of the most powerful tools in Git. It lets you rewrite your local commit history before pushing. You can squash multiple commits into one, reorder commits, edit commit messages, or split a commit into multiple smaller ones. Clean commit history makes code review easier and git blame more useful.\n\nGit bisect is invaluable for hunting bugs. When you know a bug exists in the current version but not in some older version, bisect performs a binary search through the commit history to find the exact commit that introduced it. This can narrow thousands of commits down to the culprit in minutes.\n\nThe reflog is your safety net. Every time the tip of a branch moves, Git records it in the reflog. Accidentally reset and lost commits? Deleted a branch too soon? The reflog remembers where HEAD was and lets you recover seemingly lost work.\n\nGit worktrees let you check out multiple branches simultaneously into different directories. This is useful when you need to switch contexts quickly without stashing changes, or when you want to run tests on one branch while coding on another.\n\nFinally, learn to write good commit messages. A good commit message should complete the sentence "If applied, this commit will..." Use the imperative mood, keep the subject line under 72 characters, and explain the why not the what in the body.`,
      category: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800',
      tags: ['Git', 'Version Control', 'Developer Tools'],
    },
    {
      title: 'PostgreSQL Performance Tuning: The Definitive Guide',
      excerpt:
        'Indexes, query planner, VACUUM, connection pooling, and partitioning — everything you need to make Postgres fly.',
      content: `PostgreSQL is incredibly powerful out of the box, but defaults are conservative and production workloads often require careful tuning.\n\nStart with EXPLAIN ANALYZE. Before trying to optimize anything, understand what the query planner is actually doing. Look for sequential scans on large tables, nested loop joins with large row estimates, and sort operations that spill to disk.\n\nIndexes are your primary tool. The right index can turn a multi-second query into milliseconds. Composite indexes are often more efficient than multiple single-column indexes — but only when your queries actually use the leading columns. Use pg_stat_user_indexes to find indexes that are never used and costing write performance for nothing.\n\nVACUUM and autovacuum deserve attention. PostgreSQL uses MVCC, which means old row versions accumulate over time. VACUUM reclaims this space and updates table statistics that the planner uses. Autovacuum handles this automatically but can sometimes not keep up with write-heavy workloads. Monitor pg_stat_user_tables for tables with high n_dead_tup counts.\n\nConnection pooling with PgBouncer is essential for high-concurrency applications. PostgreSQL creates a separate process for each connection, so hundreds of simultaneous connections will thrash your server. PgBouncer maintains a small pool of actual PostgreSQL connections and multiplexes thousands of application connections through them.\n\nFor very large tables, partitioning can dramatically improve query performance. Declarative partitioning in modern PostgreSQL makes this manageable, and the query planner can perform partition pruning to skip irrelevant partitions entirely.`,
      category: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800',
      tags: ['PostgreSQL', 'Database', 'Performance', 'SQL'],
    },
    {
      title: 'The State of CSS in 2025',
      excerpt:
        'Container queries, cascade layers, :has(), and the future of CSS — what every web developer needs to know right now.',
      content: `CSS has evolved dramatically, and 2024-2025 marks a turning point where features that developers have wanted for years are finally available across all major browsers.\n\nContainer queries are arguably the biggest addition to CSS in years. Media queries let you style elements based on the viewport size, but container queries let you style elements based on their parent container's size. This makes truly reusable components possible — a card component can adapt its layout whether it's in a narrow sidebar or a wide main content area.\n\nThe :has() pseudo-class (sometimes called the "parent selector") solves a problem developers have wanted fixed for two decades. You can now select an element based on whether it contains certain children. Style a form differently if it has invalid inputs, or a list item differently if it contains a checkbox that's checked.\n\nCascade layers (with @layer) give you explicit control over specificity. Rather than fighting specificity with !important or overly specific selectors, you can define named layers and control which layer takes precedence. This is transformative for large codebases and design systems.\n\nCSS nesting is now natively supported without any preprocessor. You can nest selectors inside parent rules just like you can in Sass or Less. Combined with custom properties (CSS variables) and the newer color functions like oklch(), modern CSS is incredibly expressive.`,
      category: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800',
      tags: ['CSS', 'Web Dev', 'Frontend', 'Design'],
    },
    {
      title: 'Kubernetes for Developers: A Practical Introduction',
      excerpt:
        'Skip the ops jargon and learn what developers actually need to know about Kubernetes to deploy and debug their apps.',
      content: `Kubernetes can feel overwhelming, but most developers only need to understand a subset of its concepts to be productive. Here's what actually matters day-to-day.\n\nA Pod is the basic unit in Kubernetes — it's one or more containers that share a network namespace and storage. In practice, most Pods contain a single application container. You rarely create Pods directly; instead you create higher-level objects like Deployments.\n\nA Deployment manages a set of Pods. It ensures a specified number of replicas are always running and handles rolling updates. When you change a Deployment's container image, Kubernetes gradually replaces old Pods with new ones while keeping the service available.\n\nServices give Pods a stable network address. Pods come and go as Deployments scale or roll out updates, so you don't connect directly to Pods. A Service acts as a stable endpoint that load-balances traffic to the underlying Pods.\n\nConfigMaps and Secrets let you separate configuration from code. ConfigMaps store non-sensitive configuration as key-value pairs. Secrets store sensitive data and are base64-encoded (note: this is not encryption; you need additional tooling like Sealed Secrets or Vault for real secrets management).\n\nFor debugging, kubectl logs and kubectl exec are your best friends. kubectl logs shows container output, and kubectl exec lets you open a shell inside a running container to poke around. kubectl describe shows detailed information about any resource including events that explain why it's in its current state.`,
      category: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
      tags: ['Kubernetes', 'DevOps', 'Cloud', 'Containers'],
    },
    {
      title: 'API Design Best Practices in 2025',
      excerpt:
        'Versioning, pagination, error handling, and documentation — the principles that make APIs developers love to use.',
      content: `A well-designed API is a joy to use; a poorly designed one is a constant source of friction and bugs. These principles will help you design APIs that your users — other developers — will appreciate.\n\nConsistency is king. Use the same naming conventions, error formats, and patterns throughout your API. If some endpoints use camelCase and others use snake_case, developers will constantly be looking things up. If errors sometimes have a code field and sometimes don't, error handling becomes a nightmare.\n\nDesign for the use case, not the database. A common mistake is to model API resources directly after database tables. Instead, think about what operations your clients need to perform and design resources around those workflows. This often means combining data from multiple tables into a single response.\n\nVersioning from the start saves pain later. Once you have external consumers, breaking changes become very expensive. Include a version in your URL path (/v1/users) or use API versioning headers. Maintain old versions long enough for clients to migrate.\n\nPagination is non-negotiable for list endpoints. Never return unbounded lists. Use cursor-based pagination for large, frequently updated datasets — it's more efficient and more correct than offset pagination. Include next-page cursors in responses rather than requiring clients to calculate offsets.\n\nError responses should be as helpful as error messages in code. Include a machine-readable error code, a human-readable message, and when possible, a pointer to the part of the request that caused the problem. A 400 Bad Request with a body of {"error":"invalid request"} is useless.`,
      category: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
      tags: ['API Design', 'REST', 'GraphQL', 'Backend'],
    },
    {
      title: 'Practical Guide to Web Performance Optimization',
      excerpt:
        'Core Web Vitals, image optimization, code splitting, and caching strategies that make a measurable difference.',
      content: `Web performance directly impacts user experience, SEO rankings, and conversion rates. Every 100ms improvement in load time can meaningfully improve engagement metrics.\n\nStart by measuring before optimizing. Use Lighthouse, WebPageTest, and Chrome DevTools to establish baselines. Core Web Vitals — LCP (Largest Contentful Paint), FID/INP (Interaction to Next Paint), and CLS (Cumulative Layout Shift) — are the metrics Google uses for search ranking and should be your primary targets.\n\nImages are almost always the biggest opportunity. Serve images in modern formats (WebP, AVIF), size them appropriately for the display size, use lazy loading for below-the-fold images, and consider a CDN with automatic image optimization. Next.js's Image component handles most of this automatically.\n\nCode splitting reduces the JavaScript bundle your users must download and parse. Dynamic imports (import()) let you defer loading of non-critical code until it's needed. Route-based splitting is the minimum; component-level splitting for heavy libraries is worth the added complexity.\n\nCaching is free performance. A proper cache strategy means returning visitors load your app nearly instantly. Cache static assets aggressively with long cache-control headers and content-hashed filenames. Use stale-while-revalidate for API responses that can tolerate brief staleness.\n\nReduce render-blocking resources. CSS in the <head> and synchronous <script> tags in the <head> block HTML parsing. Inline critical CSS, defer non-critical CSS, and use async or defer for scripts that don't need to run before the page renders.`,
      category: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
      tags: ['Performance', 'Web Dev', 'Core Web Vitals', 'Frontend'],
    },
    {
      title: 'Introduction to Rust for JavaScript Developers',
      excerpt:
        'Coming from JS to Rust? This guide maps familiar concepts and explains ownership, borrowing, and lifetimes in terms you already understand.',
      content: `Rust is having a moment. Its combination of systems-level performance and memory safety without a garbage collector makes it compelling for CLI tools, WebAssembly modules, and high-performance backend services. If you're a JavaScript developer curious about Rust, here's how to bridge the gap.\n\nThe biggest conceptual shift is ownership. In JavaScript, values are garbage collected — you create objects and the runtime cleans them up when nothing references them anymore. In Rust, every value has exactly one owner, and the value is dropped (freed) when the owner goes out of scope. This is enforced at compile time, not runtime.\n\nBorrowing is Rust's way of using a value without taking ownership. An immutable borrow (&T) lets you read a value. A mutable borrow (&mut T) lets you modify it. The rule: you can have either one mutable borrow or any number of immutable borrows — never both simultaneously. This rule eliminates a whole class of bugs at compile time.\n\nRust's Option<T> maps to JavaScript's nullable values. Instead of null or undefined, Rust uses Option which is either Some(value) or None. The compiler forces you to handle both cases, eliminating null reference errors.\n\nResult<T, E> maps to JavaScript's try/catch pattern. Functions that can fail return Result, and the ? operator provides ergonomic error propagation that's similar to async/await for promises.\n\nFor JavaScript developers, the tooling feels familiar. Cargo is Rust's npm — it manages dependencies, builds projects, and runs tests. crates.io is the package registry. Getting started is as simple as curl https://sh.rustup.rs | sh.`,
      category: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
      tags: ['Rust', 'JavaScript', 'Systems Programming', 'WebAssembly'],
    },
    {
      title: 'Monorepo Architecture: When and How to Use It',
      excerpt:
        'Turborepo, Nx, and pnpm workspaces — a practical guide to monorepos for teams that have outgrown separate repositories.',
      content: `A monorepo stores multiple projects in a single repository. It's the architecture used by Google, Meta, and Microsoft internally, and tools like Turborepo and Nx have made it accessible for smaller teams.\n\nThe core benefits are code sharing and atomic changes. When your frontend app, backend API, and shared UI library live in separate repos, updating a shared type or component requires coordinated PRs across repos. In a monorepo, you change the shared code and update all consumers in a single commit.\n\nTurborepo is currently the most accessible entry point for JavaScript/TypeScript monorepos. It adds intelligent caching on top of npm/yarn/pnpm workspaces — tasks that haven't changed since the last run are skipped instantly. Remote caching means CI pipelines share the cache across machines, dramatically reducing build times.\n\nThe package structure matters. A common pattern is packages/ for shared libraries (ui, utils, types, config) and apps/ for deployable applications (web, api, mobile). Each package has its own package.json and TypeScript config, but all share a root-level lock file.\n\nMonorepos aren't always the right choice. They add complexity to CI/CD, require more careful access control if different teams own different projects, and can create a false sense that all projects should be tightly coupled. The payoff is highest when you have genuine code sharing between projects maintained by the same team.`,
      category: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
      tags: ['Monorepo', 'Turborepo', 'Architecture', 'DevOps'],
    },
    {
      title: 'Testing Strategies for Modern Web Applications',
      excerpt:
        'The testing pyramid, React Testing Library, Playwright, and the philosophy behind writing tests that add value.',
      content: `Testing is one of those topics where developers have strong opinions and mediocre practices. The gap between knowing you should test and writing tests that actually make your codebase more maintainable is where most teams struggle.\n\nThe testing pyramid describes the ideal distribution of test types. Unit tests are fast, cheap to write, and should be the largest layer. Integration tests verify that units work together correctly. End-to-end tests simulate real user interactions and are expensive but provide the most confidence. The exact ratio depends on your application but a rough guide is 70/20/10.\n\nFor React applications, React Testing Library (RTL) is the standard. Its key philosophy is testing from the user's perspective rather than the implementation. Query elements by accessible role, label text, or placeholder text — not by CSS class or component internals. Tests that would survive a complete internal refactor of a component are much more valuable than tests tied to implementation details.\n\nPlaywright has emerged as the best-in-class end-to-end testing tool. It supports all major browsers, has excellent auto-waiting (no more flaky sleep() calls), and generates tests from browser recordings. For critical user flows — sign up, checkout, core workflows — Playwright tests give you confidence that can't be replicated by unit tests.\n\nTest-driven development (TDD) works best for pure functions and algorithmic code where the inputs and outputs are clear. For UI components and API integrations, writing tests after implementation is often more practical and equally valuable.`,
      category: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
      tags: ['Testing', 'React', 'Playwright', 'Quality'],
    },
    {
      title: 'System Design Interview Preparation Guide',
      excerpt:
        'How to approach URL shorteners, Twitter clones, and distributed caches — a framework for thinking through any system design problem.',
      content: `System design interviews are open-ended and deliberately ambiguous. There's no single correct answer, and the interviewer is evaluating your thought process as much as your final design. A structured approach makes these interviews significantly more manageable.\n\nStep one: clarify requirements. Spend 5 minutes asking questions to understand the scope. Is this for millions of users or thousands? Read-heavy or write-heavy? Does it need to be globally distributed? What's the consistency requirement — is eventual consistency acceptable? These answers fundamentally change the design.\n\nStep two: estimate scale. Back-of-envelope calculations establish whether you need a single database or a distributed system. If you have 100M daily active users posting once a day, that's roughly 1,200 writes per second. A single relational database handles this easily. At 1M writes per second, you need distributed solutions.\n\nStep three: define the API. Write out the key API endpoints before designing anything else. This forces clarity about what the system actually needs to do and serves as a contract for the rest of the design.\n\nStep four: design the data model. Choose your data store(s) based on access patterns. Relational databases for structured data with complex queries. Key-value stores for simple high-throughput lookups. Time-series databases for metrics. Graph databases for social networks and recommendations.\n\nStep five: design the high-level system, then zoom into the hard parts. Every interviewer is looking for you to identify the bottleneck or interesting challenge in the system and discuss it in depth. For a URL shortener it's generating unique short codes at scale. For a news feed it's fanout.`,
      category: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
      tags: ['System Design', 'Interview', 'Architecture', 'Distributed Systems'],
    },
    {
      title: 'GraphQL vs REST: Making the Right Choice in 2025',
      excerpt:
        'Beyond the hype — a pragmatic comparison of GraphQL and REST with guidance on which to choose for different project types.',
      content: `The GraphQL vs REST debate has raged for nearly a decade and both camps have accumulated genuine wisdom. In 2025, the answer is nuanced: both have clear sweet spots and neither is universally superior.\n\nREST wins for simplicity and tooling. HTTP semantics are universally understood. Caching at the HTTP level is straightforward. API clients exist in every language. If you're building a simple CRUD API for a single frontend, REST is almost certainly the right choice — less setup, less complexity, more developers who can maintain it.\n\nGraphQL wins for complex, multi-consumer APIs. The killer use case is a backend serving many different clients (web app, mobile app, third-party integrations) each needing different subsets of data. REST tends toward over-fetching (client gets more than it needs) or under-fetching (client needs multiple requests). GraphQL lets each client request exactly what it needs in a single round trip.\n\nThe N+1 problem is GraphQL's notorious footgun. A naive GraphQL server resolving a list of users with their posts makes one query for users and then N queries for each user's posts. DataLoader is the standard solution — it batches and deduplicates database calls within a single request.\n\nFor new projects in 2025, tRPC is worth serious consideration if your frontend and backend are both TypeScript. It provides end-to-end type safety without a schema definition language, and the DX is excellent for full-stack TypeScript teams. It doesn't have the flexibility of GraphQL but eliminates a lot of the setup cost.`,
      category: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
      tags: ['GraphQL', 'REST', 'API Design', 'Backend'],
    },
    {
      title: 'Deploying Node.js Apps at Scale',
      excerpt:
        'PM2, clustering, zero-downtime deployments, and the infrastructure decisions that keep your Node.js app running reliably.',
      content: `Node.js is single-threaded by default, which means a single Node.js process can only use one CPU core. For production deployments, you need to use the cluster module or a process manager like PM2 to take advantage of multi-core servers.\n\nPM2 is the most widely used process manager for Node.js. It handles clustering automatically with pm2 start app.js -i max, which spawns one worker per CPU core. It also handles automatic restarts on crashes, log aggregation, and monitoring dashboards.\n\nZero-downtime deployments are essential once you have real users. With PM2, pm2 reload app performs a rolling restart — new workers start and begin handling traffic before old workers are killed. With containers and Kubernetes, rolling deployments are the default behavior.\n\nMemory leaks are the silent killer of long-running Node.js processes. Profile memory usage with --inspect and Chrome DevTools, take heap snapshots to identify retaining paths, and monitor RSS memory in production. Process restarts (via PM2 or Kubernetes) are a band-aid, not a solution.\n\nHealth check endpoints are mandatory. An /health endpoint that checks database connectivity, cache connectivity, and any other critical dependencies lets your load balancer and orchestrator remove unhealthy instances from the pool before they start returning errors to users.\n\nStructured logging with a library like Pino makes logs searchable and filterable in aggregation tools. Always log request IDs to correlate logs across a distributed trace, and never log sensitive information like passwords or tokens.`,
      category: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800',
      tags: ['Node.js', 'DevOps', 'Scaling', 'Production'],
    },

    // ── Business & Startup (12) ───────────────────────────────────────────────
    {
      title: 'How to Build a $1M ARR SaaS in 18 Months',
      excerpt:
        'Practical playbook from a founder who did it — positioning, pricing, channels, and the uncomfortable truths about early-stage growth.',
      content: `Getting to $1M ARR is the first major milestone for a SaaS company. Here's an honest breakdown of what the journey actually looks like.\n\nNiching down early is counterintuitive but critical. The temptation is to build something everyone can use, but the businesses that grow fastest in their early stages pick a very specific customer segment and serve them exceptionally well. You can always expand later once you have product-market fit and cash flow.\n\nPricing should be higher than you're comfortable with. Founders consistently undercharge, especially technical founders who worry about accessibility. Higher prices signal quality, allow you to offer meaningful discounts as a sales lever, and give you the margin to afford customer success support. If nobody is pushing back on your pricing, you're probably undercharging.\n\nThe first 50 customers need to come from founder-led sales. No amount of SEO, content marketing, or paid ads will get you to product-market fit faster than talking to customers directly. Every sales call is a research call. You'll learn more about your positioning and objections in 50 conversations than in months of guessing.\n\nCustomer success is a growth lever, not a cost center. Churn kills SaaS companies quietly. Proactively helping customers succeed, monitoring usage to identify at-risk accounts, and building a feedback loop from customer insights back to product development will reduce churn and create expansion revenue.\n\nSay no to most opportunities. As you gain traction, you'll be approached with partnerships, integrations, and feature requests that seem appealing but will distract you. The companies that succeed are ruthlessly focused on what moves their core metrics.`,
      category: 'Business',
      imageUrl: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800',
      isFeatured: true,
      tags: ['SaaS', 'Startup', 'Growth', 'Entrepreneurship'],
    },
    {
      title: "The Product Manager's Guide to Prioritization Frameworks",
      excerpt:
        'RICE, ICE, MoSCoW, Kano — when to use each framework and how to avoid the traps that make prioritization theater.',
      content: `Prioritization is one of the most important skills a product manager can develop, yet most teams approach it inconsistently or let the loudest voice win. Frameworks provide structure, but they're means to an end — not the end itself.\n\nRICE (Reach × Impact × Confidence ÷ Effort) is excellent for comparing features quantitatively. It forces you to think about how many users will be affected, how much it'll move a key metric, how confident you are in your estimates, and how much effort it'll take. The weakness is that these scores can be gamed unconsciously based on what you already want to build.\n\nThe Kano model is invaluable for understanding customer delight. Basic features (must-haves) don't create satisfaction when present but create strong dissatisfaction when absent. Performance features create proportional satisfaction. Delight features create outsized satisfaction when present but no dissatisfaction when absent. Mapping features to these categories prevents you from over-investing in basics while neglecting potential differentiators.\n\nMoSCoW (Must Have, Should Have, Could Have, Won't Have) is great for release planning when you have a fixed deadline. It forces explicit conversations about what's truly essential versus what would be nice to have.\n\nThe most important meta-point: no framework replaces strategy. Before you can prioritize, you need to agree on what you're trying to achieve. Without clear, measurable goals, prioritization frameworks just give you a sophisticated way to argue about the wrong things.`,
      category: 'Business',
      imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
      tags: ['Product Management', 'Prioritization', 'Strategy'],
    },
    {
      title: 'Writing Cold Emails That Actually Get Replies',
      excerpt:
        'The anatomy of high-performing cold emails, with real examples and the psychological principles behind why they work.',
      content: `Cold email is one of the highest-leverage skills in business, yet most cold emails are deleted without being read. The good news is that with the right approach, reply rates of 15-30% are achievable.\n\nPersonalization beats templates every time. Generic "I love what your company is doing" openers are immediately recognized as mass emails. Genuine personalization — referencing a specific blog post they wrote, a hiring announcement you saw, or a challenge specific to their industry — shows you did your homework and earns attention.\n\nGet to the point in the first sentence. Respect the recipient's time by leading with why you're reaching out. "I'm writing to introduce myself as someone who..." is throat-clearing. "I noticed you're hiring three backend engineers — I help engineering leaders at Series A startups..." is a reason to keep reading.\n\nMake the ask tiny. A cold email asking for a 30-minute call is a big ask from a stranger. Ask for something small and low-friction first — a yes/no question, feedback on a specific thing, or permission to send more information. You can always escalate to a call once you have their attention.\n\nFollow up fearlessly. Most replies come from follow-up emails, not the original. A polite follow-up that adds value rather than just bumping the thread doubles your chances. Three to four touches over two to three weeks is a common best practice before moving on.`,
      category: 'Business',
      imageUrl: 'https://images.unsplash.com/photo-1516387938699-a93567ec168e?w=800',
      tags: ['Sales', 'Email Marketing', 'Growth', 'Outreach'],
    },
    {
      title: "Understanding Venture Capital: A Founder's Primer",
      excerpt:
        'Term sheets, cap tables, liquidation preferences, and everything you need to know before taking VC money.',
      content: `Taking venture capital is one of the most consequential decisions a founder can make. Understanding the mechanics before you're in a negotiation is critical.\n\nVenture capital is a specific type of financing designed for high-growth businesses. VCs raise money from limited partners (university endowments, pension funds, family offices) and invest it in startups in exchange for equity. They need some companies to return the entire fund to generate good returns for their LPs, so they're specifically looking for businesses that could be worth hundreds of millions or billions.\n\nThe term sheet will include a pre-money valuation, which determines what percentage of the company the investor gets. If your company is valued at $8M pre-money and an investor puts in $2M, the post-money valuation is $10M and the investor owns 20%. Dilution from this and future rounds is something founders often underestimate.\n\nLiquidation preferences protect investors in downside scenarios. A 1x non-participating preferred means investors get their money back first in a sale, and then everyone participates in the remaining proceeds proportionally. Participating preferred (sometimes called "double-dip") means investors get their money back first AND participate in the remaining proceeds as if they converted to common. Participating preferred is much worse for founders and employees.\n\nBoard control is as important as valuation. As you take more rounds of funding, investors will want board seats. Think carefully about who is making decisions for the company as you dilute your control.`,
      category: 'Business',
      imageUrl: 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=800',
      tags: ['Venture Capital', 'Startup', 'Fundraising', 'Finance'],
    },
    {
      title: 'Building Company Culture Remotely',
      excerpt:
        'How distributed-first companies build strong cultures without a physical office — practical frameworks and real examples.',
      content: `Company culture exists whether you design it or not. In distributed teams, culture forms through the written word, asynchronous communication norms, and how leaders behave when under pressure. Here's how to be intentional about it.\n\nDocument everything and make documents the source of truth. Writing things down forces clarity and allows team members in different time zones to participate. A strong writing culture is the foundation of good remote culture. GitLab's employee handbook, famously available publicly, is a model for how thorough documentation creates alignment at scale.\n\nAsynchronous by default, synchronous by choice. Default to async communication so no one is blocked waiting for a response in another time zone. But some things — conflict resolution, complex strategy discussions, onboarding — are better handled synchronously. Choose the right tool for the job.\n\nRituals create connection. Virtual coffee chats, team all-hands with a personal question of the week, Slack channels for hobbies and interests, and celebration of wins — these rituals might feel forced at first but they create the casual connection that happens naturally in offices.\n\nHire for async communication skills. The ability to write clearly, document decisions, and ask unblocking questions without waiting for someone to be online is a genuine skill that's worth hiring for explicitly. Your remote team is only as strong as your weakest async communicator.\n\nOver-communicate. Information that seems obvious to leadership is often opaque to individual contributors. Share context about strategic decisions, company performance, and market developments more than feels necessary.`,
      category: 'Business',
      imageUrl: 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=800',
      tags: ['Remote Work', 'Culture', 'Leadership', 'Management'],
    },
    {
      title: "SEO in 2025: What Still Works and What's Dead",
      excerpt:
        "Google's AI-driven search results have changed the game. Here's how to adapt your SEO strategy for the era of Search Generative Experience.",
      content: `SEO has never been more uncertain, but that doesn't mean it's dead. The landscape has shifted and the strategies that worked in 2020 are less effective today, but there are clear principles that continue to drive organic traffic.\n\nTopic authority beats keyword targeting. Google increasingly rewards sites that demonstrate comprehensive expertise in a subject area rather than individual pages optimized for specific keywords. Building interconnected content hubs that cover a topic thoroughly signals expertise and earns rankings.\n\nE-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) has become more important as Google tries to combat AI-generated content. Author bylines with credentials, first-person experience in content, citation of primary sources, and clear contact information all contribute to E-E-A-T signals.\n\nSearch Generative Experience (SGE) means Google may answer some queries directly in the search results, reducing clicks. This is most pronounced for informational queries. For transactional and commercial queries, organic results are still critical. Adapting your content strategy to focus on the queries where users still click through is increasingly important.\n\nPage experience signals — Core Web Vitals, mobile-friendliness, HTTPS — have been table stakes for years but are still worth maintaining. A slow, poorly designed site with great content will lose to a fast, well-designed site with similar content.\n\nBuilding an email list and owned audience remains the best hedge against algorithm changes. SEO should be one channel, not the only channel.`,
      category: 'Business',
      imageUrl: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800',
      tags: ['SEO', 'Digital Marketing', 'Content', 'Growth'],
    },
    {
      title: 'The Art of the Technical Job Interview',
      excerpt:
        'How to prepare for and perform well in technical interviews — from coding challenges to system design and behavioral questions.',
      content: `Technical interviews are a skill unto themselves. Even exceptional engineers often fail interviews at companies they'd excel at, because interviewing is a game with specific rules that must be learned.\n\nFor coding interviews, the FAANG-style LeetCode gauntlet is the dominant format. The honest advice is to grind LeetCode, focusing on medium-difficulty problems. You don't need to solve every problem — you need to recognize the patterns. Arrays and hashing, two pointers, sliding window, trees, graphs, dynamic programming: these patterns repeat endlessly.\n\nCommunication during coding challenges separates good candidates from great ones. Narrate your thought process, ask clarifying questions, discuss trade-offs before coding, and talk through edge cases. An interviewer who can follow your thinking can give credit even when your solution isn't perfect.\n\nSystem design interviews test your ability to design large-scale distributed systems. Practice designing systems like URL shorteners, Twitter, YouTube, and ride-sharing apps. The framework is always similar: clarify requirements, estimate scale, define the API, design the database schema, design the high-level system, then dive into specific components.\n\nBehavioral interviews are often the deciding factor between technically similar candidates. Use the STAR format (Situation, Task, Action, Result) and prepare five to six detailed stories from your experience. These stories should cover handling conflict, failing and recovering, demonstrating leadership, and dealing with ambiguity.`,
      category: 'Business',
      imageUrl: 'https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?w=800',
      tags: ['Career', 'Interview', 'Hiring', 'Software Engineering'],
    },
    {
      title: 'Negotiating Your Tech Salary: A Data-Driven Guide',
      excerpt:
        'How to research market rates, time your negotiations, and use competing offers ethically to maximize your compensation.',
      content: `Salary negotiation is one of the highest-ROI skills you can develop, yet most people leave significant money on the table by not negotiating or negotiating poorly.\n\nResearch is the foundation. Before any negotiation, know your market value. Levels.fyi for big tech, Glassdoor, LinkedIn Salary, and conversations with people in similar roles are your best sources. Know the total compensation, not just base salary — equity, bonus, benefits, and remote work flexibility all have financial value.\n\nNever give the first number if you can avoid it. When asked for your salary expectations, try to deflect by asking what the budget for the role is. If you must give a number, anchor high — you can always come down but can rarely go up.\n\nCompeting offers are your best leverage. If you're genuinely interviewing elsewhere, having a competing offer transforms negotiation from a favor to a business decision. Companies have budget for candidates they want. A competing offer gives them a clear number to beat.\n\nNegotiate the whole package. If they can't move on base salary, ask for a signing bonus, additional equity, an accelerated first review cycle, or additional vacation. These are often easier to approve than base salary changes.\n\nGet everything in writing. The verbal offer is the beginning, not the end. Confirm the full details of the offer in writing before accepting, and review the equity documents carefully — vesting schedules, cliff periods, and exercise windows can significantly affect the value of your compensation.`,
      category: 'Business',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
      tags: ['Career', 'Salary', 'Negotiation', 'Finance'],
    },
    {
      title: 'How Great Engineering Teams Write RFCs',
      excerpt:
        "Request for Comments documents reduce argument and improve decisions. Here's the format, process, and culture that make them work.",
      content: `RFC (Request for Comments) is a process for making important technical decisions collaboratively and with clear reasoning documented for future reference. It's one of the highest-leverage engineering practices, yet many teams skip it.\n\nAn RFC is a document that proposes a significant change and solicits feedback before a decision is made. It's not the same as a design doc that documents a decision already made — an RFC is part of the decision-making process.\n\nA good RFC structure includes: a summary of the problem being solved, the proposed solution, alternative solutions considered, trade-offs explicitly called out, open questions, and a section for reviewers to comment on specific aspects.\n\nThe RFC process reduces the domination of decisions by whoever is most senior or loudest. It forces the proposer to think through objections before they're raised. It creates a searchable record of why decisions were made, which is invaluable when a decision is revisited years later. And it gives quieter team members a way to contribute to decisions asynchronously.\n\nCommon failure modes include using RFCs for decisions that are too small (creating process overhead without benefit), and writing RFCs as rubber stamps for decisions already made (defeating the collaborative purpose). Save RFCs for decisions that are hard to reverse, affect multiple teams, or involve significant architectural choices.\n\nCulture matters as much as format. For RFCs to work, leadership must genuinely be willing to change direction based on RFC feedback and must engage with RFCs themselves rather than just expecting ICs to write them.`,
      category: 'Business',
      imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800',
      tags: ['Engineering', 'Process', 'Leadership', 'Decision Making'],
    },
    {
      title: "Building in Public: A Founder's Honest Assessment",
      excerpt:
        'The benefits and costs of building your startup publicly — who it works for, common mistakes, and how to do it effectively.',
      content: `"Build in public" has become a popular strategy for indie hackers and early-stage founders. Sharing your revenue, setbacks, and learnings on Twitter/X or Substack can build an audience, create accountability, and attract customers. But it's not for everyone.\n\nThe benefits are real. Transparency builds trust with potential customers in a way that polished marketing cannot. Your journey content can attract an audience who becomes your first user base. The public commitment creates accountability that many founders find motivating. And the feedback you get from sharing your thinking publicly can be invaluable.\n\nThe costs are also real. Competitors can see exactly what you're building and what's working. Employees and future investors may be uncomfortable with financial transparency. The time spent creating content is time not spent building. And it can be emotionally taxing to share failures publicly.\n\nThe people building in public most effectively tend to be solo founders or very small teams in B2C or developer tools markets where the audience they're building on social platforms overlaps with their target customers. A B2B enterprise software company selling to large corporations gets much less benefit.\n\nIf you do build in public, share the specifics. Vanity metrics are boring. Actual MRR numbers, churn rates, CAC/LTV ratios, and screenshots of conversations with customers are what people find valuable and what builds credibility. Lessons from failures are more valuable than celebrations of success.`,
      category: 'Business',
      imageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800',
      tags: ['Startup', 'Entrepreneurship', 'Marketing', 'Community'],
    },

    // ── Design (8) ────────────────────────────────────────────────────────────
    {
      title: 'The Psychology of Color in UI Design',
      excerpt:
        'How colors trigger emotional responses, influence decisions, and how to choose a palette that works for your product.',
      content: `Color is one of the most powerful tools in a designer's kit, but it's often applied intuitively rather than strategically. Understanding the psychological principles behind color choices can elevate your work significantly.\n\nColor associations are partly universal and partly cultural. Blue is widely associated with trust and stability across cultures, which is why it dominates finance and healthcare products. Red creates urgency and draws the eye, which is why it's used for notifications and CTAs. Green signals safety and go. But these associations are generalizations — context and contrast matter enormously.\n\nValue (lightness and darkness) matters more than hue for accessibility and hierarchy. A design with too many different hues but similar values will look flat and busy. Building your color system around value relationships first, then applying hue, produces cleaner results.\n\nThe 60-30-10 rule is a useful starting point: 60% of your UI uses a dominant neutral, 30% uses a secondary color, and 10% uses an accent color. This creates visual harmony while allowing accent colors to stand out and guide attention.\n\nAlways check contrast ratios. WCAG AA requires 4.5:1 contrast for normal text and 3:1 for large text. Tools like Stark or the built-in accessibility checker in Figma make this easy. Designing for sufficient contrast also happens to produce cleaner, more professional designs.\n\nTest your color system across different contexts — light and dark backgrounds, different screen types, and with color vision deficiency simulation. Red-green color blindness affects about 8% of men and should influence how you use color to convey meaning.`,
      category: 'Design',
      imageUrl: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800',
      isFeatured: true,
      tags: ['UI Design', 'Color Theory', 'UX', 'Psychology'],
    },
    {
      title: 'Designing for Mobile First: More Than Just Responsive',
      excerpt:
        'Mobile-first design is a philosophy, not just a breakpoint strategy. This guide covers touch targets, thumb zones, and performance.',
      content: `Mobile-first has been the recommended approach to responsive design for over a decade, but many teams still treat it as "design for desktop then strip down for mobile." True mobile-first thinking starts from the constraints of mobile to create better experiences on all screen sizes.\n\nThumb zones should influence your layout. Most users hold their phones with one hand and interact with their thumb. The bottom of the screen is easy to reach; the top corners are hard. Primary actions and navigation should live in thumb-friendly zones. The iOS Human Interface Guidelines and Material Design both have detailed guidance on this.\n\nTouch targets need to be larger than you think. Apple recommends a minimum of 44x44 points. Smaller targets lead to missed taps and frustrated users. This is particularly important for links in dense text content and close-together list items.\n\nPerformance is part of mobile UX. Mobile users are often on cellular connections with higher latency and lower bandwidth than desktop. Images should be served at appropriate sizes, JavaScript should be minimal, and perceived performance (skeleton screens, optimistic updates) should be designed for.\n\nMobile forms need special attention. Each form field on mobile is friction. Reduce the number of required fields, use the appropriate keyboard type for each field (email keyboard for email fields, numeric keyboard for phone numbers), and avoid making users switch between the keyboard and a date picker for common inputs like birth dates.`,
      category: 'Design',
      imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
      tags: ['Mobile Design', 'UX', 'Responsive Design', 'UI'],
    },
    {
      title: 'Design Tokens: Building a Scalable Design System',
      excerpt:
        'Design tokens are the foundation of scalable, consistent design. Learn how to define, organize, and maintain them across platforms.',
      content: `Design tokens are named values that represent the atomic decisions of your design system. Colors, spacing, typography, shadows, border radii — these are all design tokens. The power of tokens is that you define a design decision once and reference it everywhere, making system-wide changes trivial.\n\nTokens are organized in a hierarchy. Primitive tokens are the raw values: --color-blue-500: #3b82f6. Semantic tokens reference primitives and assign meaning: --color-brand-primary: var(--color-blue-500). Component tokens reference semantic tokens for specific contexts: --button-background-color: var(--color-brand-primary). This hierarchy gives you both flexibility and consistency.\n\nTools like Figma Tokens, Tokens Studio, and Style Dictionary help you manage tokens and transform them into the format needed for each platform — CSS custom properties for web, Swift constants for iOS, XML resources for Android.\n\nDark mode is where the semantic layer pays off. Instead of creating a separate dark mode color system, you redefine your semantic tokens for dark contexts. --color-surface becomes light in light mode and dark in dark mode, and every component that uses --color-surface automatically inherits the theme without any changes.\n\nDocumentation is half the battle. The best token system fails if designers and developers don't know it exists or can't find the right token. Invest in documentation that shows not just the token values but when and why to use each token.`,
      category: 'Design',
      imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
      tags: ['Design Systems', 'Tokens', 'Figma', 'CSS'],
    },
    {
      title: "Typography That Works: A Developer's Guide",
      excerpt:
        'Font selection, type scales, line heights, and responsive typography — everything developers need to implement great typography.',
      content: `Typography accounts for the majority of most interfaces and yet it's often implemented without much thought. Getting typography right makes everything look more polished and professional.\n\nFont choice sets the tone before the user reads a word. Serif fonts feel traditional and authoritative. Sans-serif fonts feel modern and approachable. Monospace fonts are for code and technical content. Variable fonts can replace multiple font files and offer responsive typography along a continuous axis of weight, width, or other properties.\n\nA type scale creates harmony between text sizes. Rather than choosing arbitrary font sizes, use a modular scale with a consistent ratio — common ratios include 1.25 (major third) and 1.333 (perfect fourth). Tools like Typescale or Utopia generate these scales and can make them fluid between viewport sizes.\n\nLine height (leading) affects readability dramatically. Body text typically needs 1.4-1.7x line height. Display text can be tighter at 1.0-1.2x. Increasing line height improves readability for longer text passages but can make short text look floaty.\n\nMeasure (characters per line) is often overlooked. Research suggests 50-75 characters per line is optimal for readability. On wide screens, this often means your text container should be narrower than you'd expect — max-width: 65ch is a useful CSS rule for prose content.\n\nContrast and font weight work together. Light font weights need darker colors on light backgrounds to maintain the same contrast ratio as regular weight. Be especially careful with thin font weights on colored backgrounds.`,
      category: 'Design',
      imageUrl: 'https://images.unsplash.com/photo-1574717025058-2f8737d2e2b7?w=800',
      tags: ['Typography', 'UI Design', 'CSS', 'Web Design'],
    },
    {
      title: 'Micro-interactions: The Details That Delight',
      excerpt:
        'Micro-interactions are the tiny animations and feedback moments that make products feel alive. Learn how to design them well.',
      content: `Micro-interactions are the moments in your product that contain just one main task — a Like button animation, a form validation message, a loading indicator, a toggle switch. Dan Saffer's book on micro-interactions is the definitive reference, but here's the core of what you need to know.\n\nEvery micro-interaction has four parts: a trigger (what initiates it), rules (what happens), feedback (how the user knows what's happening), and loops and modes (what happens next time or in different states).\n\nThe trigger is the most important decision. Most triggers are user-initiated (clicking a button) but some are system-initiated (a notification appearing). System triggers interrupt users and should be used sparingly and only when they're genuinely important to the user.\n\nFeedback is the part users actually see. Animation is powerful feedback but needs to be calibrated to the action. Small, frequent actions should have subtle, fast feedback. Important, infrequent actions can have more pronounced animation. The animation should feel connected to the action — a send button animating upward like it's flying away is more satisfying than a generic fade.\n\nTiming is everything. 100ms feels instantaneous. 200-500ms is perceived as responsive. Above 1 second requires a loading indicator. Above 10 seconds requires a progress bar. These thresholds should inform how long your micro-interaction animations run.\n\nThe goal of micro-interactions is not to show off animation skills — it's to provide clear, satisfying feedback that helps users understand the state of the interface and feel confident in their actions.`,
      category: 'Design',
      imageUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800',
      tags: ['Micro-interactions', 'Animation', 'UX', 'UI Design'],
    },
    {
      title: 'Accessibility in Design: Beyond Compliance',
      excerpt:
        'True accessibility is about designing for the full spectrum of human experience, not checking compliance boxes.',
      content: `Accessibility is often treated as a legal requirement to be minimally met rather than a design philosophy to embrace. This framing is both morally impoverished and practically mistaken — accessible design is almost always better design for everyone.\n\nThe curb cut effect is the classic example: the sidewalk curb cuts originally mandated for wheelchair users turned out to be essential for parents with strollers, cyclists, delivery workers, and people with temporary injuries. Accessible design solves for the edge cases that reveal weaknesses in designs that fail for everyone in some context.\n\nBeyond the WCAG compliance checklist, there are four core principles: perceivable (information can be perceived by all users), operable (interface components are operable by all users), understandable (content and operation are understandable), and robust (content can be interpreted by assistive technologies).\n\nReduced motion is a commonly overlooked consideration. Some users experience motion sickness or seizures triggered by animation. The prefers-reduced-motion CSS media query lets you provide a less animated experience for users who've opted into this system preference.\n\nFocus management is critical for keyboard and switch access users. Every interactive element must be keyboard-focusable, the focus state must be clearly visible, and focus order must be logical. When modal dialogs or drawers open, focus should be trapped inside them and return to the trigger element when closed.\n\nInvolve disabled users in your testing. Compliance audits catch technical issues, but only testing with real users who use assistive technologies reveals the experience gaps that automated tools miss.`,
      category: 'Design',
      imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800',
      tags: ['Accessibility', 'Inclusive Design', 'UX', 'WCAG'],
    },
    {
      title: 'The UX of Onboarding: First Impressions That Retain Users',
      excerpt:
        'Why most onboarding fails, the patterns that work, and how to design for the pivotal moment when users first experience your product.',
      content: `Onboarding is the most important UX challenge most products face, yet it's often designed last, with the lowest investment. The first experience a user has with your product determines whether they become long-term users or churn within a week.\n\nThe job of onboarding is not to teach users how to use your product — it's to help them achieve their first success as quickly as possible. The mental model shift from "teaching the product" to "delivering early value" changes every decision.\n\nEmpty states are a massive onboarding opportunity that teams consistently waste. The first time a user sees your dashboard, inbox, or project list, it's empty. Most products show a dull grey box with generic text. A great empty state shows a sample of what success looks like, explains what the user needs to do to get there, and makes that first action obvious.\n\nProgress indicators reduce abandonment in multi-step flows. Knowing that you're on step 3 of 5 is much less anxiety-inducing than not knowing how much is left. But progress indicators backfire if the remaining steps are much longer than completed ones. Make your steps roughly equal in effort.\n\nDeferred sign-up is underutilized. Many products require sign-up before showing any value. Products that let users experience the core value proposition before requiring account creation have dramatically higher conversion rates from visitor to user.\n\nOnboarding is not a one-time event. Users who return after a week or a month may need re-onboarding to features they haven't used. Contextual in-app guidance triggered by user behavior is often more effective than front-loaded tutorials.`,
      category: 'Design',
      imageUrl: 'https://images.unsplash.com/photo-1587440871875-191322ee64b0?w=800',
      tags: ['UX', 'Onboarding', 'Product Design', 'Retention'],
    },
    {
      title: 'When and How to Use Data Visualization',
      excerpt:
        'Choosing the right chart type, avoiding chart junk, and designing dashboards that drive decisions rather than just display data.',
      content: `Data visualization is about communication, not decoration. The goal is to help someone understand something about data more quickly and accurately than they could by reading raw numbers. When a chart doesn't accomplish this, it shouldn't exist.\n\nChoose your chart type based on the relationship you're trying to show. Bar charts for comparing values across categories. Line charts for change over time. Scatter plots for correlation between two variables. Pie charts only for showing parts of a whole when you have few categories (use sparingly). Maps for geographic data. Histograms for distribution.\n\nCharts fail in predictable ways. Adding too much data to a single chart — too many lines on a line chart, too many bars in a bar chart — makes every individual element harder to read. Adding unnecessary visual elements like 3D effects, gridlines, and decorative backgrounds is "chart junk" that Edward Tufte identified as reducing the signal-to-noise ratio.\n\nColor in charts should encode information, not just look nice. Using the same color for all bars in a comparison chart is often cleaner than rainbow colors because it directs attention to the data labels and values rather than the colors. Use color to highlight the data point you want the reader to focus on.\n\nDashboards need hierarchy. Not all metrics are equally important. A dashboard with 20 equally weighted numbers forces users to decide what matters. Use size, position, and visual weight to direct attention to the metrics that actually drive decisions.`,
      category: 'Design',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
      tags: ['Data Visualization', 'Dashboard Design', 'UX', 'Charts'],
    },

    // ── Career & Personal Development (7) ────────────────────────────────────
    {
      title: 'From Junior to Senior Developer: The Real Differences',
      excerpt:
        "It's not about knowing more syntax. Here's what actually separates senior engineers from junior ones.",
      content: `The transition from junior to senior developer is one of the most significant in a software engineering career, yet it's poorly understood. Many developers mistakenly believe seniority is primarily about knowing more technologies or writing more elegant code. The real differences are more subtle.\n\nSenior engineers solve the right problem. Junior engineers solve the problem as stated. Senior engineers question the problem, understand the underlying goal, and sometimes discover that the best solution is to not build the thing being asked for. This requires deep curiosity and psychological safety to push back.\n\nSenior engineers manage complexity. As codebases and teams scale, the main constraint shifts from "can we build this?" to "can we maintain this?" Seniors make decisions that keep the system comprehensible — appropriate abstractions, clear boundaries, consistent patterns. This often means resisting the urge to use clever techniques in favor of boring, predictable ones.\n\nSenior engineers multiply the team. The leverage of a senior engineer comes not just from their own output but from how they make everyone around them more effective. Thorough code reviews that teach principles, good architectural decisions that make future features easier to add, and clear documentation that reduces interruptions for questions.\n\nSenior engineers communicate in business terms. They can explain technical decisions in terms of risk, cost, and impact rather than implementation details. They can translate business requirements into technical plans and technical constraints into business considerations.`,
      category: 'Career',
      imageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800',
      isFeatured: true,
      tags: ['Career', 'Software Engineering', 'Leadership', 'Growth'],
    },
    {
      title: 'How to Build a Personal Brand as a Developer',
      excerpt:
        'Writing, speaking, open source contributions — the channels that matter and how to invest your limited time most effectively.',
      content: `A personal brand sounds like something only influencers need, but for developers it's a powerful career accelerator. A strong personal brand means opportunities find you — job offers, conference invitations, consulting inquiries — rather than you hunting for them.\n\nThe foundation is a specific point of view. Generic content ("here's how to use React hooks") competes with thousands of tutorials. Content that reflects your specific perspective, experiences, and hard-won insights stands out. What do you know that most developers don't? What opinions do you hold that are contrarian to conventional wisdom?\n\nWriting is the highest-leverage channel for most developers. A good blog post can continue attracting readers and building credibility for years. Focus on depth over breadth — one thorough, opinionated post gets more attention than five shallow ones. Write about your actual work, real problems you've solved, and genuine mistakes you've made.\n\nOpen source contributions build credibility within specific communities. Contributing meaningfully to widely used projects — not just fixing typos, but thoughtful bug fixes and features — puts your name in front of the people who use those projects.\n\nSpeaking at meetups and conferences is uncomfortable but enormously effective for building reputation within a local or specific community. Local meetups are low-stakes entry points for developing this skill. A recorded conference talk has long-term value as evergreen content.\n\nConsistency beats virality. A developer who publishes something thoughtful once a month for two years has more compounding credibility than someone who went viral once and disappeared.`,
      category: 'Career',
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
      tags: ['Personal Brand', 'Career', 'Developer', 'Writing'],
    },
    {
      title: 'How I Learn New Technologies Efficiently',
      excerpt:
        'A practical system for learning programming languages, frameworks, and tools without getting overwhelmed or forgetting everything.',
      content: `Every developer needs to continuously learn new technologies. The way you learn matters enormously — some approaches build durable knowledge while others create the illusion of learning without real retention.\n\nThe fundamental principle is active over passive learning. Reading documentation and watching tutorials creates familiarity but not competence. Building something real with the technology is what creates competence. The best use of tutorials is as scaffolding to get you to the point where you can build something real, not as the learning itself.\n\nChoose learning projects carefully. A todo app teaches the basics but not the hard parts of any framework. Choose a project that exercises the features you actually care about. If you're learning a new database, build something that requires complex queries. If you're learning a mobile framework, build something that uses native device features.\n\nSpaced repetition works for conceptual knowledge. Tools like Anki help you retain the concepts, terminology, and patterns of a new technology by scheduling reviews at the optimal interval for memory retention. This is particularly useful for learning new programming languages where syntax memorization matters.\n\nTeach what you learn. Writing a blog post, giving a talk, or just explaining a new concept to a colleague forces you to identify gaps in your understanding. The generation effect — the cognitive phenomenon where generating information during study improves retention — is one of the best-validated findings in cognitive psychology.\n\nAccept the J-curve of learning. Productivity drops when you switch to a new technology before it recovers and eventually exceeds your previous productivity. Knowing this curve exists helps you persist through the uncomfortable dip.`,
      category: 'Career',
      imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
      tags: ['Learning', 'Developer Skills', 'Productivity', 'Career'],
    },
    {
      title: "Freelancing as a Developer: The Complete Guide",
      excerpt:
        "Finding clients, pricing projects, managing scope creep, and building a sustainable freelance business — everything they don't teach you.",
      content: `Freelancing offers flexibility and income potential that employment rarely matches, but most developers who try it struggle with the non-technical aspects: finding clients, setting prices, and managing client relationships.\n\nYour first clients almost always come from your existing network. Friends, former colleagues, and acquaintances who know your work are much more likely to hire you than strangers responding to cold outreach. Start there, do excellent work, and ask for referrals. The referral network grows from there.\n\nPricing by the project is almost always better than hourly billing. Hourly billing penalizes efficiency — the faster you work, the less you earn. Project-based pricing rewards expertise and efficiency. It also aligns incentives: you're motivated to finish, the client knows their cost upfront.\n\nScope creep is the silent killer of project profitability. The solution is a very clear written scope document before any work begins, and a change order process for scope additions. "That wasn't in the original scope, here's what it'll cost to add it" is a conversation every freelancer needs to be comfortable having.\n\nA simple contract protects both parties. At minimum, your contract should specify the scope, payment terms (upfront deposit is standard), intellectual property ownership, and revision limits. A lawyer can draft a template for a few hundred dollars that you can reuse on every project.\n\nManaging cash flow is the unglamorous reality of freelancing. Projects end, gaps between contracts happen, and clients pay late. Having 3-6 months of expenses in reserve is the difference between enjoying the flexibility of freelancing and being constantly stressed about money.`,
      category: 'Career',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
      tags: ['Freelancing', 'Career', 'Business', 'Independent'],
    },
    {
      title: "The Developer's Guide to Deep Work",
      excerpt:
        "Cal Newport's Deep Work principles applied to software development — how to structure your day for maximum cognitively demanding output.",
      content: `Programming is cognitive work that requires sustained attention. A developer interrupted every 20 minutes cannot produce the quality of work they can with 90 uninterrupted minutes. Yet modern work environments are designed for constant interruption.\n\nDeep work, as Cal Newport defines it, is professional activity performed in a state of distraction-free concentration that pushes cognitive capabilities to the limit. It's the opposite of shallow work — tasks that can be performed while distracted, like answering emails or attending status meetings.\n\nScheduling deep work blocks protects them. Rather than working deeply when you happen to find a free moment, schedule 2-4 hour blocks in your calendar and treat them as unmissable appointments. Communicate these blocks to your team so they know when you're unavailable for non-urgent interruptions.\n\nRituals help you enter and exit deep work mode. Starting a deep work session with a consistent ritual — making coffee, clearing your desk, writing down the goal for the session — signals your brain that it's time to focus. Ending with a review of what was accomplished and what comes next enables you to truly shut off rather than the work bleeding into your evenings.\n\nBatch communication rather than handling it reactively. Checking Slack and email three times a day — morning, midday, and end of day — rather than constantly is compatible with most team cultures and dramatically reduces context switching.\n\nThe best deep work happens when the hardest problem you're working on is on your mind even when you're not at your computer. During walks, showers, and commutes, your default mode network works on the problem. This productive background processing only happens when you're working on sufficiently hard problems and not consuming content during every spare moment.`,
      category: 'Career',
      imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800',
      tags: ['Productivity', 'Deep Work', 'Developer Skills', 'Focus'],
    },

    // ── Health & Lifestyle (5) ────────────────────────────────────────────────
    {
      title: 'The Sedentary Developer Problem and What to Do About It',
      excerpt:
        'Sitting 8+ hours daily takes a serious toll on your body and mind. Evidence-based strategies to offset the damage.',
      content: `Software developers sit more than almost any other profession. The health consequences of prolonged sitting — independent of exercise — include increased risk of cardiovascular disease, metabolic syndrome, and musculoskeletal problems. The good news is that simple behavioral changes significantly offset these risks.\n\nMovement snacks throughout the day are as important as structured exercise. Setting a timer to stand and move for 2-3 minutes every 45-60 minutes breaks up prolonged sitting and improves blood flow to the brain. Even a brief walk to refill your water bottle counts.\n\nErect posture is more about environment than willpower. A monitor at eye level, keyboard at elbow height, and a chair that supports your lower back makes good posture the path of least resistance. Investing in ergonomic equipment is one of the highest-return health investments a developer can make.\n\nStrength training is particularly beneficial for desk workers. Building the posterior chain — glutes, hamstrings, lower back — offsets the weakening these muscles experience from prolonged sitting. Even two 45-minute sessions per week produces significant benefits.\n\nEye strain is an underappreciated issue. The 20-20-20 rule (every 20 minutes, look at something 20 feet away for 20 seconds) reduces eye strain. Additionally, most developers work in too-bright environments relative to their screen brightness. Matching ambient light to screen brightness reduces the contrast your eyes have to constantly adjust for.\n\nSleep is the most important recovery tool and the most commonly sacrificed. Most adults need 7-9 hours. The quality of your code and your ability to debug hard problems degrades measurably with sleep debt — this is well-documented in cognitive performance research.`,
      category: 'Health',
      imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
      tags: ['Health', 'Developer Wellness', 'Productivity', 'Ergonomics'],
    },
    {
      title: 'Mental Health in the Tech Industry: Breaking the Silence',
      excerpt:
        'Depression, anxiety, and burnout are disproportionately common in tech. Understanding why and what to do about it.',
      content: `The tech industry has a mental health crisis that is rarely spoken about publicly. High-pressure environments, imposter syndrome, always-on culture, and the blurring of work and identity create conditions where mental health struggles are common but stigmatized.\n\nBurnout is distinct from stress or tiredness. The WHO defines burnout as a syndrome resulting from chronic workplace stress that hasn't been successfully managed, characterized by feelings of energy depletion, increased mental distance from one's job, and reduced professional efficacy. Burnout is not resolved by a vacation — it requires structural changes to the work environment or a fundamental change of role.\n\nImposter syndrome is particularly prevalent in tech because the field is broad and deep, expertise is invisible from the outside, and there's always someone who knows more than you about something. Recognizing that the feeling of being a fraud despite evidence of competence is a near-universal experience — and talking about it openly — substantially reduces its power.\n\nCreating psychological safety on engineering teams has measurable effects on health outcomes. When people feel safe to admit mistakes, ask questions, and challenge decisions without fear of punishment, they experience less anxiety and are more likely to ask for help before problems become crises.\n\nIf you're struggling, therapy — specifically CBT and other evidence-based modalities — is effective for anxiety and depression. Many companies offer EAP (Employee Assistance Programs) with free therapy sessions. Online therapy platforms have reduced access barriers significantly.\n\nThe industry needs systemic change, not just individual coping strategies. Managers have a responsibility to model healthy boundaries, monitor team members for signs of burnout, and push back on unsustainable workloads.`,
      category: 'Health',
      imageUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800',
      tags: ['Mental Health', 'Burnout', 'Tech Industry', 'Wellness'],
    },

    // ── Education & Opinions (5) ──────────────────────────────────────────────
    {
      title: 'Should You Learn AI or Become AI-Augmented?',
      excerpt:
        "The debate about whether to learn AI deeply or learn to leverage AI tools effectively is a false dichotomy. Here's the nuanced view.",
      content: `Every developer is asking the same question: how much AI do I need to know? Do I need to understand transformers and fine-tuning, or is it enough to learn how to write good prompts and integrate APIs?\n\nThe answer depends on your career goals, and the framing of the question is wrong. "Learn AI" and "use AI tools" aren't alternatives — they're different levels of engagement with the same technology.\n\nAt the baseline level, every developer should learn to use AI-powered coding assistants effectively. Copilot, Cursor, and Claude in the IDE are productivity multipliers that are already standard at many companies. Not using these tools is like refusing to use an IDE in favor of a text editor.\n\nAt the next level, developers building software products should understand LLM APIs well enough to integrate AI features. This means understanding context windows, prompt engineering principles, RAG patterns, and the basics of evaluation. You don't need to train models to build powerful AI-augmented applications.\n\nAt the specialist level, ML engineers and AI researchers need deep understanding of model architecture, training dynamics, evaluation methodology, and the rapidly evolving research landscape. This is a demanding specialization that not everyone needs.\n\nThe risk of not engaging at all is real. AI is automating parts of software development faster than any previous productivity tool. Developers who learn to direct and leverage AI effectively will command greater leverage. Those who don't will face shrinking opportunities. The question is not if but how deeply to engage.`,
      category: 'Education',
      imageUrl: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800',
      isFeatured: true,
      tags: ['AI', 'Career', 'Education', 'Future of Work'],
    },
    {
      title: 'Why Every Developer Should Know SQL',
      excerpt:
        'Despite NoSQL, ORMs, and GraphQL, SQL remains one of the most valuable skills in software development. Here\'s why.',
      content: `Every year someone predicts the death of SQL, and every year SQL becomes more prevalent. Understanding why SQL endures is key to understanding what makes it so valuable.\n\nSQL is the universal language for data. Regardless of which database you're using, SQL (or SQL-like syntax) is how you interact with structured data. Pandas, Spark, BigQuery, Snowflake, PostgreSQL — they all speak SQL. Learning SQL gives you a tool that transfers across the entire data ecosystem.\n\nORMs are excellent but they're not a substitute. ORMs reduce boilerplate and increase type safety, but they generate SQL under the hood. When that SQL is wrong — when you're accidentally loading 10,000 rows to filter them in application code — you need to read the generated SQL to diagnose and fix the problem. An ORM user who doesn't understand SQL is flying blind.\n\nSQLite is underused and underappreciated. It's a zero-dependency, embeddable database that can replace complex data management code in local tools, scripts, and applications that don't need a network-accessible database. For these use cases it's dramatically simpler than running PostgreSQL or MySQL.\n\nAnalytic SQL (window functions, CTEs, lateral joins) is a superpower for data analysis tasks that come up regularly in software development — not just in dedicated analyst roles. Being able to write a query that computes a 7-day rolling average or ranks users by activity within cohorts puts you head and shoulders above developers who can only write SELECT * queries.\n\nLearn SQL properly once, and you'll use it for the rest of your career.`,
      category: 'Education',
      imageUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800',
      tags: ['SQL', 'Database', 'Developer Skills', 'Data'],
    },
    {
      title: 'Principles Over Frameworks: Learning to Think Like an Engineer',
      excerpt:
        'Frameworks come and go. The engineers who thrive are those who understand the underlying principles and can apply them in any context.',
      content: `There's a pattern in how software developers fall into different career trajectories. Some developers become expert users of specific frameworks and tools — they're highly productive in their domain but struggle when the domain changes. Others develop a deep understanding of the underlying principles and can pick up new tools relatively quickly.\n\nThe second group has an enormous career advantage as the technology landscape shifts. A developer who deeply understands networking protocols can learn any HTTP framework. A developer who understands database fundamentals can work with any database. A developer who understands compiler theory can learn any language.\n\nThis doesn't mean frameworks aren't worth learning. Knowing your tools well is important for productivity. But the learning should be in service of understanding the underlying concepts, not as an end in itself.\n\nPractical strategies for learning principles: when you use a framework feature, ask why it works. Read the source code of tools you depend on. Occasionally implement something from scratch that you'd normally use a library for — not for production, but to understand the problem the library solves.\n\nThe first principles approach applies to architecture too. Rather than memorizing microservices vs monolith or SQL vs NoSQL as blanket recommendations, understand the trade-offs each represents — coupling, complexity, consistency, scalability — and you can reason from first principles about any architectural decision.\n\nThe engineers who are described as "10x" are rarely faster at typing code. They're faster at understanding problems, choosing appropriate solutions, and anticipating failure modes — all skills rooted in principled thinking rather than framework mastery.`,
      category: 'Education',
      imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800',
      tags: ['Engineering', 'Learning', 'First Principles', 'Career'],
    },
    {
      title: "The Best Programming Books You're Not Reading",
      excerpt:
        'Beyond SICP and Clean Code — a curated list of underrated books that will make you a significantly better developer.',
      content: `Everyone recommends the same programming books. Clean Code, The Pragmatic Programmer, SICP. These are classics for a reason, but they're so widely recommended that many developers have "read" them without deeply engaging, and others have heard of them so much they feel they've absorbed the content without reading at all.\n\nA Pattern Language by Christopher Alexander is technically an architecture book but has been profoundly influential in software design, particularly in the Gang of Four design patterns. Reading the original — about town planning and building architecture — gives you a richer understanding of what patterns are for and how to identify them in software.\n\nAn Introduction to Information Retrieval (free online, Stanford) covers the fundamentals of search engines, recommendation systems, and text processing. As search and semantic similarity become increasingly important in AI-augmented applications, these fundamentals are more relevant than ever.\n\nDatabase Internals by Alex Petrov goes deep on how databases actually work — storage engines, distributed systems, consensus algorithms. If you interact with databases (you do), understanding what's happening under the hood transforms how you think about data modeling and query optimization.\n\nThe Art of Unix Programming by Eric Raymond is old but explores design philosophy through the lens of Unix — composability, orthogonality, minimalism. These principles apply across all software systems.\n\nSmall is Beautiful: Economics as if People Mattered by E.F. Schumacher seems like an outlier on this list, but for developers who want to think clearly about the societal implications of the systems they build, its meditation on scale, appropriate technology, and human-centered design is quietly transformative.`,
      category: 'Education',
      imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800',
      tags: ['Books', 'Learning', 'Programming', 'Developer Resources'],
    },
    {
      title: 'Open Source Contribution: Getting Started the Right Way',
      excerpt:
        'How to make your first meaningful open source contribution without feeling lost, getting rejected, or wasting your time.',
      content: `Contributing to open source has enormous career and learning benefits — but most first-time contributors don't know where to start and have demoralizing early experiences that make them give up.\n\nStart with projects you already use. The motivation to read unfamiliar code is much higher when you care about the project and understand what it's supposed to do. Your use of the project also gives you context to identify bugs and missing features that are invisible to people who don't use it.\n\nStart small and earn trust incrementally. Your first contribution to a project should be something modest — a documentation fix, a test for an existing bug, a clear and reproducible bug report. Large first contributions from unknown contributors are often received skeptically because maintainers have no prior evidence of your code quality and communication style.\n\nRead the contributing guide and follow it. Every serious open source project has a CONTRIBUTING.md that explains how to set up the development environment, code style requirements, testing requirements, and the PR process. Ignoring this guide signals to maintainers that you didn't do your homework.\n\nBefore opening a PR, open an issue to discuss the change. For anything beyond the most trivial changes, it's worth asking whether a maintainer would accept the change before you invest time implementing it. Maintainers have vision for their project that isn't always reflected in open issues.\n\nBe patient and gracious with feedback. OSS maintainers are often volunteers with limited time. PRs can sit unreviewed for weeks. When feedback comes, it may be blunt. Responding professionally and incorporating feedback quickly demonstrates that you're a good collaborator and increases the likelihood of the PR being merged.`,
      category: 'Education',
      imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
      tags: ['Open Source', 'GitHub', 'Community', 'Career'],
    },
  ];

  console.log('📝 Creating blog posts...');
  const authors = [user1, user2, user3, user4, admin];
  for (const blogData of blogs) {
    const author = authors[Math.floor(Math.random() * authors.length)];
    const slug = await uniqueSlug(slugify(blogData.title)); // ✅ collision-safe slug
    await prisma.blog.create({
      data: {
        ...blogData,
        slug,
        authorId: author.id,
        publishedAt: new Date(
          Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000,
        ),
        isPublished: true,
      },
    });
  }
  console.log(`✅ Created ${blogs.length} blog posts`);

  console.log('\n🎉 Seed complete!');
  console.log('─'.repeat(45));
  console.log('👤 Admin:  jahid@planora.dev   / jahid@1234');
  console.log('👤 User 1: nilima@example.com  / User@1234');
  console.log('👤 User 2: raj@example.com     / User@1234');
  console.log('👤 User 3: smith@example.com   / User@1234');
  console.log('👤 User 4: david@example.com   / User@1234');
  console.log('─'.repeat(45));
  console.log(`📅 Events:  ${events.length}`);
  console.log(`📝 Blogs:   ${blogs.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());