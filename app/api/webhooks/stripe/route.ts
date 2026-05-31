import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { fulfillPayment } from "@/lib/payments/fulfillment";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  console.log("[WEBHOOK] Received a request");
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;

  if (!webhookSecret) {
    console.error("[WEBHOOK] Critical Configuration Error: STRIPE_WEBHOOK_SECRET is not defined");
    return NextResponse.json({ error: "Webhook configuration error" }, { status: 500 });
  }

  if (!signature) {
    console.error("[WEBHOOK] Error: Missing stripe-signature header");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    console.log(`[WEBHOOK] Verifying signature... (Using secret starting with: ${webhookSecret.substring(0, 10)}...)`);
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log(`[WEBHOOK] Signature verified, event type: ${event.type}`);
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
