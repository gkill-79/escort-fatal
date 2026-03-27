import Stripe from "stripe";

export const stripe =
  process.env.STRIPE_SECRET_KEY ?
    new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" })
  : null;

export type ProductKey =
  | "BOOST_7D"
  | "BOOST_30D"
  | "TOP_GIRL_7D"
  | "TOP_GIRL_30D"
  | "CHAT_CREDITS_10"
  | "CHAT_CREDITS_50"
  | "EXCLUSIVE_30D";

export const PRODUCTS: Record<
  ProductKey,
  { duration?: number; credits?: number; amount: number; name: string }
> = {
  BOOST_7D:         { duration: 7,  amount: 1490, name: "Boost Visibilité — 7 Jours" },      // 14.90€
  BOOST_30D:        { duration: 30, amount: 4990, name: "Boost Visibilité — 30 Jours" },     // 49.90€
  TOP_GIRL_7D:      { duration: 7,  amount: 2490, name: "Top Girl Badge — 7 Jours" },        // 24.90€
  TOP_GIRL_30D:     { duration: 30, amount: 8990, name: "Top Girl Badge — 30 Jours" },       // 89.90€
  EXCLUSIVE_30D:    { duration: 30, amount: 14990,name: "Statut Exclusif — 30 Jours" },      // 149.90€
  CHAT_CREDITS_10:  { credits: 10,  amount: 490,  name: "10 Crédits Temps-Réel" },           // 4.90€
  CHAT_CREDITS_50:  { credits: 50,  amount: 1990, name: "50 Crédits Temps-Réel" },           // 19.90€
};

export function constructWebhookEvent(
  body: string,
  signature: string
): Stripe.Event {
  if (!process.env.STRIPE_WEBHOOK_SECRET || !stripe) {
    throw new Error("Stripe webhook secret or client not configured");
  }
  return stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  ) as Stripe.Event;
}
