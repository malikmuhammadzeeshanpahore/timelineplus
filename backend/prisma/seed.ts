import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@timelineplus.site';
  const adminPass = process.env.SEED_ADMIN_PASS || 'Admin123!';
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const hash = await bcrypt.hash(adminPass, 10);
    await prisma.user.create({ data: { email: adminEmail, password: hash, username: 'admin', isAdmin: true, emailVerified: true } });
    console.log('Admin user created', adminEmail);
  } else {
    console.log('Admin user exists');
  }

  // create sample tasks
  const t = await prisma.task.createMany({ data: [
    { title: 'Watch 10 minutes', description: 'Watch a YouTube video for 10 minutes', price: 100, quantity: 100, category: 'YouTube' },
    { title: 'Follow on Instagram', description: 'Follow the target Instagram account', price: 50, quantity: 200, category: 'Instagram' },
  ] });
  console.log('Sample tasks created');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());