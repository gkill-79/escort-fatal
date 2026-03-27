import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe, PRODUCTS, ProductKey } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (!stripe) {
      return NextResponse.json({ error: "La configuration Stripe est manquante sur le serveur." }, { status: 500 });
    }

    const { productKey }: { productKey: ProductKey } = await req.json();

    const productInfo = PRODUCTS[productKey];
    if (!productInfo) {
      return NextResponse.json({ error: "Produit invalide" }, { status: 400 });
    }

    // Role checks
    const isEscortProd = productKey.startsWith("BOOST") || productKey.startsWith("TOP_GIRL") || productKey.startsWith("EXCLUSIVE");
    if (isEscortProd && session.user.role !== "ESCORT") {
      return NextResponse.json({ error: "Ce produit est réservé aux Escortes." }, { status: 403 });
    }

    let profileId = "";
    if (session.user.role === "ESCORT") {
      const p = await prisma.profile.findUnique({ where: { userId: session.user.id } });
      if (p) profileId = p.id;
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // Create Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: productInfo.amount,
            product_data: {
              name: productInfo.name,
              description: `Achat sur Escorte Fatal - ${productInfo.name}`,
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${siteUrl}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/dashboard?payment=cancel`,
      metadata: {
        userId: session.user.id,
        profileId: profileId,
        product: productKey,
      },
    });

    if (!checkoutSession.url) {
      throw new Error("Erreur de création d'URL Stripe");
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error("Stripe Checkout Session Error:", error);
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}
