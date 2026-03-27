import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent, PRODUCTS } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type { ProductKey } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body      = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";

  let event;
  try {
    event = constructWebhookEvent(body, signature);
  } catch (err: any) {
    console.error("[stripe webhook] Invalid signature:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const { userId, profileId, product } = session.metadata as {
      userId: string; profileId: string; product: ProductKey;
    };

    const amountCents = session.amount_total ?? 0;
    const prod        = PRODUCTS[product];

    // Record payment
    await prisma.payment.create({
      data: {
        userId,
        stripeSessionId: session.id,
        amount:          amountCents,
        currency:        session.currency ?? "eur",
        product,
        status:          "COMPLETED",
      },
    }).catch(() => null);

    // Apply product effects
    const now = new Date();

    if (product === "CHAT_CREDITS_10" || product === "CHAT_CREDITS_50") {
      const credits = prod.credits ?? 0;
      await prisma.user.update({
        where: { id: userId },
        data:  { chatCredits: { increment: credits } },
      });

    } else if (profileId) {
      const duration = prod.duration ?? 30;
      const until    = new Date(now.getTime() + duration * 86400000);

      if (product.startsWith("BOOST")) {
        await prisma.profile.update({
          where: { id: profileId },
          data:  { boostScore: { increment: 100 }, boostUntil: until },
        });
      } else if (product.startsWith("TOP_GIRL")) {
        await prisma.profile.update({
          where: { id: profileId },
          data:  { isTopGirl: true, topGirlUntil: until },
        });
      } else if (product === "EXCLUSIVE_30D") {
        await prisma.profile.update({
          where: { id: profileId },
          data:  { isExclusive: true, exclusiveUntil: until },
        });
      }
    }

    console.log(`[stripe webhook] ✅ Payment processed: ${product} for user ${userId}`);
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as any;
    await prisma.payment.updateMany({
      where: { stripeSessionId: session.id },
      data:  { status: "FAILED" },
    }).catch(() => null);
  }

  return NextResponse.json({ received: true });
}
