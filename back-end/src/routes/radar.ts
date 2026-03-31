import express from "express";
import { meiliClient } from "../lib/meilisearch";

const router = express.Router();

router.get("/", async (req, res) => {
  const { minLat, maxLat, minLon, maxLon, gender, minAge, maxAge, maxPrice, services, isOnline } = req.query;

  try {
    const index = meiliClient.index("profiles");
    let filterArgs: string[] = [];

    // 1. Filtre Géographique (Bounding Box de la carte)
    if (minLat && maxLat && minLon && maxLon) {
      filterArgs.push(`_geoBoundingBox([${maxLat}, ${maxLon}], [${minLat}, ${minLon}])`);
    }

    // 2. Ajout des filtres métiers (provenant de SearchHome)
    if (gender) filterArgs.push(`gender = '${gender}'`);
    if (isOnline === "true") filterArgs.push(`isOnline = true`);
    
    if (minAge) filterArgs.push(`age >= ${parseInt(minAge as string)}`);
    if (maxAge) filterArgs.push(`age <= ${parseInt(maxAge as string)}`);
    if (maxPrice) filterArgs.push(`priceFrom <= ${parseInt(maxPrice as string)}`);

    // Services is an array or comma separated string
    if (services) {
      const servicesList = (services as string).split(",");
      // Meilisearch array IN syntax or multiple ORs.
      // Often requiring each service or ANY service? Let's say ANY for now.
      const serviceFilters = servicesList.map(s => `categories = '${s.trim()}'`);
      if (serviceFilters.length > 0) {
        filterArgs.push(`(${serviceFilters.join(" OR ")})`);
      }
    }

    // 3. Exécution de la requête Meilisearch
    const searchResults = await index.search("", {
      filter: filterArgs.length > 0 ? filterArgs.join(" AND ") : undefined,
      // On trie D'ABORD par le boost acheté (monétisation), ENSUITE par ordre décroissant de création
      // Ne peut pas trier par _geoPoint sans un point central, donc on retire le tri géospatial pour la Bounding Box,
      // ou bien on calcule le centre. On va juste trier par Boost.
      sort: ["boostScore:desc"],
      limit: 100, // On renvoie max 100 points pour ne pas saturer la carte 3D
    });

    res.json({
      data: searchResults.hits,
      count: searchResults.estimatedTotalHits || searchResults.hits.length
    });

  } catch (error) {
    console.error("Erreur Radar Meilisearch:", error);
    res.status(500).json({ error: "Erreur du moteur de recherche géospatial." });
  }
});

// GET /radar/search?lat=x&lng=y&radiusInMeters=50000&category=ESCORT&isOnline=true&maxPrice=300
router.get("/search", async (req, res) => {
  try {
    const { 
      lat, lng, radiusInMeters = 50000, 
      category, isOnline, maxPrice,
      ageMin, ageMax, hairColor, origin, isVerified
    } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: "Coordonnées GPS (lat, lng) requises pour le mode Radar." });
    }

    const index = meiliClient.index("profiles");
    let filterArray = [`_geoRadius(${lat}, ${lng}, ${radiusInMeters})`];
    filterArray.push(`status = 'APPROVED'`);

    if (category) {
      filterArray.push(`categories = '${category}'`);
    }
    if (isOnline === "true") {
      filterArray.push(`isOnline = true`);
    }
    if (maxPrice) {
      filterArray.push(`priceFrom <= ${parseInt(maxPrice as string)}`);
    }
    if (ageMin) {
      filterArray.push(`age >= ${parseInt(ageMin as string)}`);
    }
    if (ageMax) {
      filterArray.push(`age <= ${parseInt(ageMax as string)}`);
    }
    if (hairColor) {
      filterArray.push(`hairColor = '${hairColor}'`);
    }
    if (origin) {
      filterArray.push(`origin = '${origin}'`);
    }
    if (isVerified === "true") {
      filterArray.push(`isVerified = true`);
    }

    // Requête Meilisearch ultra-rapide
    const searchResults = await index.search("", {
      filter: filterArray.join(" AND "),
      // Tri du plus proche au plus éloigné par défaut sur le radar
      sort: [`_geoPoint(${lat}, ${lng}):asc`, "boostScore:desc"],
      limit: 100
    });

    res.json(searchResults.hits);
  } catch (error) {
    console.error("Erreur Search Radar:", error);
    res.status(500).json({ error: "Erreur lors de la recherche radar géo-spatiale." });
  }
});

export default router;
