import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { verifyJwt } from "../../middleware/auth.middleware";

const prisma = new PrismaClient();
const router = Router();

// 1. Route pour générer le lien de vérification pour le front-end
router.post("/start", verifyJwt, async (req: any, res) => {
  try {
    const userId = req.user.id;
    
    // ICI : Appel à l'API IDCheck.io ou IDnow pour créer un "dossier"
    // Exemple : const kycSession = await IDnowProvider.createSession(userId);
    // Pour l'intégration, on simule l'URL retournée par l'API
    const fakeKycUrl = "https://prestataire-biometrie.com/session/" + userId;
    
    // On met à jour le profil de l'utilisateur (on utilise Profile car la demande concernait ce niveau)
    // On met aussi PENDING pour dire que la demande a démarrée !
    await prisma.profile.update({
      where: { userId },
      data: { kycStatus: "PENDING", kycReference: `session_${userId}` }
    });

    res.json({ url: fakeKycUrl });
  } catch (error) {
    console.error("KYC start error:", error);
    res.status(500).json({ error: "Erreur lors du démarrage du KYC" });
  }
});

// 2. Route WEBHOOK appelée automatiquement par IDCheck.io/IDnow une fois le selfie validé ou refusé
// NE JAMAIS PROTEGER CETTE ROUTE PAR VERIFYJWT CAR LE PRESTATAIRE L'APPELERA DE L'EXTERIEUR !
router.post("/webhook/idnow", async (req, res) => {
  try {
    // Sécurisation vitale : vérifier la signature du webhook du prestataire (HMAC ou IP de provenance)
    // if (!verifySignature(req.headers['x-idnow-signature'], req.body)) return res.status(403).send();
    
    const { kycReference, status, reason } = req.body; 

    if (status === "SUCCESS") {
      await prisma.profile.updateMany({
        where: { kycReference: kycReference },
        data: { 
          kycStatus: "APPROVED", 
          biometricVerified: true,
          kycUpdatedAt: new Date()
        }
      });
      console.log(`[KYC Webhook] Succès de la vérification biométrique pour ${kycReference}`);
      // Optionnel : Envoyer un mail de félicitation à l'escorte
    } else {
      await prisma.profile.updateMany({
        where: { kycReference: kycReference },
        data: { 
          kycStatus: "REJECTED",
          biometricVerified: false, 
          kycUpdatedAt: new Date()
        }
      });
      console.log(`[KYC Webhook] Échec de la vérification biométrique pour ${kycReference}. Raison: ${reason}`);
    }

    res.status(200).send("Webhook OK");
  } catch (error) {
    console.error("KYC webhook error:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
