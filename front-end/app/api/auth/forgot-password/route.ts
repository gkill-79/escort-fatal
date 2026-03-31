import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Par sécurité, on renvoie toujours "OK" pour ne pas révéler si un email existe
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Création du token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // Expiration dans 1 heure

    // Sauvegarde du token dans la base de données
    await prisma.user.update({
      where: { email },
      data: {
        resetToken: resetToken,
        resetTokenExpiresAt: resetTokenExpiry,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

    // Envoi de l'email via Resend
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: "Escorte Fatal <onboarding@resend.dev>", // À remplacer par un domaine vérifié en prod
        to: email, // ATTENTION: En mode gratuit Resend, vous ne pouvez envoyer qu'à votre email vérifié
        subject: "Réinitialisation de votre mot de passe",
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #111; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px;">
            <h1 style="color: #e94560; font-size: 24px;">Réinitialisation de mot de passe</h1>
            <p>Bonjour ${user.username},</p>
            <p>Vous avez demandé la réinitialisation de votre mot de passe sur <strong>Escorte Fatal</strong>.</p>
            <p>Cliquez sur le bouton ci-dessous pour le modifier (ce lien est valable 1 heure) :</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; padding: 14px 28px; background-color: #e94560; color: white; font-weight: bold; text-decoration: none; border-radius: 8px;">Réinitialiser mon mot de passe</a>
            </div>
            <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
            <p style="font-size: 12px; color: #888; text-align: center;">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail. Votre mot de passe restera inchangé.</p>
          </div>
        `,
      });
    } else {
      console.log("\n==================== LIEN DE RÉINITIALISATION ====================");
      console.log("⚠️ CLE API RESEND MANQUANTE. Voici le lien manuel :");
      console.log(resetUrl);
      console.log("==================================================================\n");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[FORGOT_PASSWORD_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
