// scripts/add-slugs.js
import prisma from '../src/utils/prisma.js';
import slugify from 'slugify';

const blogs = await prisma.blog.findMany({ where: { slug: null } });

for (const blog of blogs) {
  let slug = slugify(blog.title, { lower: true, strict: true });
  let unique = slug;
  let count = 1;
  while (await prisma.blog.findFirst({ where: { slug: unique, id: { not: blog.id } } })) {
    unique = `${slug}-${count++}`;
  }
  await prisma.blog.update({ where: { id: blog.id }, data: { slug: unique } });
  console.log(` ${blog.title} → ${unique}`);
}

console.log('Done!');
process.exit(0);