/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";

export async function fulfillPayment(session: any) {
  const metadata = session.metadata;

  if (!metadata) {
    throw new Error("No metadata found in session");
  }

  const type = metadata.type;
  const founderId = parseInt(metadata.founderId);
  const amount = session.amount_total ? session.amount_total / 100 : 0;

  console.log(`[FULFILLMENT] Starting fulfillment for session ${session.id}, type: ${type}`);

  try {
    if (type === "consultation") {
      const consultantId = parseInt(metadata.consultantId);
      const dateStr = metadata.date;
      const time = metadata.time;

      const sessionDate = new Date(dateStr);

      // Check if session already exists to avoid duplication
      const existingSession = await prisma.session.findFirst({
        where: { notes: { contains: session.id } }
      });

      if (existingSession) {
        console.log(`[FULFILLMENT] Session ${session.id} already fulfilled (Consultation).`);
        return true;
      }

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
      
      console.log(`[FULFILLMENT] Success: Consultation created for founder ${founderId}`);

    } else if (type === "subscription") {
      const planName = metadata.planName;

      // Check if payment with this session ID already exists to avoid duplication
      // (Using session.id in comments or a new field if available, but for now we look for amount and type)
      // Actually, better to check for matching Subscription status if possible
      const existingPayment = await prisma.payment.findFirst({
        where: { 
          founderId: founderId,
          paymentType: planName,
          transDate: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
        }
      });

      if (existingPayment) {
        console.log(`[FULFILLMENT] Payment for ${planName} already exists for founder ${founderId}. Checking subscription...`);
        const sub = await prisma.subscription.findUnique({
          where: { paymentId: existingPayment.id }
        });
        if (sub && sub.status === 'ACTIVE') {
          console.log(`[FULFILLMENT] Subscription already ACTIVE for session ${session.id}.`);
          return true;
        }
      }

      // 1. Record Payment
      const payment = await prisma.payment.create({
        data: {
          founderId: founderId,
          paymentType: planName,
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
      
      console.log(`[FULFILLMENT] Success: ${planName} subscription activated for founder ${founderId}`);
    }
    return true;
  } catch (dbError) {
    console.error("[FULFILLMENT] Database error during fulfillment:", dbError);
    throw dbError;
  }
}
