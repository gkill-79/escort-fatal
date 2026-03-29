import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createCryptoInvoice } from '@/lib/nowpayments';
import { PRODUCTS, ProductKey } from '@/lib/stripe'; // We can keep this for product configuration
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return new NextResponse("Non autorisé", { status: 401 });

    const body = await req.json();
    const { productKey } = body;

    if (!productKey) {
      return NextResponse.json({ error: 'Produit manquant.' }, { status: 400 });
    }

    const product = PRODUCTS[productKey as ProductKey];
    if (!product) {
      return NextResponse.json({ error: 'Produit invalide.' }, { status: 400 });
    }

    const priceUsd = product.amount / 100;
    const creditsAmount = product.credits || 0; // Some products (like Boosts) might not give explicit credits

    // 1. Créer une trace de la commande en base de données avec le statut PENDING
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        amount: priceUsd,
        credits: creditsAmount, // We can store how many credits this product represents
        status: 'PENDING',
      }
    });

    // 2. Générer la facture Crypto
    const description = `Achat de ${product.name}`;
    const invoice = await createCryptoInvoice(priceUsd, order.id, description);

    // 3. Renvoyer le lien de paiement au frontend
    return NextResponse.json({ url: invoice.invoice_url });

  } catch (error) {
    console.error('Erreur Checkout Crypto:', error);
    return NextResponse.json({ error: 'Erreur lors de la création du paiement crypto.' }, { status: 500 });
  }
}
