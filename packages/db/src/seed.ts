import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding RestOS database...');

  // ─── Plan ───
  const freePlan = await prisma.plan.upsert({
    where: { name: 'FREE' },
    update: {},
    create: { name: 'FREE', monthlyPrice: 0, maxBranches: 1, maxUsers: 3, features: { pos: true, billing: true, reports: false, integrations: false, crm: false } },
  });
  const starterPlan = await prisma.plan.upsert({
    where: { name: 'STARTER' },
    update: {},
    create: { name: 'STARTER', monthlyPrice: 999, maxBranches: 1, maxUsers: 10, features: { pos: true, billing: true, reports: true, integrations: false, crm: true } },
  });
  await prisma.plan.upsert({
    where: { name: 'PROFESSIONAL' },
    update: {},
    create: { name: 'PROFESSIONAL', monthlyPrice: 2499, maxBranches: 5, maxUsers: 50, features: { pos: true, billing: true, reports: true, integrations: true, crm: true, inventory: true } },
  });
  await prisma.plan.upsert({
    where: { name: 'ENTERPRISE' },
    update: {},
    create: { name: 'ENTERPRISE', monthlyPrice: 4999, maxBranches: 999, maxUsers: 999, features: { pos: true, billing: true, reports: true, integrations: true, crm: true, inventory: true, whiteLabel: true } },
  });

  // ─── Tenant ───
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo-restaurant' },
    update: {},
    create: { name: 'Demo Restaurant Group', slug: 'demo-restaurant', billingEmail: 'demo@restos.in', status: 'ACTIVE' },
  });

  await prisma.tenantSubscription.create({
    data: { tenantId: tenant.id, planId: starterPlan.id, status: 'ACTIVE', currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  });

  // ─── Restaurant ───
  const restaurant = await prisma.restaurant.upsert({
    where: { tenantId_slug: { tenantId: tenant.id, slug: 'spice-garden' } },
    update: {},
    create: {
      tenantId: tenant.id, name: 'Spice Garden', slug: 'spice-garden',
      address: '42, MI Road', city: 'Jaipur', state: 'Rajasthan', pincode: '302001',
      gstin: '08AABCU9603R1ZM', fssaiNo: '12345678901234',
      phone: '9876543210', email: 'hello@spicegarden.in',
      status: 'ACTIVE',
    },
  });

  await prisma.restaurantSettings.upsert({
    where: { restaurantId: restaurant.id },
    update: {},
    create: { restaurantId: restaurant.id },
  });

  // ─── Floors & Tables ───
  const floors = await Promise.all([
    prisma.floor.create({ data: { restaurantId: restaurant.id, name: 'Ground Floor', sortOrder: 1 } }),
    prisma.floor.create({ data: { restaurantId: restaurant.id, name: 'First Floor', sortOrder: 2 } }),
    prisma.floor.create({ data: { restaurantId: restaurant.id, name: 'Terrace', sortOrder: 3 } }),
  ]);

  const tableData = [
    // Ground Floor: 6 tables
    ...Array.from({ length: 6 }, (_, i) => ({ restaurantId: restaurant.id, floorId: floors[0].id, name: `G${i + 1}`, seats: i < 3 ? 2 : 4, posX: (i % 3) * 120, posY: Math.floor(i / 3) * 120 })),
    // First Floor: 5 tables
    ...Array.from({ length: 5 }, (_, i) => ({ restaurantId: restaurant.id, floorId: floors[1].id, name: `F${i + 1}`, seats: i < 2 ? 4 : 6, posX: (i % 3) * 120, posY: Math.floor(i / 3) * 120 })),
    // Terrace: 4 tables
    ...Array.from({ length: 4 }, (_, i) => ({ restaurantId: restaurant.id, floorId: floors[2].id, name: `T${i + 1}`, seats: i < 2 ? 4 : 8, shape: i >= 2 ? 'ROUND' : 'SQUARE', posX: (i % 2) * 150, posY: Math.floor(i / 2) * 150 })),
  ];
  await prisma.table.createMany({ data: tableData });

  // ─── Menu Categories ───
  const categories = await Promise.all([
    prisma.menuCategory.create({ data: { restaurantId: restaurant.id, name: 'Starters', icon: '🍢', sortOrder: 1 } }),
    prisma.menuCategory.create({ data: { restaurantId: restaurant.id, name: 'Main Course', icon: '🍛', sortOrder: 2 } }),
    prisma.menuCategory.create({ data: { restaurantId: restaurant.id, name: 'Breads', icon: '🫓', sortOrder: 3 } }),
    prisma.menuCategory.create({ data: { restaurantId: restaurant.id, name: 'Rice & Biryani', icon: '🍚', sortOrder: 4 } }),
    prisma.menuCategory.create({ data: { restaurantId: restaurant.id, name: 'Chinese', icon: '🥡', sortOrder: 5 } }),
    prisma.menuCategory.create({ data: { restaurantId: restaurant.id, name: 'Beverages', icon: '🥤', sortOrder: 6 } }),
    prisma.menuCategory.create({ data: { restaurantId: restaurant.id, name: 'Desserts', icon: '🍨', sortOrder: 7 } }),
  ]);

  // ─── Menu Items ───
  const menuItems = [
    // Starters
    { categoryId: categories[0].id, name: 'Paneer Tikka', price: 249, foodType: 'VEG', station: 'TANDOOR', preparationTime: 15, isPopular: true },
    { categoryId: categories[0].id, name: 'Chicken Tikka', price: 299, foodType: 'NONVEG', station: 'TANDOOR', preparationTime: 15, isPopular: true },
    { categoryId: categories[0].id, name: 'Veg Spring Roll', price: 179, foodType: 'VEG', station: 'HOT', preparationTime: 10 },
    { categoryId: categories[0].id, name: 'Fish Amritsari', price: 349, foodType: 'NONVEG', station: 'HOT', preparationTime: 12 },
    { categoryId: categories[0].id, name: 'Hara Bhara Kebab', price: 199, foodType: 'VEG', station: 'HOT', preparationTime: 12 },
    // Main Course
    { categoryId: categories[1].id, name: 'Dal Makhani', price: 229, foodType: 'VEG', station: 'HOT', preparationTime: 20, isPopular: true },
    { categoryId: categories[1].id, name: 'Paneer Butter Masala', price: 269, foodType: 'VEG', station: 'HOT', preparationTime: 18, isPopular: true },
    { categoryId: categories[1].id, name: 'Butter Chicken', price: 329, foodType: 'NONVEG', station: 'HOT', preparationTime: 20, isPopular: true },
    { categoryId: categories[1].id, name: 'Laal Maas', price: 399, foodType: 'NONVEG', station: 'HOT', preparationTime: 25 },
    { categoryId: categories[1].id, name: 'Kadhai Paneer', price: 249, foodType: 'VEG', station: 'HOT', preparationTime: 15 },
    { categoryId: categories[1].id, name: 'Malai Kofta', price: 259, foodType: 'VEG', station: 'HOT', preparationTime: 20 },
    // Breads
    { categoryId: categories[2].id, name: 'Butter Naan', price: 49, foodType: 'VEG', station: 'TANDOOR', preparationTime: 5 },
    { categoryId: categories[2].id, name: 'Garlic Naan', price: 59, foodType: 'VEG', station: 'TANDOOR', preparationTime: 5 },
    { categoryId: categories[2].id, name: 'Tandoori Roti', price: 35, foodType: 'VEG', station: 'TANDOOR', preparationTime: 5 },
    { categoryId: categories[2].id, name: 'Missi Roti', price: 45, foodType: 'VEG', station: 'TANDOOR', preparationTime: 5 },
    { categoryId: categories[2].id, name: 'Lachha Paratha', price: 55, foodType: 'VEG', station: 'TANDOOR', preparationTime: 7 },
    // Rice & Biryani
    { categoryId: categories[3].id, name: 'Jeera Rice', price: 149, foodType: 'VEG', station: 'HOT', preparationTime: 10 },
    { categoryId: categories[3].id, name: 'Veg Biryani', price: 249, foodType: 'VEG', station: 'HOT', preparationTime: 25 },
    { categoryId: categories[3].id, name: 'Chicken Biryani', price: 329, foodType: 'NONVEG', station: 'HOT', preparationTime: 25, isPopular: true },
    { categoryId: categories[3].id, name: 'Mutton Biryani', price: 399, foodType: 'NONVEG', station: 'HOT', preparationTime: 30 },
    // Chinese
    { categoryId: categories[4].id, name: 'Veg Fried Rice', price: 179, foodType: 'VEG', station: 'HOT', preparationTime: 12 },
    { categoryId: categories[4].id, name: 'Chilli Paneer', price: 229, foodType: 'VEG', station: 'HOT', preparationTime: 12 },
    { categoryId: categories[4].id, name: 'Chicken Manchurian', price: 269, foodType: 'NONVEG', station: 'HOT', preparationTime: 15 },
    { categoryId: categories[4].id, name: 'Hakka Noodles', price: 189, foodType: 'EGG', station: 'HOT', preparationTime: 12 },
    // Beverages
    { categoryId: categories[5].id, name: 'Masala Chai', price: 49, foodType: 'VEG', station: 'BAR', preparationTime: 5 },
    { categoryId: categories[5].id, name: 'Cold Coffee', price: 99, foodType: 'VEG', station: 'BAR', preparationTime: 5 },
    { categoryId: categories[5].id, name: 'Mango Lassi', price: 89, foodType: 'VEG', station: 'BAR', preparationTime: 5 },
    { categoryId: categories[5].id, name: 'Fresh Lime Soda', price: 69, foodType: 'VEG', station: 'BAR', preparationTime: 3 },
    { categoryId: categories[5].id, name: 'Buttermilk', price: 49, foodType: 'VEG', station: 'BAR', preparationTime: 3 },
    // Desserts
    { categoryId: categories[6].id, name: 'Gulab Jamun', price: 89, foodType: 'VEG', station: 'COLD', preparationTime: 5 },
    { categoryId: categories[6].id, name: 'Rasmalai', price: 109, foodType: 'VEG', station: 'COLD', preparationTime: 5 },
    { categoryId: categories[6].id, name: 'Brownie with Ice Cream', price: 149, foodType: 'EGG', station: 'COLD', preparationTime: 8 },
  ];

  await prisma.menuItem.createMany({
    data: menuItems.map(item => ({ restaurantId: restaurant.id, taxRate: 5, ...item })),
  });

  // ─── Staff ───
  await prisma.user.createMany({
    data: [
      { tenantId: tenant.id, restaurantId: restaurant.id, name: 'Rajesh Kumar', phone: '9876543210', email: 'rajesh@spicegarden.in', role: 'OWNER', pin: '1234' },
      { tenantId: tenant.id, restaurantId: restaurant.id, name: 'Amit Sharma', phone: '9876543211', role: 'MANAGER', pin: '2345' },
      { tenantId: tenant.id, restaurantId: restaurant.id, name: 'Suresh Yadav', phone: '9876543212', role: 'CAPTAIN', pin: '3456' },
    ],
  });

  // ─── Modifier Groups ───
  const spiceGroup = await prisma.menuModifierGroup.create({
    data: { restaurantId: restaurant.id, name: 'Spice Level', type: 'SINGLE', required: false, min: 0, max: 1 },
  });
  await prisma.menuModifier.createMany({
    data: [
      { groupId: spiceGroup.id, name: 'Mild', price: 0, isDefault: true },
      { groupId: spiceGroup.id, name: 'Medium', price: 0 },
      { groupId: spiceGroup.id, name: 'Spicy', price: 0 },
      { groupId: spiceGroup.id, name: 'Extra Spicy', price: 0 },
    ],
  });

  console.log('Seed completed successfully!');
  console.log(`  Tenant: ${tenant.name} (${tenant.slug})`);
  console.log(`  Restaurant: ${restaurant.name}`);
  console.log(`  Floors: ${floors.length}`);
  console.log(`  Tables: ${tableData.length}`);
  console.log(`  Menu Items: ${menuItems.length}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
