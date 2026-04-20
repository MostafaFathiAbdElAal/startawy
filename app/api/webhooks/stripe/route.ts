import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { fulfillPayment } from "@/lib/payments/fulfillment";
import fs from "fs";
import path from "path";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

function logWebhook(message: string) {
  const logPath = path.join(process.cwd(), "webhook_debug.log");
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);
}

export async function POST(req: NextRequest) {
  logWebhook("Webhook received a request");
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    if (!webhookSecret) {
      logWebhook("No webhook secret found, using raw body");
      event = JSON.parse(body) as Stripe.Event;
    } else {
      logWebhook("Verifying signature...");
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logWebhook(`Signature verified, event type: ${event.type}`);
    }
  } catch (err) {
    const error = err as Error;
    logWebhook(`Webhook signature verification failed: ${error.message}`);
    console.error(`Webhook signature verification failed: ${error.message}`);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    logWebhook(`Attempting fulfillment for session ${session.id}`);
    
    try {
      await fulfillPayment(session);
      logWebhook(`Fulfillment successful for session ${session.id}`);
    } catch (error) {
      logWebhook(`Fulfillment failed: ${error}`);
      console.error("Webhook fulfillment failed:", error);
      return NextResponse.json({ error: "Fulfillment failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

