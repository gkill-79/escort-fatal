import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // Geographic Bounding Box
    const minLat = searchParams.get("minLat");
    const maxLat = searchParams.get("maxLat");
    const minLon = searchParams.get("minLon");
    const maxLon = searchParams.get("maxLon");

    // Profile Filters
    const minAge = searchParams.get("minAge");
    const maxAge = searchParams.get("maxAge");
    const maxPrice = searchParams.get("maxPrice");
    const gender = searchParams.get("gender");
    const isOnline = searchParams.get("isOnline") === "true";
    const servicesParam = searchParams.get("services"); // Comma separated

    // Pagination/Limit
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const where: any = {
      isActive: true,
      isApproved: true,
    };

    // 1. Geoloc Filter
    if (minLat && maxLat && minLon && maxLon) {
      where.city = {
        lat: { gte: parseFloat(minLat), lte: parseFloat(maxLat) },
        lon: { gte: parseFloat(minLon), lte: parseFloat(maxLon) }
      };
    }

    // 2. Exact Filters
    if (gender) {
      where.gender = gender as any;
    }
    if (isOnline) {
      where.isOnline = true;
    }

    // 3. Range Filters
    if (minAge || maxAge) {
      where.age = {};
      if (minAge) where.age.gte = parseInt(minAge, 10);
      if (maxAge) where.age.lte = parseInt(maxAge, 10);
    }

    if (maxPrice) {
      where.priceFrom = {
        lte: parseInt(maxPrice, 10)
      };
    }

    // 4. Services Filter
    if (servicesParam) {
      const servicesArray = servicesParam.split(",").map(s => s.trim());
      // L'escorte doit avoir au moins un des services demandés
      where.services = {
        some: {
          type: { in: servicesArray as any[] }
        }
      };
    }

    // Execute queries
    const profiles = await prisma.profile.findMany({
      where,
      include: {
        city: true,
        photos: {
          where: { isPrimary: true, isApproved: true },
          take: 1
        }
      },
      take: limit,
      orderBy: [
        { isTopGirl: "desc" },
        { boostScore: "desc" },
        { ratingAvg: "desc" }
      ]
    });

    // Post-processing: Apply Jittering to coordinates so city-grouped escorts don't overlap completely
    const offsetBase = 0.0075; // Approx 800 meters
    const dataWithJitter = profiles.map((profile: any) => {
      let pinLat = profile.city?.lat || null;
      let pinLon = profile.city?.lon || null;

      if (pinLat !== null && pinLon !== null) {
        // Pseudo-random deterministic jitter based on profile ID length and string to avoid dancing pins on refresh if not completely necessary, or just true random.
        // For standard UI, true random is fine as it spreads them across the map block.
        const rLat = (Math.random() - 0.5) * offsetBase;
        const rLon = (Math.random() - 0.5) * offsetBase;
        
        pinLat += rLat;
        pinLon += rLon;
      }

      return {
        id: profile.id,
        name: profile.name,
        slug: profile.slug,
        age: profile.age,
        priceFrom: profile.priceFrom,
        isOnline: profile.isOnline,
        isTopGirl: profile.isTopGirl,
        ratingAvg: profile.ratingAvg,
        city: profile.city?.name,
        pinLat,
        pinLon,
        photoUrl: profile.photos[0]?.url || "/images/placeholder.jpg",
      };
    });

    return NextResponse.json({
      count: dataWithJitter.length,
      data: dataWithJitter
    });

  } catch (error) {
    console.error("GET /api/search error", error);
    return NextResponse.json({ message: "Erreur lors de la recherche" }, { status: 500 });
  }
}
