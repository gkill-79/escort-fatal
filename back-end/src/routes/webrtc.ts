import express from "express";

const router = express.Router();

// GET /webrtc/ice-servers
router.get("/ice-servers", async (req, res) => {
  try {
    const apiKey = process.env.TURN_API_KEY;
    if (!apiKey) throw new Error("Missing TURN_API_KEY");

    // Exemple d'appel vers l'API Metered (ou Twilio) pour générer des identifiants temporaires
    // Replace with your actual Metered live URL
    const response = await fetch(`https://escorte-fatal.metered.live/api/v1/turn/credentials?apiKey=${apiKey}`);
    
    if (!response.ok) {
      throw new Error(`Metered API error: ${response.statusText}`);
    }

    const iceServers = await response.json();
    res.json(iceServers);

  } catch (error) {
    console.error("Erreur génération relais TURN:", error);
    // STUN publics gratuits de Google en secours
    res.json([
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:stun4.l.google.com:19302" },
    ]);
  }
});

export default router;
