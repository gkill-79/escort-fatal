import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    if (!stripe) {
      return new NextResponse("Stripe n'est pas configuré", { status: 500 });
    }

    const body = await req.json();
    const { serviceId, escortId, price, title } = body;

    if (!serviceId || !price) {
      return new NextResponse("Données manquantes", { status: 400 });
    }

    // Créer la session Stripe
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Prestation: ${title}`,
              description: `Réservation avec l'escort ID: ${escortId}`,
            },
            unit_amount: Math.round(price * 100), // Stripe prend des centimes
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: session.user.id,
        escortId,
        serviceId,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/escorts/${escortId}`,
    });

    return NextResponse.json({ url: stripeSession.url });

  } catch (error) {
    console.error("[CHECKOUT_ERROR]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}
