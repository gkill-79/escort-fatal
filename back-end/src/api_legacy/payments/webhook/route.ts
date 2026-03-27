import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  if (!signature) {
    return new NextResponse("Signature manquante", { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body, 
      signature, 
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`[STRIPE_WEBHOOK_ERROR] ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    
    if (session.metadata?.userId && session.metadata?.credits) {
      try {
        await prisma.user.update({
          where: { id: session.metadata.userId },
          data: { 
            credits: { 
              increment: parseInt(session.metadata.credits) 
            } 
          }
        });

        // Create transaction record
        await prisma.transaction.create({
          data: {
            userId: session.metadata.userId,
            amount: session.amount_total / 100,
            credits: parseInt(session.metadata.credits),
            stripeId: session.id
          }
        });

        console.log(`[STRIPE_WEBHOOK] Credits added to user ${session.metadata.userId}`);
      } catch (prismaError) {
        console.error("[STRIPE_WEBHOOK_PRISMA_ERROR]", prismaError);
        return new NextResponse("Internal Server Error during DB update", { status: 500 });
      }
    }
  }

  return new NextResponse("OK", { status: 200 });
}
