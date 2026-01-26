const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@timelineplus.site';
  const adminPass = process.env.SEED_ADMIN_PASS || 'Admin123!';
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const hash = await bcrypt.hash(adminPass, 10);
    await prisma.user.create({ data: { email: adminEmail, password: hash, username: 'admin', isAdmin: true, emailVerified: true } });
    console.log('✅ Admin user created', adminEmail);
  } else {
    console.log('✅ Admin user exists');
  }

  // Generate admin access secret codes
  const adminAddCode = 'ADMIN_REGISTER_' + Math.random().toString(36).substring(2, 15).toUpperCase();
  const adminAccessCode = 'ADMIN_PANEL_' + Math.random().toString(36).substring(2, 15).toUpperCase();

  // Create secret codes for admin panel
  try {
    const existingAddCode = await prisma.adminSecret.findUnique({ where: { code: adminAddCode } });
    if (!existingAddCode) {
      await prisma.adminSecret.create({
        data: {
          code: adminAddCode,
          purpose: 'add_admin',
          isActive: true
        }
      });
    }
    
    const existingAccessCode = await prisma.adminSecret.findUnique({ where: { code: adminAccessCode } });
    if (!existingAccessCode) {
      await prisma.adminSecret.create({
        data: {
          code: adminAccessCode,
          purpose: 'access_panel',
          isActive: true
        }
      });
    }
  } catch (err) {
    console.log('Admin secrets might already exist:', err.message);
  }

  console.log('\n🔑 Admin Panel Access Codes:');
  console.log(`📝 Register new admin: /admin-panel/addadmin/${adminAddCode}`);
  console.log(`🔐 Access admin panel: /admin-panel?code=${adminAccessCode}`);

  // create sample tasks
  try {
    await prisma.task.create({ 
      data: { title: 'Watch 10 minutes', description: 'Watch a YouTube video for 10 minutes', price: 100, quantity: 100, category: 'YouTube' }
    });
    await prisma.task.create({ 
      data: { title: 'Follow on Instagram', description: 'Follow the target Instagram account', price: 50, quantity: 200, category: 'Instagram' }
    });
    console.log('✅ Sample tasks created');
  } catch (err) {
    console.log('Sample tasks might already exist:', err.message);
  }
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
