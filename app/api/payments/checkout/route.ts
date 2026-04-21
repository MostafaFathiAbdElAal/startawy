import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth-utils";
import { cookies } from "next/headers";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover", 
});

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    const userPayload = await verifyAuth(token);

    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = userPayload.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { founder: true }
    });

    if (!user || user.type !== 'FOUNDER' || !user.founder) {
      return NextResponse.json(
        { error: "Forbidden: Only Founders can make payments/subscriptions" }, 
        { status: 403 }
      );
    }

    const body = await req.json();
    const { amount, itemName, metadata } = body;
    
    // Ensure all metadata values are strictly strings for Stripe
    const stringifiedMetadata: Record<string, string> = {};
    if (metadata) {
      for (const [key, value] of Object.entries(metadata)) {
        stringifiedMetadata[key] = String(value);
      }
    }

    // Dynamically determine the correct origin from the request's Host header.
    // This correctly handles ALL environments without any hardcoded values:
    //   - http://localhost:3000       → returns http://localhost:3000
    //   - http://192.168.1.10:3000   → returns http://192.168.1.10:3000
    //   - https://your-app.vercel.app → returns https://your-app.vercel.app
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const origin = `${protocol}://${host}`;


    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: itemName || "Subscription / Consultation",
            },
            unit_amount: Math.round(amount * 100), // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}${body.returnTo}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${body.returnTo}?cancelled=true`,
      customer_email: user.email,
      metadata: {
        userId: userId.toString(),
        founderId: user.founder.id.toString(),
        ...stringifiedMetadata, // type (subscription/consultation), consultantId, date, time etc.
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) { // Changed error to err for typed catching
    const error = err as Error; // Typed error catching
    console.error("Stripe Checkout Error:", error.message); // Log error message
    return NextResponse.json({ error: "Could not create checkout session" }, { status: 500 });
  }
}
