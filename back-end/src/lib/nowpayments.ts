import crypto from 'crypto';

const API_KEY = process.env.NOWPAYMENTS_API_KEY || '';
const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET || '';

// Fonction pour créer une facture crypto
export async function createCryptoInvoice(amountUsd: number, orderId: string, orderDescription: string) {
  const response = await fetch('https://api.nowpayments.io/v1/invoice', {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      price_amount: amountUsd,
      price_currency: 'usd', // On fixe le prix en USD, l'utilisateur paiera l'équivalent en crypto
      order_id: orderId,
      order_description: orderDescription,
      ipn_callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000'}/api_legacy/payments/webhook`,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/member/credits`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/member/credits`,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Erreur NOWPayments: ${JSON.stringify(error)}`);
  }

  return response.json(); // Retourne l'URL de paiement (invoice_url)
}

// Fonction pour vérifier la signature de sécurité du Webhook
export function verifyIpnSignature(signatureData: string, requestBody: string): boolean {
  if (!signatureData || !requestBody) return false;
  const hmac = crypto.createHmac('sha512', IPN_SECRET);
  hmac.update(requestBody);
  const calculatedSignature = hmac.digest('hex');
  
  return calculatedSignature === signatureData;
}
