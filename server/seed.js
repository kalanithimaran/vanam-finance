require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function main() {
  console.log('Seeding database...');
  // Create a default household
  const pinHash = await bcrypt.hash('1234', 10);
  
  const household = await prisma.household.upsert({
    where: { phone: '9999999999' },
    update: {},
    create: {
      name: 'Vanam Farm',
      phone: '9999999999',
      pin_hash: pinHash,
    },
  });

  const defaultSources = [
    { key: 'crop', display_name_ta: 'விவசாயம்', color: '#4ade80', icon: 'leaf' },
    { key: 'sheep', display_name_ta: 'ஆடு', color: '#a3a3a3', icon: 'dribbble' }, // Using a generic icon for now
    { key: 'cow', display_name_ta: 'மாடு', color: '#facc15', icon: 'circle-dot' },
    { key: 'chicken', display_name_ta: 'நாட்டுக்கோழி', color: '#fb923c', icon: 'feather' },
    { key: 'shop', display_name_ta: 'முடிதிருத்தும் கடை', color: '#60a5fa', icon: 'scissors' },
    { key: 'household_expense', display_name_ta: 'வீட்டுச் செலவு', color: '#f87171', icon: 'home' },
    { key: 'other', display_name_ta: 'மற்றவை', color: '#94a3b8', icon: 'plus' },
  ];

  for (const source of defaultSources) {
    await prisma.incomeSource.create({
      data: {
        ...source,
        household_id: household.id,
      },
    });
  }

  const defaultInvestmentPlans = [
    { category_name_ta: 'சேமிப்பு', percentage: 30, color: '#3b82f6' },
    { category_name_ta: 'விவசாய முதலீடு', percentage: 50, color: '#22c55e' },
    { category_name_ta: 'அவசர நிதி', percentage: 20, color: '#ef4444' },
  ];

  for (const plan of defaultInvestmentPlans) {
    await prisma.investmentPlan.create({
      data: {
        ...plan,
        household_id: household.id,
      },
    });
  }

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
