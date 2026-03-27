/**
 * Seed: cities, departments, admin user
 * Run: npm run db:seed
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Exemple: créer un pays et des départements/villes si vide
  const count = await prisma.country.count();
  if (count === 0) {
    await prisma.country.create({
      data: {
        name: "France",
        code: "FR",
        isActive: true,
      },
    });
    console.log("✅ Seed: Country FR created.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
