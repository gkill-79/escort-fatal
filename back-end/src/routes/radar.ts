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

export default router;
