import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { fulfillPayment } from "@/lib/payments/fulfillment";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  console.log("[WEBHOOK] Received a request");
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    if (!webhookSecret) {
      console.warn("[WEBHOOK] No webhook secret found, parsing raw body");
      event = JSON.parse(body) as Stripe.Event;
    } else {
      console.log("[WEBHOOK] Verifying signature...");
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log(`[WEBHOOK] Signature verified, event type: ${event.type}`);
    }
  } catch (err) {
    const error = err as Error;
    console.error(`[WEBHOOK] Signature verification failed: ${error.message}`);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log(`[WEBHOOK] Attempting fulfillment for session ${session.id}`);
    
    try {
      await fulfillPayment(session);
      console.log(`[WEBHOOK] Fulfillment successful for session ${session.id}`);
    } catch (error) {
      console.error("[WEBHOOK] Fulfillment failed:", error);
      return NextResponse.json({ error: "Fulfillment failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
