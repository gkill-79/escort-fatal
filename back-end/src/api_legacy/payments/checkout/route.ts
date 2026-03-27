import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return new NextResponse("Non autorisé", { status: 401 });
    
    const { price, credits } = await req.json();
    if (!price || !credits) return new NextResponse("Données manquantes", { status: 400 });

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        { 
          price_data: { 
            currency: "eur", 
            product_data: { 
              name: `Pack ${credits} crédits`,
              description: "Crédits pour Escorte Fatal"
            }, 
            unit_amount: price * 100 
          }, 
          quantity: 1 
        }
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/member/credits`,
      metadata: { 
        userId: session.user.id, 
        credits: credits.toString() 
      },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error("[CHECKOUT_POST]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}
