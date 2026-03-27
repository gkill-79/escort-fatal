import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Radius of Earth in kilometers
const R = 6371;

function getJitteredCoord(coord: number, jitterAmount = 0.005) {
  // Returns a coordinate offset by up to +/- jitterAmount degrees
  return coord + (Math.random() - 0.5) * 2 * jitterAmount;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const gender = searchParams.get("gender");
    const services = searchParams.getAll("services");
    // We could use lat/lng for bounding box limits, but for now we fetch all active and filter
    
    const whereClause: any = {
      isActive: true,
      isApproved: true,
      cityId: { not: null }
    };

    if (gender) {
      whereClause.gender = gender;
    }

    if (services.length > 0) {
      whereClause.services = {
        some: {
          type: { in: services }
        }
      };
    }

    const profilesRaw = await prisma.profile.findMany({
      where: whereClause,
      include: {
        city: true,
        photos: {
          where: { isPrimary: true },
          take: 1
        },
        services: {
          take: 3
        }
      },
      take: 200 // Max markers to prevent browser lag
    });

    const profiles = profilesRaw.map((p: any) => {
      // Create jittered coordinates so escorts in the same city don't overlap perfectly
      const lat = p.city?.lat ? getJitteredCoord(p.city.lat) : 48.8566;
      const lon = p.city?.lon ? getJitteredCoord(p.city.lon) : 2.3522;

      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        isTopGirl: p.isTopGirl,
        isOnline: p.isOnline,
        avatar: p.photos[0]?.url || null,
        priceFrom: p.priceFrom,
        services: p.services.map((s: any) => s.type),
        coordinates: [lat, lon],
        city: p.city?.name
      };
    });

    return NextResponse.json(profiles);
  } catch (error) {
    console.error("Radar API Error", error);
    return NextResponse.json({ error: "Erreur lors du chargement de la carte" }, { status: 500 });
  }
}
