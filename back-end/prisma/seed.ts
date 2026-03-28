import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const FRENCH_CITIES = [
  "Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Montpellier", 
  "Strasbourg", "Bordeaux", "Lille", "Rennes", "Reims", "Toulon", 
  "Saint-Étienne", "Le Havre", "Dijon", "Grenoble", "Angers", "Villeurbanne", 
  "Nîmes", "Clermont-Ferrand", "Aix-en-Provence", "Le Mans", "Brest", "Tours", 
  "Amiens", "Limoges", "Annecy", "Perpignan", "Metz", "Besançon", "Orléans", 
  "Rouen", "Mulhouse", "Caen", "Nancy"
];

async function main() {
  // 1. Ensure Country exists
  const country = await prisma.country.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "France",
      code: "FR",
      isActive: true,
    },
  });
  console.log("✅ Seed: Country France ensure.");

  // 2. Add Cities
  for (const cityName of FRENCH_CITIES) {
    const slug = cityName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    await prisma.city.upsert({
      where: { slug },
      update: {},
      create: {
        name: cityName,
        slug,
        countryId: country.id,
        isPopular: true,
      },
    });
  }
  console.log(`✅ Seed: ${FRENCH_CITIES.length} cities ensemble.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
