import { PrismaClient, HealthStatus as PrismaHealth } from '@prisma/client';
import {
  generateDemoData,
  DEFAULT_DEMO_ANIMAL_COUNT,
  DEFAULT_DEMO_SEED,
  demoFarmerCountFor,
} from '@wam-mfugo/shared';

const prisma = new PrismaClient();

const toPrismaHealth = (health: string) =>
  health === 'Under Treatment' ? 'UNDER_TREATMENT' : health;

async function main() {
  const demo = generateDemoData({
    animalCount: DEFAULT_DEMO_ANIMAL_COUNT,
    farmerCount: demoFarmerCountFor(DEFAULT_DEMO_ANIMAL_COUNT),
    seed: DEFAULT_DEMO_SEED,
  });

  for (const farmer of demo.farmers) {
    await prisma.farmer.upsert({
      where: { code: farmer.code },
      update: {},
      create: {
        id: farmer.id,
        code: farmer.code,
        name: farmer.name,
        phone: farmer.phone,
        county: farmer.county,
        subCounty: farmer.subCounty,
      },
    });
  }
  console.log(`Seeded ${demo.farmers.length} farmers`);

  for (const animal of demo.animals) {
    await prisma.animal.upsert({
      where: { id: animal.id },
      update: {},
      create: {
        id: animal.id,
        name: animal.name,
        type: animal.type,
        ...(animal.breed ? { breed: animal.breed } : {}),
        health: toPrismaHealth(animal.health) as PrismaHealth,
        county: animal.county,
        owner: animal.owner,
        lat: animal.lat,
        lng: animal.lng,
        createdAt: animal.createdAt ? new Date(animal.createdAt) : new Date(),
        ...(animal.farmerId != null ? { farmerId: animal.farmerId } : {}),
      },
    });
  }
  console.log(`Seeded ${demo.animals.length} animals`);

  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'demo@wamfugo.ke';
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin User',
      phone: '+254700000000',
      role: 'admin',
      county: 'Nairobi',
      subCounty: 'Westlands',
      isActive: true,
      failedOtpAttempts: 0,
    },
  });
  console.log(`Seeded default admin: ${adminEmail}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
