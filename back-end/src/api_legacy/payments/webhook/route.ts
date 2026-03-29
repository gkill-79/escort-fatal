import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyIpnSignature } from '@/lib/nowpayments';

export async function POST(req: Request) {
  try {
    // 1. Récupérer la signature envoyée par NOWPayments
    const signature = req.headers.get('x-nowpayments-sig');
    const rawBody = await req.text(); // On doit vérifier le texte brut

    if (!signature || !verifyIpnSignature(signature, rawBody)) {
      return NextResponse.json({ error: 'Signature invalide.' }, { status: 403 });
    }

    const payload = JSON.parse(rawBody);

    // 2. Vérifier le statut du paiement
    // 'finished' signifie que l'argent est arrivé et confirmé sur la blockchain
    if (payload.payment_status === 'finished') {
      const orderId = payload.order_id;

      // 3. Récupérer la commande
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order || order.status === 'COMPLETED') {
        return NextResponse.json({ message: 'Commande déjà traitée ou introuvable.' });
      }

      // 4. Donner les crédits à l'utilisateur (Transaction ACID)
      await prisma.$transaction(async (tx) => {
        // Mettre à jour la commande
        await tx.order.update({
          where: { id: orderId },
          data: { status: 'COMPLETED', cryptoCurrency: payload.pay_currency }
        });

        // Ajouter les crédits au portefeuille virtuel, si la commande représente des crédits
        if (order.credits > 0) {
          await tx.user.update({
            where: { id: order.userId },
            data: { 
              credits: { increment: order.credits } // Utilisation de `credits` comme dans l'ancienne logique Stripe
            }
          });
        }
      });

      console.log(`✅ Succès: ${order.credits} crédits/produit validés pour l'ordre ${orderId} (User: ${order.userId})`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Erreur Webhook Crypto:', error);
    return NextResponse.json({ error: 'Erreur interne.' }, { status: 500 });
  }
}
