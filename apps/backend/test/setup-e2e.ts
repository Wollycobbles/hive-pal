import { PrismaClient } from '@/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

// Increase timeout for e2e tests
jest.setTimeout(30000);

// Global setup before all tests
beforeAll(async () => {
  // Clean up pollen reference test data and any leftover users.
  await prisma.pollenReferenceRegion.deleteMany();
  await prisma.pollenReference.deleteMany();
  await prisma.user.deleteMany();
});

// Global teardown after all tests
afterAll(async () => {
  await prisma.$disconnect();
});
