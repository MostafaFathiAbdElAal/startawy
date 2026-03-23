import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    if (!webhookSecret) {
      // For local testing without secret during early debug
      event = JSON.parse(body) as Stripe.Event;
    } else {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    }
  } catch (err) {
    const error = err as Error;
    console.error(`Webhook signature verification failed: ${error.message}`);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata;

    if (!metadata) {
      return NextResponse.json({ error: "No metadata found" }, { status: 400 });
    }

    const type = metadata.type;
    const founderId = parseInt(metadata.founderId);
    const amount = session.amount_total ? session.amount_total / 100 : 0;

    try {
      if (type === "consultation") {
        const consultantId = parseInt(metadata.consultantId);
        const dateStr = metadata.date;
        const time = metadata.time;

        const sessionDate = new Date(dateStr);

        // 1. Create Consultation Session
        const consultation = await prisma.session.create({
          data: {
            founderId: founderId,
            consultantId: consultantId,
            date: sessionDate,
            duration: "1 Hour",
            notes: `Booked via Stripe (Session: ${session.id}). Slot: ${time}`,
            paymentStatus: "COMPLETED",
          },
        });

        // 2. record Payment
        await prisma.payment.create({
          data: {
            founderId: founderId,
            sessionId: consultation.id,
            paymentType: "Consultation",
            paymentMethod: "Stripe",
            amount: amount,
            transDate: new Date(),
          },
        });
      } else if (type === "subscription") {
        const planName = metadata.planName;

        // 1. Record Payment
        const payment = await prisma.payment.create({
          data: {
            founderId: founderId,
            paymentType: planName, // Fix: Store actual plan name, e.g., 'Premium Plan', instead of generic 'Subscription'
            paymentMethod: "Stripe",
            amount: amount,
            transDate: new Date(),
          },
        });

        // 2. Create Subscription
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);

        await prisma.subscription.create({
          data: {
            paymentId: payment.id,
            status: "ACTIVE",
            trialType: planName === "Free Trial" ? "TRIAL" : "PAID",
            startDate: startDate,
            endDate: endDate,
          },
        });
      }
    } catch (dbError) {
      console.error("Database error during webhook fulfillment:", dbError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
