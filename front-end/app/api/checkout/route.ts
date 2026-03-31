import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé, veuillez vous connecter" }, { status: 401 });
    }

    const body = await req.json();
    const { serviceId, escortId, price, title, packId, credits } = body;

    if (!price || (!escortId && !packId)) {
      return NextResponse.json({ error: "Données manquantes (prix et identifiant)" }, { status:400 });
    }

    // fallback simulation if Stripe is not configured
    if (!stripe) {
      console.warn("[CHECKOUT] Stripe not configured, simulating success.");
      const successUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/success`;
      return NextResponse.json({ url: successUrl, simulated: true });
    }

    const line_items = [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: packId ? `Pack de ${credits} Crédits` : `Prestation: ${title || 'Service'}`,
            description: packId 
              ? "Crédits à utiliser sur la plateforme Escorte Fatal" 
              : `Réservation avec l'escort ID: ${escortId}`,
          },
          unit_amount: Math.round(price * 100), 
        },
        quantity: 1,
      },
    ];

    // Créer la session Stripe
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      metadata: {
        userId: session.user.id,
        escortId: escortId || "",
        serviceId: serviceId || "",
        packId: packId || "",
        credits: credits?.toString() || "",
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: packId 
        ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/member/credits`
        : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/escorts/${escortId}`,
    });

    return NextResponse.json({ url: stripeSession.url });

  } catch (error: any) {
    console.error("[CHECKOUT_ERROR]", error);
    return NextResponse.json({ 
      error: "Erreur interne du serveur lors de la création de la session de paiement." 
    }, { status: 500 });
  }
}
