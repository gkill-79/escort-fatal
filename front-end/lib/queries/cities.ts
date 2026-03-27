import { prisma } from "@/lib/prisma";

export async function getPopularCities(limit: number) {
  try {
    const list = await prisma.city.findMany({
      where: { isPopular: true },
      take: limit,
      orderBy: { profileCount: "desc" },
    });
    return list;
  } catch {
    return [];
  }
}
